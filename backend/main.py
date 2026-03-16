import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from models import SearchRequest, SearchResponse
from llm import parse_query, reformat_recipes
from search import search_recipes

TOP_K = 3

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


@app.post("/search", response_model=SearchResponse)
def search(request: SearchRequest):
    logger.info(f"Received query: {request.query!r}")

    parsed = parse_query(request.query)
    if "error" in parsed:
        logger.warning(f"Query parse error: {parsed['error']}")
        return SearchResponse(error=parsed["error"])

    search_string = parsed.get("search_string", request.query)
    recipes = search_recipes(parsed, search_string)

    if not recipes:
        return SearchResponse(error="No matching recipes found. Try different ingredients or remove some filters.")

    top_recipes = recipes[:TOP_K]
    results = reformat_recipes(top_recipes, request.query)
    logger.info(f"Returning {len(results)} formatted recipes")
    return SearchResponse(results=results)


@app.get("/health")
def health():
    return {"status": "ok"}


app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")
