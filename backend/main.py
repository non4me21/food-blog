import json
import logging
import os
import redis
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models import SearchRequest, SearchResponse
from llm import parse_query, reformat_recipes
from search import search_recipes

TOP_K = 3
CACHE_TTL = 60 * 60 * 24 * 7  # 7 days

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Recipe Search API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_redis = None


def get_redis():
    global _redis
    if _redis is None:
        url = os.getenv("REDIS_URL")
        if url:
            _redis = redis.from_url(url)
            logger.info(f"Connected to Redis at {url}")
    return _redis


@app.post("/search", response_model=SearchResponse)
def search(request: SearchRequest):
    logger.info(f"Received query: {request.query!r}")

    cache_key = f"search:{request.query.lower().strip()}"
    r = get_redis()
    if r:
        try:
            cached = r.get(cache_key)
            if cached:
                logger.info("Cache HIT")
                return SearchResponse(results=json.loads(cached))
        except Exception as e:
            logger.warning(f"Redis read failed: {e}")

    parsed = parse_query(request.query)
    if "error" in parsed:
        logger.warning(f"Query parse error: {parsed['error']}")
        return SearchResponse(error=parsed["error"])

    search_string = parsed.get("search_string", request.query)
    recipes = search_recipes(parsed, search_string)

    if not recipes:
        return SearchResponse(error="No matching recipes found. Try different ingredients or remove some filters.")

    top_recipes = recipes[:TOP_K]
    language = parsed.get("language", "en")
    results = reformat_recipes(top_recipes, request.query, language)

    if r:
        try:
            r.set(cache_key, json.dumps(results), ex=CACHE_TTL)
            logger.info("Cache SET")
        except Exception as e:
            logger.warning(f"Redis write failed: {e}")

    logger.info(f"Returning {len(results)} formatted recipes")
    return SearchResponse(results=results)


@app.get("/health")
def health():
    return {"status": "ok"}

