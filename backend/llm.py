import json
import logging
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-2.5-flash"

PARSE_PROMPT = """You are a recipe search assistant. Parse the user's natural language query into structured JSON.

User query: "{query}"

Return ONLY valid JSON in this exact format:
{{
  "wanted": ["ingredient1", "ingredient2"],
  "excluded": ["ingredient3"],
  "filters": {{
    "max_time": null,
    "is_dairy_free": false,
    "is_vegan": false,
    "is_vegetarian": false,
    "is_gluten_free": false,
    "is_nut_free": false,
    "is_halal": false,
    "is_kosher": false
  }},
  "search_string": "a short description suitable for semantic search"
}}

Rules:
- "wanted": ingredients or food types the user wants
- "excluded": specific ingredients to avoid that are NOT covered by dietary flags below
- "filters.max_time": total time in minutes if the user specified a time limit, otherwise null
- "filters.is_dairy_free": true if user says no dairy, no milk, lactose-free, dairy-free
- "filters.is_vegan": true if user says vegan
- "filters.is_vegetarian": true if user says vegetarian or no meat
- "filters.is_gluten_free": true if user says no gluten, gluten-free, no wheat
- "filters.is_nut_free": true if user says no nuts, nut-free
- "filters.is_halal": true if user says halal
- "filters.is_kosher": true if user says kosher
- "search_string": a clean, concise phrase for embedding-based search
- If the query makes no sense as a food/recipe request, return: {{"error": "Cannot parse as recipe query"}}
- Return ONLY the JSON, no markdown, no explanation"""

REFORMAT_PROMPT = """You are a friendly recipe assistant. The user searched for: "{query}"

Below are {n} recipes. Format each one clearly. After each recipe, output exactly this separator on its own line:
---RECIPE_END---

For each recipe write:
1. A brief intro line mentioning why this matches their request
2. The recipe name as a header
3. Key info (time, difficulty) in a compact line
4. Ingredients as a bullet list
5. Numbered directions
6. One-line note about dietary/health profile

Be concise and practical. Do not add commentary outside the recipe blocks.

{recipes_block}"""

RECIPE_BLOCK_TEMPLATE = """--- Recipe {n} ---
Name: {recipe_name}
Cuisine: {cuisine}
Prep time: {prep_time} | Cook time: {cook_time} | Total time: {total_time}
Difficulty: {difficulty} | Speed: {cook_speed}
Main ingredient: {main_ingredient} | Taste: {primary_taste}
Dietary profile: {dietary_profile}
Health level: {health_level} (score: {healthiness_score})
Ingredients: {ingredients}
Directions: {directions}"""

RECIPES_SEPARATOR = "---RECIPE_END---"

logger = logging.getLogger(__name__)

genai.configure(api_key=GEMINI_API_KEY)
_model = genai.GenerativeModel(GEMINI_MODEL)


def parse_query(user_query):
    logger.info(f"Parsing query with Gemini: {user_query!r}")
    prompt = PARSE_PROMPT.format(query=user_query)
    response = _model.generate_content(prompt)
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    parsed = json.loads(text.strip())
    logger.info(f"Parsed query result: {parsed}")
    return parsed


def reformat_recipes(recipes, user_query):
    logger.info(f"Reformatting {len(recipes)} recipes in one API call")
    blocks = []
    for i, recipe in enumerate(recipes, start=1):
        blocks.append(RECIPE_BLOCK_TEMPLATE.format(
            n=i,
            recipe_name=recipe.get("recipe_name", "Unknown"),
            cuisine=recipe.get("cuisine", "N/A"),
            prep_time=recipe.get("prep_time", "N/A"),
            cook_time=recipe.get("cook_time", "N/A"),
            total_time=recipe.get("total_time", "N/A"),
            difficulty=recipe.get("difficulty", "N/A"),
            cook_speed=recipe.get("cook_speed", "N/A"),
            main_ingredient=recipe.get("main_ingredient", "N/A"),
            primary_taste=recipe.get("primary_taste", "N/A"),
            dietary_profile=recipe.get("dietary_profile", "N/A"),
            health_level=recipe.get("health_level", "N/A"),
            healthiness_score=recipe.get("healthiness_score", "N/A"),
            ingredients=recipe.get("ingredients", "N/A"),
            directions=recipe.get("directions", "N/A"),
        ))
    prompt = REFORMAT_PROMPT.format(
        query=user_query,
        n=len(recipes),
        recipes_block="\n\n".join(blocks),
    )
    response = _model.generate_content(prompt)
    parts = [p.strip() for p in response.text.split(RECIPES_SEPARATOR) if p.strip()]
    return parts
