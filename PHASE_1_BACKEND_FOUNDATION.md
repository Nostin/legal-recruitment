# Phase 1 — Backend Foundation

## Goal
Create the initial backend foundation for OpenCourt.

This phase creates the FastAPI backend, Python environment, base database integration, migration setup, core schema foundation, and seed infrastructure.

This phase does **not** connect the frontend to the backend yet.

---

## In Scope

### Backend scaffold
Create a FastAPI backend in `./backend` with:

- Python 3.x
- local virtual environment at `./backend/.venv`
- `requirements.txt` with minimum required packages
- `.env.example`
- backend `README.md` with exact local setup and run commands

### Backend structure
Create a sensible conventional structure for:

- app entrypoint
- database config
- models
- schemas
- routes
- migrations
- seed script

### Database foundation
Set up database integration for the local PostgreSQL database.

Create initial tables and migrations for:

- users
- candidate_profiles
- firm_profiles

### User model
The `users` table must include at minimum:

- id
- clerk_user_id
- email
- account_type
- created_at / updated_at style timestamps if used consistently

Allowed account type values:

- `candidate`
- `firm`

### Candidate and firm profile foundation
Create initial `candidate_profiles` and `firm_profiles` tables with sensible foreign keys to users.

At this phase, the profile tables may begin with a reasonably inferred initial schema based on the existing UI, but they do not yet need to be finalized to support every frontend field.

### Seed infrastructure
Create a seed mechanism for local development.

It is acceptable if the first pass seed data is minimal, as long as the seed script works and can be extended in later phases.

---

## Out of Scope

Do **not** implement any of the following in this phase:

- frontend integration
- Clerk auth wiring
- candidate CRUD endpoints
- firm CRUD endpoints
- form validation
- search/filtering
- intro requests
- email notifications
- backend auth verification
- redesigns or refactors of frontend UI

---

## Implementation Requirements

### Python environment
- create `./backend/.venv`
- install only the minimum required packages
- keep setup local and simple
- do not use Docker

### Database configuration
- use environment variables
- add `.env.example`
- ensure backend can run against local PostgreSQL
- structure config so swapping to Neon later would be straightforward

### Migrations
- create migration setup
- generate and apply an initial migration for core schema
- keep naming clear and conventional

### Seed script
- create a local seed script
- ensure it can be run after migrations
- document its usage in backend README

---

## Suggested Work Order

1. inspect repo structure
2. create backend folder structure
3. create `.venv`
4. create `requirements.txt`
5. install dependencies
6. set up FastAPI app entrypoint
7. set up DB config
8. set up migrations
9. create models
10. create initial migration
11. create seed script
12. add backend README and `.env.example`
13. run verification and fix issues

---

## Constraints

- keep code simple
- prefer explicit code over abstraction
- use only the minimum required packages
- keep naming conventional
- do not touch frontend except if absolutely required for shared docs or environment clarity
- do not begin future-phase work

---

## Verification Requirements

You must run and report:

### Backend setup
- backend virtual environment created
- dependencies install successfully
- backend service starts locally

### Database
- migration setup works
- initial migration applies successfully
- schema exists in local database

### Seed
- seed script runs successfully

### Documentation
- backend README exists with exact setup and run commands
- `.env.example` exists and is accurate

---

## Completion Requirements

When complete, report:

1. completed checklist items
2. incomplete items or blockers
3. exact verification commands run
4. result of each verification step