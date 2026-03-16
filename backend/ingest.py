"""
One-time script to load the recipe dataset into ChromaDB.
Run once: python ingest.py
"""
import logging
import pandas as pd
import chromadb
from chromadb.config import Settings
from embeddings import embed_text

CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "recipes"
DATASET_PATH = "./data/recipes.csv"
BATCH_SIZE = 100

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

BOOL_FIELDS = [
    "is_vegan", "is_vegetarian", "is_halal", "is_kosher",
    "is_nut_free", "is_dairy_free", "is_gluten_free",
]


def safe_str(val):
    if pd.isna(val):
        return ""
    return str(val)


def safe_int(val):
    try:
        return int(val)
    except (ValueError, TypeError):
        return 0


def main():
    logger.info(f"Loading dataset from: {DATASET_PATH}")
    df = pd.read_csv(DATASET_PATH)
    logger.info(f"Dataset loaded: {len(df)} rows")

    client = chromadb.PersistentClient(path=CHROMA_PATH, settings=Settings(anonymized_telemetry=False))
    try:
        client.delete_collection(name=COLLECTION_NAME)
        logger.info("Deleted existing collection")
    except Exception:
        pass
    collection = client.create_collection(name=COLLECTION_NAME)
    logger.info(f"Created collection: {COLLECTION_NAME}")

    documents = []
    metadatas = []
    ids = []
    embeddings = []

    for i, row in df.iterrows():
        ingredient_text = safe_str(row.get("ingredient_text"))
        if not ingredient_text:
            continue

        prep_min = safe_int(row.get("est_prep_time_min"))
        cook_min = safe_int(row.get("est_cook_time_min"))
        total_min = prep_min + cook_min

        metadata = {
            "recipe_name": safe_str(row.get("recipe_title")),
            "directions": safe_str(row.get("directions_text")),
            "prep_time": f"{prep_min} min",
            "cook_time": f"{cook_min} min",
            "total_time": f"{total_min} min",
            "total_time_minutes": total_min,
            "cuisine": safe_str(row.get("cuisine_list")),
            "category": safe_str(row.get("category")),
            "difficulty": safe_str(row.get("difficulty")),
            "cook_speed": safe_str(row.get("cook_speed")),
            "main_ingredient": safe_str(row.get("main_ingredient")),
            "primary_taste": safe_str(row.get("primary_taste")),
            "dietary_profile": safe_str(row.get("dietary_profile")),
            "healthiness_score": safe_int(row.get("healthiness_score")),
            "health_level": safe_str(row.get("health_level")),
        }
        for field in BOOL_FIELDS:
            val = row.get(field)
            metadata[field] = 1 if val is True or str(val).lower() == "true" else 0

        documents.append(ingredient_text)
        metadatas.append(metadata)
        ids.append(f"recipe_{i}")
        embeddings.append(embed_text(ingredient_text))

        if (i + 1) % BATCH_SIZE == 0:
            collection.add(documents=documents, metadatas=metadatas, ids=ids, embeddings=embeddings)
            logger.info(f"Inserted batch up to row {i + 1}")
            documents, metadatas, ids, embeddings = [], [], [], []

    if documents:
        collection.add(documents=documents, metadatas=metadatas, ids=ids, embeddings=embeddings)
        logger.info(f"Inserted final batch ({len(documents)} records)")

    logger.info(f"Ingestion complete. Total recipes indexed: {collection.count()}")


if __name__ == "__main__":
    main()
