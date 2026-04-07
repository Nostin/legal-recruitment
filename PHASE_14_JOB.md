# Phase 14 — Job Applications and Saved Candidates

## Goal
Complete the next layer of candidate-to-firm interaction by implementing job applications and firm-side visibility of those applications, while also formalizing saved candidates in the product.

This phase turns the candidate “I am interested” action into a persisted application flow and ensures firms can see those applications in notifications and/or dashboard surfaces.

---

## In Scope

### 1. Job applications persistence
Implement backend/database support for candidate job applications.

The model should support:
- the relevant job
- the candidate profile or candidate user
- the relevant firm/firm profile via the job
- a simple application status if required
- timestamps
- optional candidate message only if clearly required by the UI

Keep the model simple and explicit.

### 2. Candidate application action persistence
The candidate `I am interested` flow should create a real persisted job application.

Requirements:
- prevent duplicate applications where appropriate
- keep validation sensible
- use real candidate/job relationships

### 3. Firm notifications for job applications
Job applications should appear in the firm’s notifications area if that is the chosen UI destination.

Requirements:
- use real backend data
- do not leave fake notification placeholders
- keep the jobs-application notification presentation minimal and clear

### 4. Dashboard visibility for job applications
A firm should be able to see job applications on the dashboard in a sensible way.

Requirements:
- use real backend data
- keep this minimal and useful
- avoid building a giant application-management system in this phase

### 5. Saved Candidates
Formalize and finish the saved-candidates feature if it was introduced in earlier MVP polish.

Requirements:
- firms can save candidates
- saved candidates persist correctly
- saved candidates appear on the dashboard using real backend data
- duplicate saves are prevented
- save state is reflected correctly in the browse/search UI

---

## Out of Scope

Do **not** implement any of the following in this phase:

- full interaction history beyond what is naturally required
- messaging/chat
- email delivery
- advanced application pipelines
- candidate-facing application history unless already required by the current prototype
- major dashboard redesign
- analytics/reporting
- admin features
- billing

---

## Frontend and Backend Preflight

Before making changes, verify and report:

- pwd in `./frontend`
- pwd in `./backend`
- frontend dev server can run
- backend API is reachable from the frontend environment
- the frontend API base URL currently being used
- candidate opportunities page currently works
- jobs foundation currently works
- firm dashboard currently works
- notifications page currently works

If the backend API base URL is environment-specific, report the exact value in use.

---

## Job Applications Data Requirements

If implementing a `job_applications` table or equivalent:
- use explicit foreign keys
- keep the schema minimal and explicit
- prefer a simple status field rather than many booleans
- prevent duplicate candidate applications to the same job where appropriate

A minimal model may include:
- `job_id`
- `candidate_profile_id`
- `status`
- timestamps

Add other fields only if clearly required.

---

## Saved Candidates Requirements

If saved candidates are not yet fully formalized:
- add the minimal backend/database support needed
- keep the model explicit
- prevent duplicate saves
- use real data in dashboard and search UI

Do not turn this into a full CRM/history system in this phase.

---

## Notifications / Dashboard Requirements

### Notifications
Job applications should be visible to firms in notifications if that is where the product now surfaces them.

### Dashboard
Firm dashboard should show job applications in a truthful, real-data-driven way.

Requirements:
- do not leave fake counts or fake rows
- keep the display minimal
- avoid building complex sorting/triage systems unless already required by the current UI

---

## Constraints

- keep code simple
- prefer explicit code over abstraction
- do not redesign the app
- do not begin large refactors
- do not modify Clerk auth, LocalUserProvider, or user bootstrap logic except where a minimal shared fix is strictly required
- do not redesign jobs CRUD, candidate opportunities, or intro request flows beyond what is minimally required for job applications and saved candidates
- do not introduce messaging, email delivery, or large analytics/history systems

---

## Suggested Work Order

1. inspect current candidate opportunities, notifications, dashboard, and saved-candidate behavior
2. design minimal job-applications persistence
3. add migrations/models/schemas/routes
4. wire candidate “I am interested” action to persistence
5. wire firm notifications for job applications
6. wire dashboard job applications section
7. finalize saved-candidates persistence and dashboard/search visibility if still incomplete
8. run verification
9. fix issues and verify again

---

## Verification Requirements

You must run and report:

### Job applications
- candidate can apply for a job
- application is persisted in the backend/database
- duplicate application prevention works if implemented
- firm can see job applications in the chosen UI surface(s)
- dashboard and/or notifications use real job application data

### Saved candidates
- firm can save a candidate
- saved candidate persists correctly
- duplicate save is prevented
- dashboard shows saved candidates from real backend data
- browse/search UI reflects saved state correctly

### Regression checks
- jobs CRUD still works
- candidate opportunities page still works
- intro request flow still works
- candidate and firm onboarding/profile flows still work

### Frontend quality
- modified frontend files lint clean
- frontend build/typecheck passes where configured
- report any pre-existing unrelated lint issues separately rather than fixing unrelated files

### Backend / DB
- verify new schema/rows/endpoints explicitly
- inspect relevant tables directly after create/update flows

---

## Completion Requirements

When complete, report:

1. completed checklist items
2. incomplete items or blockers
3. exact verification commands run
4. result of each verification step
5. exact mapping from candidate application UI fields to database columns
6. exact mapping from saved-candidate UI behavior to database persistence