# Phase 8 — Introduction Requests

## Goal
Implement the first real interaction between firms and candidates by adding introduction requests and request status handling.

This phase should make it possible for a firm to request an introduction to a candidate and for the relevant request state to persist.

For this local environment, the backend API base URL is currently:

http://127.0.0.1:8766

Use this exact backend base URL for verification unless the repo configuration explicitly says otherwise.

---

## In Scope

### Database
Create the database support needed for introduction requests.

Use a sensible relational model for introduction requests between:

- firm user / firm
- candidate user / candidate profile

Include a request status model that is simple and explicit.

Reasonable statuses may include:

- pending
- accepted
- declined

Use only what is required by the prototype and the phase.

- use explicit foreign keys to the relevant firm profile/user and candidate profile/user records
- prefer a single simple status field over multiple overlapping booleans
- do not add speculative messaging, comment, or notification tables in this phase

### Backend
Implement backend endpoints required to create and view/update introduction request state.

Choose a sensible RESTful shape based on the existing UI.

### Frontend
Connect the relevant frontend screens so a firm can create an introduction request and the request state can be displayed appropriately.

If the candidate-side UI includes accepting or declining requests, wire that in too.

- only implement the candidate-side accept/decline flow if the current prototype already exposes that interaction
- do not invent new pages or controls that do not already exist in the prototype

### Validation and errors
Add sensible validation and error handling for introduction request actions.

---

## Out of Scope

Do **not** implement:

- outbound email sending
- notification delivery systems
- background jobs
- advanced audit/event tracking beyond what is naturally needed
- backend Clerk token verification unless absolutely required
- major redesigns

---

## Frontend and Backend Preflight

Before making changes, verify and report:

- pwd in ./frontend
- pwd in ./backend
- frontend dev server can run
- backend API is reachable from the frontend environment
- the frontend API base URL currently being used
- the candidate browse endpoint currently responds from the running backend
- Clerk auth still works after Phase 4, 5, 6, 7
- verify that http://127.0.0.1:8766 is reachable from the frontend environment
- report the exact frontend API base URL being used

---

## Implementation Requirements

### Simplicity
Keep the introduction request model simple and explicit.

Do not implement chat, comments, or freeform messaging in this phase.

Do not build a large notification architecture.

### UI preservation
Keep the existing UI structure and styling as intact as possible.

### Minimal required behavior
Implement only what is needed for the current prototype flow.

---

## Suggested Work Order

1. inspect the current intro-request-related UI flows in the frontend
2. design the minimum required schema
3. create migration(s)
4. implement backend endpoints
5. connect firm-side request creation flow
6. connect candidate-side request status flow if present
7. add validation and error handling
8. run verification
9. fix issues and verify

---

## Constraints

- keep code simple
- prefer explicit code over abstraction
- do not build a messaging platform
- do not build email sending in this phase
- do not redesign UI
- only implement the minimum request state needed
- do not modify Clerk auth, LocalUserProvider, or user bootstrap logic except where a minimal shared fix is strictly required
- do not modify candidate create/edit flows, firm onboarding, or browse/search/filter behavior except where a minimal shared change is required to support introduction requests

---

## Verification Requirements

You must run and report:

### Database
- migrations apply successfully
- introduction request records persist correctly
- inspect the resulting introduction_requests table schema
- inspect example rows after create/update and confirm foreign keys and status values are correct

### Backend/API
- introduction request can be created
- introduction request state can be retrieved
- request status can be updated if the relevant UI exists
- a firm can view the introduction requests it created, if the current prototype requires that
- a candidate can view introduction requests relevant to their profile, if the current prototype requires that

### Frontend
- firm can create an introduction request
- candidate can see request state where the prototype supports it
- candidate can accept/decline if the prototype supports it
- UI reflects persisted request status correctly

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