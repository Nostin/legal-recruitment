# Phase 10 — Jobs Foundation

## Goal
Introduce the jobs/opportunities domain so firms can create, edit, and remove job opportunities.

This phase creates the backend and frontend foundation for jobs, but does not yet implement the full candidate job-interest workflow.

---

## In Scope

### Jobs database foundation
Create the database support needed for firm-posted job opportunities.

The schema should support at minimum:

- firm ownership
- job title / role title
- location
- practice area
- position / role description
- salary range or salary band
- work arrangement (remote / hybrid / onsite or equivalent)
- posted date / created date
- job status suitable for open vs removed/closed handling
- timestamps

Use a sensible relational model with explicit foreign keys.

### Backend
Implement backend support for jobs:
- create job
- read job
- update job
- remove / close job

Keep the API RESTful and explicit.

### Firm-side frontend
Add firm-facing UI so firms can:
- create a job/opportunity
- edit an existing job
- remove or close an existing job

### Header/nav support
The firm header should include:
- Add Opportunity

In this phase, that route should lead to the real create-job flow.

### Routing update
Rename or separate current browse routes as needed so the app can clearly support:
- candidate talent browsing
- job browsing

However, do this minimally and intentionally. Do not churn routing unnecessarily.

---

## Out of Scope

Do **not** implement any of the following in this phase:

- candidate express-interest flow for jobs
- saved jobs
- saved candidates
- interaction history
- notifications about jobs
- email delivery
- advanced job analytics
- admin features
- billing
- major UI redesign
- broad app-shell redesign beyond what is minimally needed to surface jobs

---

## Frontend and Backend Preflight

Before making changes, verify and report:

- pwd in `./frontend`
- pwd in `./backend`
- frontend dev server can run
- backend API is reachable from the frontend environment
- the frontend API base URL currently being used
- existing firm onboarding and dashboard still work before changes
- existing candidate browse/search flow still works before changes

If the backend API base URL is environment-specific, report the exact value in use.

---

## Jobs Data Model Requirements

Design a simple, explicit jobs model.

### Required principles
- use explicit foreign keys to the relevant firm profile or owning user
- use explicit structured fields
- do not flatten important job data into a single summary blob
- prefer a single simple status field over multiple overlapping booleans
- keep it minimal and aligned to the prototype and notes

### Suggested minimum fields
At minimum, support structured fields for:

- firm_profile_id or equivalent ownership reference
- title / role_title
- location
- practice_area
- description
- salary_min / salary_max or salary_band
- work_arrangement
- posted_at / created_at
- status

You may add other clearly necessary fields if the current app notes demand them, but do not overengineer.

---

## Backend Requirements

Implement jobs-related backend endpoints.

A sensible minimum set would include:

- `GET /jobs`
- `GET /jobs/{id}`
- `POST /jobs`
- `PUT /jobs/{id}`
- `PATCH /jobs/{id}` or equivalent for status changes
- optional delete/close behavior if represented as status rather than physical deletion

Use the minimum endpoint set required by the current UI and scope.

### Backend rules
- keep code simple
- prefer explicit code over abstraction
- do not introduce speculative workflow engines
- add validation schemas
- return sensible errors for invalid ownership, invalid state, and missing jobs

---

## Frontend Requirements

### Firm-side jobs management
Implement the firm-side flow for:
- creating a job
- editing a job
- removing/closing a job

Use existing UI patterns where possible.

### Navigation
Ensure the firm header includes:
- Add Opportunity

This should navigate to the create-job flow.

### Route naming
Where appropriate, rename the current search page to be more explicit, such as:
- `candidate-search`

and prepare the app for a separate:
- `jobs-search`

However:
- do not do unnecessary routing churn
- keep route changes minimal and coherent
- preserve existing working browse functionality

---

## Validation and Errors

Add sensible validation and user-facing errors for job create/edit/remove flows.

At minimum:
- required fields must be validated
- invalid submissions must show useful errors
- backend/API errors must surface sensibly in the UI

---

## Constraints

- keep code simple
- prefer explicit code over abstraction
- do not redesign the app
- do not modify Clerk auth, LocalUserProvider, or user bootstrap logic except where a minimal shared fix is strictly required
- do not modify candidate onboarding/profile flows except where a minimal shared routing/header change is strictly required
- do not implement candidate express-interest in this phase
- do not add speculative jobs-related notification or messaging systems

---

## Suggested Work Order

1. inspect current firm UI and routing
2. design the jobs schema
3. add SQLAlchemy model(s) and migration(s)
4. add validation schemas
5. implement backend jobs routes
6. add firm-side jobs API module in frontend
7. wire Add Opportunity navigation
8. implement create/edit/remove job UI
9. make any minimal route naming updates required
10. run verification
11. fix issues and verify again

---

## Verification Requirements

You must run and report:

### Database
- jobs table/schema exists
- foreign keys are correct
- example rows persist correctly
- inspect the resulting jobs table schema
- inspect example rows after create/update/remove or close operations

### Backend/API
- job create works
- job read works
- job update works
- job remove/close works according to the chosen model
- errors for invalid job operations are sensible

### Frontend
- firm user can access Add Opportunity
- firm user can create a job
- firm user can edit a job
- firm user can remove/close a job
- existing firm dashboard and candidate browse flows still work

### Frontend quality
- modified frontend files lint clean
- frontend build/typecheck passes where configured
- report any pre-existing unrelated lint issues separately rather than fixing unrelated files

---

## Completion Requirements

When complete, report:

1. completed checklist items
2. incomplete items or blockers
3. exact verification commands run
4. result of each verification step
5. exact mapping from the job/opportunity UI fields to database columns
6. any UI fields that do not yet have a suitable database destination