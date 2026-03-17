# CLAUDE.md

## Project Overview

Recipe search engine powered by LLMs and semantic search. Users describe in natural language
what ingredients they have, dietary restrictions, and preferences. The system parses the query,
finds matching recipes via vector similarity search, and returns a nicely formatted result.

**Stack:**
- `sentence-transformers` — local embeddings (all-MiniLM-L6-v2)
- `ChromaDB` — vector database
- `FastAPI` — backend API, will be deployed
- `Gemini API` — LLM for query parsing and recipe reformatting

**Dataset:** ~62k recipes CSV
Key fields used: `recipe_title`, `ingredient_text`, `directions_text`, `est_prep_time_min`,
`est_cook_time_min`, `cuisine_list`, `category`, `difficulty`, `cook_speed`, `main_ingredient`,
`primary_taste`, `dietary_profile`, `healthiness_score`, `health_level`,
`is_vegan`, `is_vegetarian`, `is_dairy_free`, `is_gluten_free`, `is_nut_free`, `is_halal`, `is_kosher`

---

## Project Structure

```
project/
├── frontend/
└── backend/
    └── (structure to be determined as project evolves)
```

---

## Architecture

```
User query (natural language)
        ↓
Gemini parses query → { "wanted": [...], "excluded": [...], filters: { max_time, ... } }
        ↓
Embed the query string with sentence-transformers
        ↓
ChromaDB semantic search (n_results=10) + metadata filtering
        ↓
Post-filter: remove recipes containing excluded ingredients
        ↓
Top 3 recipes returned
        ↓
Gemini reformats the best recipe nicely for the user
```

---

## Communication Style

- Explain decisions and alternatives when writing or changing code
- If something is ambiguous, make a decision and explain why — don't ask
- No placeholders — always write fully working code
- Chat in Polish, code and comments in English

## Engineering Mindset

Act as a senior software engineer, not a code generator. Before implementing a request:
- Check constraints and dependencies (platform limits, library support, file sizes, costs)
- If an assumption is wrong or a better approach exists — say so before writing code
- Flag trade-offs explicitly: "this works but has X downside, alternative is Y"
- Never blindly execute instructions that will obviously fail or create problems downstream

---

## Code Style

- Python `snake_case` for variables, functions, modules
- `UPPER_CASE` for all constants (e.g. `API_KEY`, `MODEL_NAME`, `N_RESULTS`)
- Constants go at the top of each file, after imports
- No type hints — they hurt readability here
- Docstrings only where logic is non-obvious
- No tests for now — this is a portfolio project

---

## Configuration & Secrets

- All secrets via `.env` file + `python-dotenv`
- Non-secret constants (model names, paths, limits) as `UPPER_CASE` inline at top of file
- Never hardcode API keys

---

## Error Handling

- If any part of the system fails (ChromaDB, Gemini API, etc.) → return JSON error from API:
  ```json
  { "error": "Description of what went wrong" }
  ```
- If user query makes no sense → Gemini returns JSON error, display error text on frontend
- No silent failures — always surface errors clearly

---

## Logging

- Use Python `logging` module (not `print`)
- Log meaningful events: query received, embedding generated, results found, errors

---

## Dataset Ingestion

- One-time script to load dataset into ChromaDB
- No re-indexing logic needed for now
- Each recipe stored as:
  - `documents` — `ingredient_text` (clean, lowercase, no quantities — used for semantic search)
  - `metadatas` — recipe_name, directions, prep_time, cook_time, total_time, total_time_minutes (int),
                   cuisine, category, difficulty, cook_speed, main_ingredient, primary_taste,
                   dietary_profile, healthiness_score, health_level,
                   is_vegan/is_vegetarian/is_dairy_free/is_gluten_free/is_nut_free/is_halal/is_kosher (0/1 int)
  - `ids` — unique recipe identifier

---

## Deployment

- Backend deployed via FastAPI
- Keep CORS and endpoint structure clean from the start

---

## Git

- Commits per feature
- No need to suggest when to commit

---

## Self-Improving Loop

After every code correction or improvement made by the user, reflect on whether anything
learned should be added to this CLAUDE.md. If yes, propose a specific addition.

Examples of what to capture:
- A pattern the user corrected → add it as a rule
- A library used in a specific way → document it
- A decision made about structure → record it

This file should grow with the project and reflect real decisions, not just initial assumptions.