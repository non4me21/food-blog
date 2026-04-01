# CLAUDE.md

## Project Overview

Food blog with AI-powered recipe search. The blog hosts the owner's own recipes (stored in
PostgreSQL, with photos in object storage). Additionally, users can search a ~62k recipe dataset
using natural language via semantic search powered by LLMs.

**Stack:**
- `Next.js 15` — frontend + blog API routes (App Router, TypeScript, Tailwind CSS)
- `Drizzle ORM` + `postgres.js` — type-safe DB client for Next.js ↔ PostgreSQL
- `PostgreSQL 18` — blog recipes database
- `Railway Bucket` — S3-compatible object storage for recipe photos (Tigris backend)
- `sentence-transformers` — local embeddings (all-MiniLM-L6-v2)
- `ChromaDB` — vector database for AI search (persistent, stored in `backend/persistent/chroma_db/`)
- `FastAPI` — AI search backend API
- `Gemini API` — LLM for query parsing and recipe reformatting
- `Redis` — caching layer for AI search results (7-day TTL)

**Dataset:** ~62k recipes CSV (`backend/persistent/data/recipes.csv`)
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
│   │   ├── admin/             ← Admin panel (protected)
│   │   │   ├── components/    ← DeleteButton, ImageUpload, RecipeForm
│   │   │   ├── categories/    ← Category CRUD pages
│   │   │   ├── recipes/       ← Recipe CRUD pages
│   │   │   ├── login/         ← Auth page
│   │   │   ├── actions.ts     ← All server actions
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx       ← Admin dashboard
│   │   ├── api/upload/        ← Presigned URL generation for S3
│   │   ├── components/        ← CategoryCard, Footer, Navbar, RecipeCard, ShareButton, ScrollProgress
│   │   ├── kategorie/         ← /kategorie + /kategorie/[slug]
│   │   ├── przepisy/          ← /przepisy + /przepisy/[slug]
│   │   ├── przepis-z-ai/      ← AI search page
│   │   ├── layout.tsx
│   │   └── page.tsx           ← Homepage
│   ├── db/
│   │   ├── schema.ts          ← Drizzle table definitions
│   │   ├── index.ts           ← DB client singleton
│   │   └── migrations/        ← generated SQL migrations (drizzle-kit)
│   ├── lib/                   ← shared utilities, API clients
│   ├── Dockerfile
│   ├── drizzle.config.ts
│   └── next.config.ts
├── backend/                   ← FastAPI AI search service
│   ├── main.py                ← FastAPI app, CORS, /search + /health endpoints
│   ├── search.py              ← ChromaDB search logic
│   ├── llm.py                 ← Gemini query parsing + recipe reformatting
│   ├── embeddings.py          ← sentence-transformers embedding
│   ├── ingest.py              ← one-time CSV → ChromaDB ingestion script
│   ├── config.py              ← constants
│   ├── models.py              ← Pydantic request/response models
│   ├── persistent/            ← mounted volume (not committed)
│   │   ├── chroma_db/         ← ChromaDB vector store
│   │   └── data/recipes.csv   ← source dataset
│   ├── requirements.txt
│   └── Dockerfile
├── scripts/
│   ├── dump_railway.sh        ← pg_dump from Railway → scripts/dumps/
│   └── restore_local.sh       ← restore latest dump to local postgres
├── Makefile                   ← make dump / restore / sync / migrate / generate
└── docker-compose.yml
```

---

## Routes

| Route | Type | Description |
|-------|------|-------------|
| `/` | public | Homepage — categories grid + latest recipes |
| `/przepisy` | public | All recipes listing |
| `/przepisy/[slug]` | public | Recipe detail page |
| `/kategorie` | public | Categories listing |
| `/kategorie/[slug]` | public | Recipes filtered by category |
| `/przepis-z-ai` | public | AI-powered recipe search |
| `/api/upload` | API | POST — generates S3 presigned upload URL |
| `/admin` | protected | Admin dashboard |
| `/admin/login` | protected | Admin auth |
| `/admin/recipes/new` | protected | Create recipe |
| `/admin/recipes/[id]/edit` | protected | Edit recipe |
| `/admin/categories` | protected | Manage categories |
| `/admin/categories/[id]/edit` | protected | Edit category |

Admin is protected via a password stored in `ADMIN_PASSWORD` env var, verified with a SHA-256
cookie session token.

---

## Architecture

```
User
  │
  ├── /przepisy, /kategorie, /przepis-z-ai, /
  │       ↓
  │   Next.js (App Router, server components)
  │       ↓
  │   Drizzle ORM → PostgreSQL (own blog recipes)
  │
  ├── /api/upload
  │       ↓
  │   Next.js API route → Railway Bucket (presigned URL)
  │
  └── /przepis-z-ai
          ↓
      Next.js page (client-side fetch via NEXT_PUBLIC_BACKEND_URL)
          ↓ (http://localhost:8000 locally, Railway URL in prod)
      FastAPI AI search
          ↓
      Redis cache check (key = normalized query, TTL = 7 days)
          ↓ (cache miss)
      Gemini parses query → { wanted, excluded, filters }
          ↓
      Embed with sentence-transformers (all-MiniLM-L6-v2)
          ↓
      ChromaDB semantic search (n_results=30) + metadata filtering
          ↓
      Post-filter: excluded ingredients + dietary keywords
          ↓
      Top 3 results → Gemini reformats → JSON response
          ↓
      Store in Redis cache
```

### Photo Storage — Railway Bucket

- Private S3-compatible bucket (Tigris), $0.015/GB-month, egress free
- Public serving via Railway `public-bucket-urls` template (proxy service)
- Upload flow: Next.js API route generates presigned URL → client uploads directly to bucket
- `image_url` stored in DB is the stable proxy URL, not a presigned URL

---

## Services (Docker Compose)

| Service    | Image / Build      | Port | Purpose                        |
|------------|--------------------|------|--------------------------------|
| next-app   | ./frontend         | 3000 | Next.js blog + AI search UI    |
| backend    | ./backend          | 8000 | FastAPI AI search              |
| postgres   | postgres:18-alpine | 5432 | Blog recipes DB                |
| redis      | redis:7-alpine     | —    | AI search cache                |

ChromaDB runs embedded inside the `backend` container (no separate service).
Data persists via a bind mount: `./backend/persistent` → `/app/persistent`.

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

- All secrets via `.env` file in project root + `python-dotenv` (backend) / `process.env` (Next.js)
- Non-secret constants (model names, paths, limits) as `UPPER_CASE` inline at top of file
- Never hardcode API keys
- `.env.example` always up to date

---

## Database (PostgreSQL + Drizzle)

- Drizzle ORM with `postgres.js` driver
- Schema defined in `frontend/db/schema.ts`
- Migration files committed to repo (`frontend/db/migrations/`)
- DB client singleton in `frontend/db/index.ts`

### Migration workflow (run from project root)

```bash
make generate   # generate migration after schema change (drizzle-kit generate)
make migrate    # apply pending migrations to local DB (requires Docker Compose up)
```

`make migrate` automatically rewrites `@postgres` → `@localhost` in `DATABASE_URL`,
because `.env` uses the Docker service hostname which isn't resolvable outside the container.
`drizzle.config.ts` loads `.env` automatically when `DATABASE_URL` is not already set in the environment.

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

- One-time script to load dataset into ChromaDB (`backend/ingest.py`)
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
1. **next-app** — Next.js, single-stage Dockerfile; `npm run build` runs in CMD (not RUN) because
   `next build` calls `generateStaticParams` which queries the DB — the DB is only available at
   runtime, not during `docker build`. Do not move the build step to RUN/image-build time.
   Migrations also run in CMD (`drizzle-kit migrate`) before the build.
2. **backend** — FastAPI, existing Dockerfile
3. **postgres** — Railway managed PostgreSQL
4. **redis** — Railway managed Redis

Plus one Railway Bucket + `public-bucket-urls` proxy template for photo serving.

### DB sync (Railway → local)

```bash
make dump     # pg_dump from Railway to scripts/dumps/
make restore  # restore latest dump to local postgres
make sync     # dump + restore in one step
```

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
