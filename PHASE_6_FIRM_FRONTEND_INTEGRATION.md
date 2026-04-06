# Phase 6 — Firm Frontend Integration

## Goal
Connect the firm onboarding/profile-related frontend screens to the real backend and remove firm mock data from the firm flow.

This phase makes the firm onboarding/profile flow real in the UI.

---

## In Scope

### Frontend API layer for firms
Extend or add frontend API calls needed for firm endpoints.

### Firm screen integration
Connect the firm-related frontend screens required by the onboarding/profile flow to the real API.

This includes:

- firm onboarding create flow
- firm profile retrieval where needed
- firm profile edit/update flow where present in the prototype

### Remove mock data
Remove fake/mock firm data only for the firm-related screens covered by this phase.

### Validation and user errors
Add sensible form validation and user-facing error messages for the firm flow.

### UI preservation
Keep the existing UI structure and styling as intact as possible.

---

## Out of Scope

Do **not** implement:

- candidate search/filter backend integration
- intro requests
- notifications
- email sending
- backend auth verification
- major redesigns
- large cross-app refactors

---

## Implementation Requirements

### Firm flow only
Limit this phase to firm onboarding/profile persistence and retrieval.

### Validation
- validate firm onboarding/profile inputs sensibly
- display useful error states
- reuse existing UI patterns where possible

### Minimal shared cleanup
You may extract only obvious shared pieces if duplication is clear and reused in 2 or more places.

---

## Suggested Work Order

1. inspect firm frontend onboarding/profile flow
2. add or extend firm API layer
3. connect firm create flow
4. connect firm retrieval flow as needed
5. connect firm edit flow
6. add validation and error handling
7. remove mock firm data from integrated screens
8. run verification
9. fix issues and verify

---

## Frontend Preflight

Before making changes, verify and report:

- pwd in ./frontend
- frontend dev server can run
- backend API is reachable from the frontend environment
- the frontend API base URL currently being used
- firm endpoints respond from the running backend
- Clerk auth still works after Phase 4 and 5

## Constraints
- keep code simple
- do not redesign UI
- do not rewrite unrelated frontend code
- extract only obvious shared pieces
- do not begin advanced search/filter backend work in this phase
- use a single explicit frontend API base URL configuration
- do not hardcode multiple backend ports or mixed localhost / 127.0.0.1 values across files
- when displaying firm data, prefer structured fields over parsing or reconstructing values
- only integrate the firm-related screens that already exist in the current prototype
- do not invent new pages or flows
- do not modify firm onboarding, candidate search, or candidate-specific UI except where a minimal shared API/helper change is required
- do not modify Clerk auth, LocalUserProvider, or user bootstrap logic except where a minimal shared firm-flow fix is strictly required
- do not flatten important structured firm fields into generic text fields or ad hoc summary strings

---

## Verification Requirements

You must run and report:

### Frontend functionality
- frontend installs and runs locally
- firm onboarding create flow persists to database
- firm profile retrieval works where applicable
- firm update/edit flow persists to database where applicable
- verify in the database that firm create and firm edit operations persisted expected field changes
- if a signed-in firm user already has a firm profile, the existing data is loaded correctly into the onboarding/profile flow
- if a signed-in firm user does not yet have a firm profile, the create flow creates one correctly

### Validation/error handling

- validation errors display sensibly
- API/network errors are handled sensibly

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