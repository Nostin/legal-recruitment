# OpenCourt System Overview

## Product Summary
OpenCourt is a legal recruitment platform.

It supports two account types:

- **candidate** — lawyers who create an anonymous profile
- **firm** — law firms that browse talent, request introductions, and manage jobs

The MVP supports:

- candidate onboarding and profile editing
- firm onboarding and profile editing
- candidate browse/search/filter for firms
- introduction requests from firms to candidates
- firm-created job opportunities
- candidate-side job browsing and related flows where implemented
- Clerk-based passwordless authentication
- local application user bootstrap in the OpenCourt database

---

## High-Level Architecture

### Frontend
- **Next.js**
- App Router
- Clerk for authentication
- role-aware UI for candidate vs firm
- frontend API modules calling the FastAPI backend

### Backend
- **FastAPI**
- REST-style endpoints
- SQLAlchemy models
- Alembic migrations
- PostgreSQL database

### Database
- PostgreSQL
- local dev first
- structured relational schema
- foreign keys between users, profiles, jobs, and introduction requests

### Authentication
- Clerk handles sign-in/sign-up
- the OpenCourt database stores the local app user record
- `account_type` in the local database is the source of truth for whether the user is a candidate or a firm

---

## Repository Structure

```text
frontend/   # Next.js frontend
backend/    # FastAPI backend
```

### Frontend key areas
- app/ — route-based UI
- app/components/ — shared app components
- lib/ — API helpers and client-side integration modules

### Backend key areas
- app/main.py — FastAPI app entrypoint
- app/models/ or app/models/__init__.py — SQLAlchemy models
- app/routes/ — API routes
- app/schemas/ — request/response schemas
- alembic/ — migrations
- scripts/seed.py — local seed data

---

## Core User Flows
### 1. Candidate flow

A lawyer:

1. signs in via Clerk
2. gets or creates a local OpenCourt user record
3. chooses candidate account type if needed
4. completes or updates their profile
5. controls availability and blocked firms in settings
6. can receive and respond to introduction requests

### 2. Firm flow

A firm user:

1. signs in via Clerk
2. gets or creates a local OpenCourt user record
3. chooses firm account type if needed
4. completes or updates firm profile
5. browses/searches candidates
6. sends introduction requests
7. creates and manages jobs/opportunities

### 3. Introduction request flow

A firm:

1. browses candidates
2. submits an introduction request with structured role details

A candidate:

1. sees requests in notifications
2. accepts or declines
3. request state is persisted in the database

### 4. Jobs flow

A firm:

2. creates a job/opportunity
2. edits or closes/removes it later

Candidates can browse jobs where that flow has been implemented in the MVP.

---

## Account Types

The app has two account types:

- candidate
- firm

This value is stored in the local users table and should be treated as the source of truth for app behavior.

Clerk authentication alone does not determine business role.

---

## API Base URL

The frontend uses a configured backend API base URL, typically from:

```
NEXT_PUBLIC_API_URL
```

In local development this has commonly been set to something like:

```
http://127.0.0.1:8766
```

The frontend should use one consistent backend base URL and should not mix ports or localhost / 127.0.0.1 values arbitrarily.

---

## Design Principles
- keep code simple
- prefer explicit code over abstraction
- preserve structured data instead of flattening into generic text - where possible
- avoid speculative architecture
- keep frontend and backend changes minimal and reviewable
- keep the MVP truthful: no fake sections that appear implemented when they are not

---

## Current MVP Scope

Implemented or substantially implemented:

- auth
- local user bootstrap
- candidate profile management
- firm profile management
- candidate search/filter/browse
- introduction requests
- jobs foundation and firm jobs management
- blocked firms UX
- role-aware header/app shell

Intentionally deferred or out of scope:

- messaging/chat
- email notifications
- billing
- admin features
- advanced analytics
- full interaction history
- broad saved-candidates system unless later added

---

## Running the App Locally
### Backend

Typical pattern:

```
cd backend
source .venv/bin/activate
alembic upgrade head
python scripts/seed.py
uvicorn app.main:app --host 127.0.0.1 --port 8766
```

### Frontend

Typical pattern:

```
cd frontend
npm run dev
```

### Frontend env

Typical local env values include:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8766
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

---

## What to Read Next

For more specific implementation guidance, see:

- AGENT_GUIDE.md
- AUTHENTICATION.md
- DATABASE_SCHEMA.md