# Phase 5 — Candidate Frontend Integration

## Goal
Connect the candidate-related frontend screens to the real backend and remove candidate mock data from the candidate flow.

This phase makes the candidate flow real in the UI.

---

## In Scope

### Frontend API layer
Create a simple frontend API layer for calling the backend candidate endpoints.

### Candidate screen integration
Connect the candidate-related frontend screens to the real API:

- candidate list
- candidate detail
- candidate create flow
- candidate edit flow

### Remove mock data
Remove fake/mock candidate data only for candidate-related screens covered by this phase.

### Validation and user errors
Add sensible form validation and clear user-facing error messages.

### Minimal shared cleanup
You may extract only obvious shared layout components if duplication is clear and reused in 2 or more places.

Save shared components in:

```
./frontend/app/components
```

## Out of Scope

Do not implement:

- firm frontend integration
- intro requests
- notifications
- email sending
- backend auth verification
- major redesigns
- broad frontend refactors unrelated to candidate integration

## Implementation Requirements

### UI preservation

Keep the existing UI structure and styling as intact as possible.

Do not redesign the candidate flow.

### Data fetching

Use a sensible simple API integration pattern.

Keep it explicit and easy to follow.

### Validation

- validate candidate create/edit inputs sensibly
- display useful error states
- reuse existing visual patterns where possible

### Candidate pages

By the end of this phase, the candidate UI must use real backend data rather than the original mock data for the relevant screens.

## Suggested Work Order

1. inspect candidate frontend screens and current mock data usage
2. create candidate API layer
3. connect candidate list
4. connect candidate detail
5. connect candidate create
6. connect candidate edit
7. add validation and error handling
8. remove candidate mock data from integrated screens
9. run verification
10. fix issues and verify

## Constraints
- keep code simple
- do not redesign UI
- do not rewrite unrelated frontend code
- extract only obvious shared pieces
- do not begin firm integration yet

## Verification Requirements

You must run and report:

### Frontend functionality

- frontend installs and runs locally
- candidate list loads from database
- candidate detail loads from database
- candidate create persists to database
- candidate edit persists to database

### Validation/error handling

- validation errors display sensibly
- API/network errors are handled sensibly

### Frontend quality

- frontend lint passes
- frontend build/typecheck passes where configured

### Completion Requirements

When complete, report:

1. completed checklist items
2. incomplete items or blockers
3. exact verification commands run
4. result of each verification step