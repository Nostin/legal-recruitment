
---

# `AGENT_GUIDE.md`

```md
# Agent Guide

This file exists to help future agent runs make safe, scoped changes to OpenCourt.

## Read This First

Before making changes:
1. read `SYSTEM_OVERVIEW.md`
2. read the architecture or feature phase doc relevant to the work
3. inspect the repo structure
4. summarize a short implementation plan before editing

---

## Core Rules

- do not begin large refactors unless explicitly asked
- do not redesign the UI unless explicitly asked
- do not upgrade unrelated dependencies unless required
- do not change the stack without explicit instruction
- keep changes minimal, reviewable, and explicit
- prefer structured fields over flattening important data into generic text
- follow existing patterns where possible
- verify changes before claiming completion

---

## Working Style

Agents should:
- implement in phases
- verify after each phase
- report blockers clearly
- distinguish between:
  - code implemented
  - runtime verified
  - manual verification still required

Do not overclaim success when runtime checks were not actually performed.

---

## Scope Discipline

When working on a task:
- only change what is required for that task
- do not “clean up” unrelated parts of the app
- do not touch auth/bootstrap unless the task explicitly requires it
- do not touch candidate flow, firm flow, jobs, or intro requests outside the scoped change unless a minimal shared fix is required

---

## Verification Expectations

When possible, verify using:
- backend runtime checks
- direct API calls
- frontend build checks
- lint on modified files
- database queries for persistence

If a verification step cannot be run, say so explicitly.

Do not infer runtime success from file generation alone.

---

## Backend Safety Rules

- use explicit REST routes
- prefer simple request/response schemas
- prefer explicit SQLAlchemy models
- keep Alembic migrations clean and focused
- add foreign keys where appropriate
- do not invent speculative service layers

---

## Frontend Safety Rules

- do not reintroduce Vite or react-router patterns
- keep App Router conventions
- use one explicit backend API base URL
- do not hardcode multiple backend ports/hosts
- prefer structured backend fields over parsing summary blobs
- do not invent new pages or controls unless explicitly required

---

## Authentication Rules

- Clerk handles sign-in
- local DB handles app user/account type
- do not redesign auth unless explicitly asked
- do not break LocalUserProvider/bootstrap logic casually
- account type in local DB is the source of truth

See `AUTHENTICATION.md`.

---

## Database Rules

- local PostgreSQL is used in development
- verify DB connectivity before migration/seed work
- do not assume the DB is reachable without proving it
- when required, inspect tables directly using `psql`

See `DATABASE_SCHEMA.md`.

---

## Quality Bar

A task is not complete just because code compiles.

A task is complete when:
- the code changes are scoped and sensible
- verification steps were actually run
- results were reported honestly
- manual follow-up, if still needed, is explicitly called out