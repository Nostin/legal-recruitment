# Phase 7 — Search, Filter, and Browse

## Goal
Implement the law firm-side candidate browsing experience using real backend search/filter/sort behavior.

This phase turns the candidate browsing/search experience into a real backend-driven feature.

---

## In Scope

### Backend browsing/query support
Extend candidate listing behavior so law firms can browse candidates using backend-driven query logic.

Support sensible search/filter/sort behavior based on the existing prototype and UI expectations.

Implement only the filtering and sorting that the current frontend actually needs.

### Frontend integration
Wire the law firm-side candidate browsing/search/filter screens to the real backend query layer.

### Mock data removal
Remove remaining candidate mock data from the browse/search/filter flow covered by this phase.

---

## Out of Scope

Do **not** implement:

- intro requests
- notifications
- email sending
- backend auth verification
- speculative advanced search or ranking systems
- major redesigns
- pagination or infinite scrolling unless clearly required by the current prototype

---

## Implementation Requirements

### Backend browsing/query support
Keep search/filter/sort implementation simple and explicit.

Do not create an overengineered search service.

Extend candidate listing behavior so law firms can browse candidates using backend-driven query logic.

Support sensible search/filter/sort behavior based on the existing prototype and UI expectations.

Implement only the filtering and sorting that the current frontend actually needs.

- use explicit query parameters rather than inventing a generic search DSL
- prefer structured candidate fields over parsing profile_summary

### Frontend integration
Wire the law firm-side candidate browsing/search/filter screens to the real backend query layer.

- use a single explicit frontend API base URL configuration
- do not hardcode multiple backend ports or mixed localhost / 127.0.0.1 values across files
- only integrate the browse/search/filter controls that already exist in the current prototype
- do not invent new pages, controls, or ranking behavior

### Mock data
By the end of this phase, the browse/search/filter candidate UI should no longer rely on mock candidate data.

---

## Suggested Work Order

1. inspect the current firm-side candidate browsing/search/filter UI
2. identify the actual filters/sorts used by the prototype
3. implement backend query support
4. expose or extend candidate list API as needed
5. connect frontend search/filter/sort controls
6. remove remaining mock candidate data from this flow
7. run verification
8. fix issues and verify

---

## Frontend and Backend Preflight

Before making changes, verify and report:

- pwd in ./frontend
- pwd in ./backend
- frontend dev server can run
- backend API is reachable from the frontend environment
- the frontend API base URL currently being used
- the candidate browse endpoint currently responds from the running backend
- Clerk auth still works after Phase 6

## Constraints

- keep code simple
- prefer explicit query logic over abstraction
- implement only the UI-supported filters/sorts
- do not begin intro request functionality
- do not redesign the browse/search UI
- do not modify Clerk auth, LocalUserProvider, or user bootstrap logic except where a minimal shared fix is strictly required
- do not modify firm onboarding, firm dashboard, or candidate create/edit flows except where a minimal shared API/helper change is strictly required

---

## Verification Requirements

You must run and report:

### Backend/API
- candidate browse endpoint supports required search/filter/sort behavior
- API returns expected filtered/sorted results

### Frontend
- frontend installs and runs locally
- firm can browse candidate profiles from database
- search works where present in the prototype
- filters work where present in the prototype
- sorting works where present in the prototype
- browse flow no longer uses mock candidate data

### Frontend quality
- modified frontend files lint clean
- frontend build/typecheck passes where configured
- report any pre-existing unrelated lint issues separately rather than fixing unrelated files

### Persistence / query verification
- verify with direct API calls that each implemented search/filter/sort input changes results as expected
- verify with sample database queries or inspected rows that the returned results are consistent with stored candidate data

---

## Completion Requirements

When complete, report:

1. completed checklist items
2. incomplete items or blockers
3. exact verification commands run
4. result of each verification step