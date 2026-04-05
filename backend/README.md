# OpenCourt backend (FastAPI)

Python API for OpenCourt: FastAPI shell, PostgreSQL, Alembic migrations, seed data, and candidate REST endpoints (Phase 2).

## Prerequisites

- Python 3.11+ (3.13 tested)
- PostgreSQL running locally with an empty database (see repo root `ARCHITECTURE.md` for the default URL)

## Setup

From this directory (`backend/`):

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` and set `DATABASE_URL` if yours differs from the example.

## Migrations

Create/update schema (run after model changes):

```bash
source .venv/bin/activate
alembic upgrade head
```

Generate a new revision after editing SQLAlchemy models:

```bash
alembic revision --autogenerate -m "describe_change"
alembic upgrade head
```

## Seed data

After migrations:

```bash
source .venv/bin/activate
python scripts/seed.py
```

Re-running the seed is safe: it upserts the baseline firm, legacy demo candidate, and **all rows** parsed from `../frontend/data/candidates.ts` (see `app/seeds/candidate_fixtures.py` for mapping). Existing `seed_ts_candidate_*` profiles are refreshed on each run.

## Run the API

```bash
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API root: http://127.0.0.1:8000  
- OpenAPI docs: http://127.0.0.1:8000/docs  
- Health: http://127.0.0.1:8000/api/health  

### Candidates (Phase 2)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/candidates` | List candidate profiles |
| GET | `/candidates/{id}` | Get one profile by `candidate_profiles.id` |
| POST | `/candidates` | Create profile (JSON body includes required `user_id` for a **candidate** user) |
| PUT | `/candidates/{id}` | Partial update |

There is no Clerk token verification on these routes in this phase.

## Layout

| Path | Purpose |
|------|---------|
| `app/main.py` | FastAPI application |
| `app/database.py` | `DATABASE_URL`, engine, sessions |
| `app/models/` | SQLAlchemy models |
| `app/schemas/` | Pydantic schemas |
| `app/routes/` | Route modules |
| `alembic/` | Migrations |
| `scripts/seed.py` | Local seed |
| `app/seeds/candidate_fixtures.py` | Static rows aligned with `frontend/data/candidates.ts` |

Swapping the database (e.g. to Neon) only requires changing `DATABASE_URL`; no code changes are required for the connection string itself.
