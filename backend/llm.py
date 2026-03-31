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
  "search_string": "a short description suitable for semantic search",
  "language": "en"
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
- "search_string": ALWAYS in English — a clean, concise phrase for embedding-based search
- "language": ISO 639-1 code of the user's query language (e.g. "pl", "en", "de")
- If the query makes no sense as a food/recipe request, return: {{"error": "Cannot parse as recipe query"}}
- Return ONLY the JSON, no markdown, no explanation"""

REFORMAT_PROMPT = """You are a recipe assistant. The user searched for: "{query}"

Below are {n} recipes. Return ONLY a valid JSON array with exactly {n} objects. No markdown, no explanation.
{language_instruction}
Each object must have these fields:
- "title": recipe name (string)
- "description": one sentence explaining why this matches the user's request (string)
- "ingredients": list of ingredient strings, each clean and readable (array of strings)
- "directions": list of step strings, each a complete instruction (array of strings)
- "total_time": total time as a readable string e.g. "45 min" (string)
- "difficulty": difficulty level (string)

{recipes_block}"""

RECIPE_BLOCK_TEMPLATE = """--- Recipe {n} ---
Name: {recipe_name}
Prep time: {prep_time} | Cook time: {cook_time} | Total time: {total_time}
Difficulty: {difficulty}
Ingredients: {ingredients}
Directions: {directions}"""

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


def reformat_recipes(recipes, user_query, language="en"):
    logger.info(f"Reformatting {len(recipes)} recipes in one API call (language: {language})")
    blocks = []
    for i, recipe in enumerate(recipes, start=1):
        blocks.append(RECIPE_BLOCK_TEMPLATE.format(
            n=i,
            recipe_name=recipe.get("recipe_name", "Unknown"),
            prep_time=recipe.get("prep_time", "N/A"),
            cook_time=recipe.get("cook_time", "N/A"),
            total_time=recipe.get("total_time", "N/A"),
            difficulty=recipe.get("difficulty", "N/A"),
            ingredients=recipe.get("ingredients", "N/A"),
            directions=recipe.get("directions", "N/A"),
        ))
    language_instruction = f"\nAll text fields in your response must be in the language with ISO 639-1 code: {language}.\n" if language != "en" else ""
    prompt = REFORMAT_PROMPT.format(
        query=user_query,
        n=len(recipes),
        language_instruction=language_instruction,
        recipes_block="\n\n".join(blocks),
    )
    response = _model.generate_content(prompt)
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())
