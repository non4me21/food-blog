import logging
import chromadb
from chromadb.config import Settings
from embeddings import embed_text
from config import CHROMA_PATH, COLLECTION_NAME
N_RESULTS = 30

# Hard ingredient-level post-filters for dietary flags.
# The dataset flags (is_dairy_free etc.) are unreliable, so we check ingredient_text directly.
DIETARY_KEYWORDS = {
    "is_dairy_free": [
        "milk", "butter", "cream", "cheese", "yogurt", "buttermilk",
        "whey", "casein", "lactose", "ghee", "sour cream", "half-and-half",
        "brie", "mozzarella", "cheddar", "parmesan", "ricotta", "kefir",
        "custard", "ice cream", "condensed milk", "evaporated milk",
    ],
    "is_gluten_free": [
        "wheat", "flour", "bread", "pasta", "barley", "rye",
        "semolina", "spelt", "malt", "gluten", "breadcrumb", "panko",
        "couscous", "bulgur", "farro", "triticale",
    ],
    "is_vegan": [
        "meat", "chicken", "beef", "pork", "lamb", "turkey", "fish",
        "shrimp", "salmon", "tuna", "cod", "egg", "milk", "butter",
        "cream", "cheese", "yogurt", "honey", "gelatin", "lard",
        "bacon", "ham", "sausage", "anchovy",
    ],
    "is_nut_free": [
        "almond", "cashew", "walnut", "pecan", "pistachio", "hazelnut",
        "peanut", "macadamia", "pine nut", "chestnut", "brazil nut",
        "nut butter", "almond flour", "marzipan",
    ],
}

logger = logging.getLogger(__name__)

_collection = None


def get_collection():
    global _collection
    if _collection is None:
        logger.info(f"Connecting to ChromaDB at: {CHROMA_PATH}")
        client = chromadb.PersistentClient(
            path=CHROMA_PATH,
            settings=Settings(anonymized_telemetry=False),
        )
        _collection = client.get_collection(name=COLLECTION_NAME)
    return _collection


def search_recipes(parsed_query, query_text):
    """
    Run semantic search against ChromaDB, then post-filter by excluded ingredients.
    Returns up to N_RESULTS matching recipes as a list of metadata dicts.
    """
    collection = get_collection()
    embedding = embed_text(query_text)

    DIETARY_FLAGS = [
        "is_dairy_free", "is_vegan", "is_vegetarian",
        "is_gluten_free", "is_nut_free", "is_halal", "is_kosher",
    ]

    filters = parsed_query.get("filters", {})
    conditions = []

    max_time = filters.get("max_time")
    if max_time is not None:
        conditions.append({"total_time_minutes": {"$lte": int(max_time)}})

    for flag in DIETARY_FLAGS:
        if filters.get(flag):
            conditions.append({flag: {"$eq": 1}})

    if len(conditions) == 0:
        where_filter = None
    elif len(conditions) == 1:
        where_filter = conditions[0]
    else:
        where_filter = {"$and": conditions}

    query_kwargs = {
        "query_embeddings": [embedding],
        "n_results": N_RESULTS,
        "include": ["metadatas", "documents", "distances"],
    }
    if where_filter:
        query_kwargs["where"] = where_filter

    logger.info(f"Querying ChromaDB (n_results={N_RESULTS}, filter={where_filter})")
    results = collection.query(**query_kwargs)

    excluded = [e.lower() for e in parsed_query.get("excluded", [])]

    # Build keyword blacklist from active dietary flags
    keyword_blacklist = []
    for flag, keywords in DIETARY_KEYWORDS.items():
        if filters.get(flag):
            keyword_blacklist.extend(keywords)

    recipes = []
    seen_names = set()
    for metadata, document, distance in zip(
        results["metadatas"][0],
        results["documents"][0],
        results["distances"][0],
    ):
        name = metadata.get("recipe_name", "")
        if name in seen_names:
            logger.info(f"Skipping '{name}' — duplicate")
            continue
        # Use ingredient_text for dietary/exclusion checks (cleaner than combined_text)
        ingredients_lower = metadata.get("ingredient_text", document).lower()
        if any(exc in ingredients_lower for exc in excluded):
            logger.info(f"Skipping '{name}' — excluded ingredient")
            continue
        if any(kw in ingredients_lower for kw in keyword_blacklist):
            logger.info(f"Skipping '{name}' — fails dietary keyword check")
            continue
        seen_names.add(name)
        metadata["ingredients"] = ingredients_lower
        recipes.append(metadata)

    logger.info(f"Found {len(recipes)} recipes after post-filtering")
    return recipes
