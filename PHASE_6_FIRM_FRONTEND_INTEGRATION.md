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

## Constraints

- keep code simple
- do not redesign UI
- do not rewrite unrelated frontend code
- do not begin intro request work
- do not begin advanced search/filter backend work in this phase

---

## Verification Requirements

You must run and report:

### Frontend functionality
- frontend installs and runs locally
- firm onboarding create flow persists to database
- firm profile retrieval works where applicable
- firm update/edit flow persists to database where applicable

### Validation/error handling
- validation errors display sensibly
- API/network errors are handled sensibly

### Frontend quality
- frontend lint passes
- frontend build/typecheck passes where configured

---

## Completion Requirements

When complete, report:

1. completed checklist items
2. incomplete items or blockers
3. exact verification commands run
4. result of each verification step