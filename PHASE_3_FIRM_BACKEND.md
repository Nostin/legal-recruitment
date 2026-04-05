# Phase 3 — Firm Backend

## Goal
Implement the real firm backend model and firm-related profile endpoints.

This phase makes firm account/profile data real in the backend, but does not yet implement full firm browsing/search workflows.

---

## In Scope

### Firm schema
Inspect the existing frontend firm onboarding flow and determine the fields needed to support it.

Update the database schema as required so `firm_profiles` can support the data captured in the firm onboarding UI.

### Firm API endpoints
Implement the following endpoints:

- `GET /firms/{id}`
- `POST /firms`
- `PUT /firms/{id}`

These endpoints should support the firm onboarding/profile flows needed in later frontend phases.

### Firm create/update behavior
Firm profile create and update must persist correctly to the database.

### Validation and errors
Add validation schemas and sensible backend error responses.

---

## Out of Scope

Do **not** implement:

- frontend integration
- full firm-side search/filter UX
- intro requests
- notifications
- email sending
- backend Clerk token verification
- candidate browsing/search powered by advanced backend query logic
- full multi-user firm organization features beyond the current local user + firm profile model

---

## Implementation Requirements

### Firm modelling
Use the frontend prototype to infer the actual fields needed for firm profile persistence.

Prefer explicit columns over speculative generic fields.

### API design
Keep the backend RESTful and simple.

### Migration updates
If schema changes are needed, create proper migrations.

### Seed data
If useful for local testing, extend seed data with a small number of firm records.

---

## Suggested Work Order

1. inspect frontend firm onboarding flow
2. finalize firm schema needs
3. update models and migrations
4. update or extend seed data
5. implement firm schemas
6. implement firm routes
7. run migrations
8. run seed script
9. test firm endpoints
10. fix issues and verify

---

## Constraints

- keep code simple
- prefer explicit code over abstraction
- do not begin frontend integration in this phase
- do not implement speculative multi-tenant complexity
- only add what is required to support the existing firm profile flow

---

## Verification Requirements

You must run and report:

### Database
- migrations apply successfully after firm schema changes
- firm data exists after seeding if seed data is added

### API
- `GET /firms/{id}` works
- `POST /firms` works
- `PUT /firms/{id}` works

### Backend
- backend starts cleanly after changes

---

## Completion Requirements

When complete, report:

1. completed checklist items
2. incomplete items or blockers
3. exact verification commands run
4. result of each verification step