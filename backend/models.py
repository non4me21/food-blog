from pydantic import BaseModel


class SearchRequest(BaseModel):
    query: str


class RecipeResult(BaseModel):
    title: str
    description: str
    ingredients: list[str]
    directions: list[str]
    total_time: str
    difficulty: str


class SearchResponse(BaseModel):
    results: list[RecipeResult] = None
    error: str = None
