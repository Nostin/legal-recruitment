# OpenCourt System Overview

## Product Summary
OpenCourt is a legal recruitment platform connecting anonymous lawyer candidates with law firms.

It supports two account types:

- **candidate** — lawyers who create and manage an anonymous profile, browse opportunities, receive introduction requests, and express interest in jobs
- **firm** — law firms that create and manage a firm profile, browse talent, send introduction requests, save candidates, create/manage jobs, and review job applications

The MVP now supports:

- candidate onboarding and profile editing
- firm onboarding and profile editing
- role-aware authenticated navigation
- candidate browse/search/filter for firms
- introduction requests from firms to candidates
- saved candidates for firms
- firm-created job opportunities
- candidate opportunities browsing
- candidate job-interest / application submission
- firm-side visibility of job applications on dashboard and notifications
- Clerk-based passwordless authentication with local app-user bootstrap

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
- local development first
- structured relational schema
- foreign keys between users, profiles, introduction requests, jobs, job-interest submissions, and saved candidates

### Authentication
- Clerk manages sign-in/sign-up
- the OpenCourt database stores the local app user record and account type
- the local `users.account_type` field is the source of truth for app behavior

---

## Repository Structure

```text
frontend/   # Next.js frontend
backend/    # FastAPI backend
```

### Frontend key areas
- `app/` — route-based UI
- `app/components/` — shared app components
- `lib/` — API helpers and client-side integration modules

### Backend key areas
- `app/main.py` — FastAPI app entrypoint
- `app/models/__init__.py` — SQLAlchemy models
- `app/routes/` — API routes
- `app/schemas/` — request/response schemas
- `alembic/` — migrations
- `scripts/seed.py` — local seed data

---

## Core User Flows

## 1. Candidate flow
A lawyer:
1. signs in via Clerk
2. gets or creates a local OpenCourt user record
3. chooses candidate account type if needed
4. completes or updates their profile
5. controls availability and blocked firms in settings
6. browses opportunities
7. expresses interest in jobs
8. receives and responds to introduction requests

## 2. Firm flow
A firm user:
1. signs in via Clerk
2. gets or creates a local OpenCourt user record
3. chooses firm account type if needed
4. completes or updates firm profile
5. is redirected to talent search after sign-in
6. browses/searches candidates
7. sends introduction requests
8. saves candidates
9. creates, edits, closes, reopens, and removes jobs
10. sees job applications on dashboard and notifications

## 3. Introduction request flow
A firm:
1. browses candidates
2. submits an introduction request with structured role details
3. sees request state reflected back in search (`Request sent`)

A candidate:
1. sees requests in notifications
2. accepts or declines
3. request state is persisted in the database

## 4. Jobs flow
A firm:
1. creates a job/opportunity
2. edits it later
3. can close it with a reason
4. can reopen or remove it

A candidate:
1. lands on opportunities after sign-in
2. browses open jobs
3. clicks `I am interested`
4. confirms profile submission to the firm

## 5. Saved candidates flow
A firm:
1. saves a candidate from search
2. sees saved candidates on dashboard
3. cannot create duplicate saves for the same candidate

---

## Account Types

The app has two account types:

- `candidate`
- `firm`

This value is stored in the local `users` table and should be treated as the source of truth for app behavior.

Clerk authentication alone does **not** determine business role.

---

## API Base URL

The frontend uses a configured backend API base URL, typically from:

- `NEXT_PUBLIC_API_URL`

In local development this has commonly been set to:

```text
http://127.0.0.1:8766
```

The frontend should use one consistent backend base URL and should not mix ports or `localhost` / `127.0.0.1` values arbitrarily.

---

## Design Principles

- keep code simple
- prefer explicit code over abstraction
- preserve structured data instead of flattening important business fields into generic text where possible
- avoid speculative architecture
- keep frontend and backend changes minimal and reviewable
- keep the MVP truthful: no fake sections that appear implemented when they are not

---

## Current MVP Scope

Implemented or substantially implemented:
- Clerk auth with local user bootstrap
- candidate profile management
- candidate settings including blocked firms
- firm profile management
- candidate search/filter/browse for firms
- introduction requests
- saved candidates
- jobs foundation and firm jobs management
- candidate opportunities page
- candidate job-interest submission
- firm-side visibility of job applications
- role-aware header/app shell

Intentionally deferred or out of scope:
- messaging/chat
- email notifications
- billing
- admin features
- advanced analytics
- full interaction history
- deeper CRM-style firm tooling

---

## Running the App Locally

### Backend
Typical pattern:

```bash
cd backend
source .venv/bin/activate
alembic upgrade head
python scripts/seed.py
uvicorn app.main:app --host 127.0.0.1 --port 8766
```

### Frontend
Typical pattern:

```bash
cd frontend
npm run dev
```

### Frontend env
Typical local env values include:

```text
NEXT_PUBLIC_API_URL=http://127.0.0.1:8766
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

---

## What to Read Next

For more specific implementation guidance, see:

- `AGENT_GUIDE.md`
- `AUTHENTICATION.md`
- `DATABASE_SCHEMA.md`
