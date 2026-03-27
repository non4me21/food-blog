# CLAUDE.md

## Project Overview

Food blog with AI-powered recipe search. The blog hosts the owner's own recipes (stored in
PostgreSQL, with photos in object storage). Additionally, users can search a ~62k recipe dataset
using natural language via semantic search powered by LLMs.

**Stack:**
- `Next.js 15` — frontend + blog API routes (App Router, TypeScript, Tailwind CSS)
- `Drizzle ORM` + `postgres.js` — type-safe DB client for Next.js ↔ PostgreSQL
- `PostgreSQL 16` — blog recipes database
- `Railway Bucket` — S3-compatible object storage for recipe photos (Tigris backend)
- `sentence-transformers` — local embeddings (all-MiniLM-L6-v2)
- `ChromaDB` — vector database for AI search
- `FastAPI` — AI search backend API
- `Gemini API` — LLM for query parsing and recipe reformatting
- `Redis` — caching layer for AI search results

**Dataset:** ~62k recipes CSV
Key fields used: `recipe_title`, `ingredient_text`, `directions_text`, `est_prep_time_min`,
`est_cook_time_min`, `cuisine_list`, `category`, `difficulty`, `cook_speed`, `main_ingredient`,
`primary_taste`, `dietary_profile`, `healthiness_score`, `health_level`,
`is_vegan`, `is_vegetarian`, `is_dairy_free`, `is_gluten_free`, `is_nut_free`, `is_halal`, `is_kosher`

---

## Project Structure

```
project/
├── frontend/                  ← Next.js app
│   ├── app/                   ← App Router pages and layouts
│   ├── db/
│   │   ├── schema.ts          ← Drizzle table definitions
│   │   ├── index.ts           ← DB client singleton
│   │   └── migrations/        ← generated SQL migrations (drizzle-kit)
│   ├── lib/                   ← shared utilities, API clients
│   ├── Dockerfile
│   ├── drizzle.config.ts
│   └── next.config.ts
└── backend/                   ← FastAPI AI search service
    ├── main.py
    ├── search.py
    ├── llm.py
    ├── embeddings.py
    ├── ingest.py
    ├── config.py
    ├── models.py
    ├── requirements.txt
    └── Dockerfile
```

---

## Architecture

```
User
  │
  ├── /blog, /recipes/[slug]
  │       ↓
  │   Next.js (App Router)
  │       ↓
  │   Drizzle ORM → PostgreSQL (own blog recipes)
  │
  └── /search
          ↓
      Next.js API route (/api/search)
          ↓ (internal: http://backend:8000)
      FastAPI AI search
          ↓
      Gemini parses query → { wanted, excluded, filters }
          ↓
      Embed with sentence-transformers
          ↓
      ChromaDB semantic search (n_results=30) + metadata filtering
          ↓
      Post-filter: excluded ingredients + dietary keywords
          ↓
      Top 3 results → Gemini reformats → JSON response
```

### Photo Storage — Railway Bucket

- Private S3-compatible bucket (Tigris), $0.015/GB-month, egress free
- Public serving via Railway `public-bucket-urls` template (proxy service)
- Upload flow: Next.js API route generates presigned URL → client uploads directly to bucket
- `image_url` stored in DB is the stable proxy URL, not a presigned URL

---

## Services (Docker Compose)

| Service    | Image / Build    | Port | Purpose                        |
|------------|------------------|------|--------------------------------|
| next-app   | ./frontend       | 3000 | Next.js blog + AI search UI    |
| backend    | ./backend        | 8000 | FastAPI AI search              |
| postgres   | postgres:16-alpine | 5432 | Blog recipes DB              |
| redis      | redis:7-alpine   | —    | AI search cache                |

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

### Python (backend)
- `snake_case` for variables, functions, modules
- `UPPER_CASE` for all constants (e.g. `API_KEY`, `MODEL_NAME`, `N_RESULTS`)
- Constants go at the top of each file, after imports
- No type hints — they hurt readability here
- Docstrings only where logic is non-obvious

### TypeScript (frontend)
- Standard TypeScript — use types where they add clarity
- `camelCase` for variables and functions, `PascalCase` for components and types
- `UPPER_CASE` for constants
- Tailwind CSS for styling — no CSS modules or styled-components

### General
- No tests for now — this is a portfolio project

---

## Configuration & Secrets

- All secrets via `.env` file + `python-dotenv` (backend) / `process.env` (Next.js)
- Non-secret constants (model names, paths, limits) as `UPPER_CASE` inline at top of file
- Never hardcode API keys
- `.env.example` always up to date

---

## Database (PostgreSQL + Drizzle)

- Drizzle ORM with `postgres.js` driver
- Schema defined in `frontend/db/schema.ts`
- Migrations generated with `drizzle-kit generate`, applied with `drizzle-kit migrate`
- Migration files committed to repo (`frontend/db/migrations/`)
- DB client singleton in `frontend/db/index.ts`

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

## Deployment (Railway)

Four services deployed on Railway:
1. **next-app** — Next.js, `output: "standalone"`, Dockerfile multi-stage build
2. **backend** — FastAPI, existing Dockerfile
3. **postgres** — Railway managed PostgreSQL (or postgres:16-alpine Docker service)
4. **redis** — Railway managed Redis (or redis:7-alpine Docker service)

Plus one Railway Bucket + `public-bucket-urls` proxy template for photo serving.

Keep CORS and endpoint structure clean from the start.

---

## Git

- Commits per feature
- Never commit or push without explicit instruction from the user — wait for "commituj", "push" etc.

---

## Self-Improving Loop

After every code correction or improvement made by the user, reflect on whether anything
learned should be added to this CLAUDE.md. If yes, propose a specific addition.

Examples of what to capture:
- A pattern the user corrected → add it as a rule
- A library used in a specific way → document it
- A decision made about structure → record it

This file should grow with the project and reflect real decisions, not just initial assumptions.
