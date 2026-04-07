# Phase 2 — Candidate Backend

## Goal
Implement the real candidate backend model and candidate-related API endpoints.

This phase finalizes the candidate profile schema based on the existing prototype and exposes candidate CRUD endpoints required by later frontend integration.

---

## In Scope

### Candidate schema
Inspect the existing frontend candidate/profile-builder flow and determine the fields needed to support it.

Update the database schema as required so `candidate_profiles` can support the data captured in the frontend candidate flow.

### Seed candidate data
Add meaningful candidate seed data for local development.

Use this file as a reference source where useful:

```
./frontend/data/candidates.ts
```

### Candidate API endpoints

Implement the following endpoints:

- GET /candidates
- GET /candidates/{id}
- POST /candidates
- PUT /candidates/{id}

### API expectations

The endpoints should:

- use validation schemas
- return sensible response structures
- return sensible error responses
- support the candidate-related frontend views expected later

### Candidate create/update behavior

Candidate create and update must persist correctly to the database.

---

### Out of Scope

Do **not** implement:

- frontend integration
- Clerk auth changes
- firm CRUD
- firm onboarding wiring
- candidate search/filter logic beyond what is naturally needed for GET /candidates
- intro requests
- notifications
- email sending
- backend Clerk token verification

---

## Preflight Check

Before making any backend or database changes, verify database access from the exact execution environment being used for this phase.

Run and report the result of:

- pwd
- whoami
- python --version
- which psql
- psql --version
- echo $DATABASE_URL
- psql "$DATABASE_URL" -c "select current_database(), current_user;"
- psql "$DATABASE_URL" -c "\dt"

If DATABASE_URL is not set, load it from the expected local .env file and report that step explicitly.

Do not assume database access based on previous phases or based on the user’s local terminal.

Do not proceed with migrations or seed steps until database access is verified successfully.

If database access fails, stop and report the exact failure.

---

### Implementation Requirements

#### Candidate modelling

Use the frontend prototype to infer the actual fields that need to be stored.

Prefer explicit columns over generic JSON storage unless there is a very clear reason not to.

#### API design

Keep the backend RESTful and simple.

Do not create speculative abstractions or overbuilt service layers.

### Validation

Add clear request validation and reasonable error handling.

#### Seed data

Seed enough candidates to make local browsing and testing meaningful.

### Suggested Work Order

1. inspect the candidate profile-builder flow in the frontend
2. finalize candidate schema needs
3. update models and create migration(s)
4. update seed script/data
5. implement candidate schemas
6. implement candidate routes
7. run migrations
8. run seed script
9. test candidate endpoints
10. fix issues and verify

### Constraints
- keep code simple
- prefer explicit code over abstraction
- keep API design conventional
- do not touch frontend in this phase unless required for shared typing or configuration
- do not begin firm implementation beyond what is needed for candidate work

### Verification Requirements

You must run and report:

#### Database

- migrations apply successfully after candidate schema changes
- candidate data exists after seed

#### API

- GET /candidates works
- GET /candidates/{id} works
- POST /candidates works
- PUT /candidates/{id} works

#### Backend

- backend starts cleanly after changes

### Completion Requirements

When complete, report:

1. completed checklist items
2. incomplete items or blockers
3. exact verification commands run
4. result of each verification step