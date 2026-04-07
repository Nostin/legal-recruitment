# Phase 15 — Search and Dashboard Polish

## Goal
Polish the candidate and opportunities browsing experience, improve dashboard usability, and resolve remaining MVP UX gaps around saved candidates, introduction requests, and job applications.

This phase is for targeted UX and workflow improvements only. It is not for broad redesign or major new architecture.

---

## In Scope

### 1. Opportunities page filters
Add useful filters to the candidate-facing opportunities page.

Required behavior:
- filter by location
- filter by practice area
- filter by salary band or equivalent salary range concept if supported by the jobs schema
- use real backend data
- do not rely on mock filter values
- keep the filter UI aligned with the candidate search page where appropriate

Requirements:
- implement only the filters that the current jobs schema can support sensibly
- prefer explicit backend query parameters
- keep filtering behavior simple and predictable

### 2. Dual-handle salary range slider
Where a salary range selector is used (for example “Desired Salary Range” or equivalent range-based UI), replace any single-handle implementation with a proper dual-handle range selector.

Required behavior:
- one handle for minimum
- one handle for maximum
- clear visual selected range
- values should be understandable and stable
- do not regress save/edit behavior

### 3. Saved candidate visual clarity on /search
Improve the visual state of “Save Candidate” / “Saved” in the candidate search/browse UI.

Required behavior:
- the saved state should be visually obvious
- the unsaved state should be visually obvious
- the control should clearly communicate whether the candidate is already saved
- keep the interaction simple and consistent with existing UI style

### 4. Request Introduction salary input correction
In the “Request Introduction” overlay:
- restore the range selector for compensation/salary specificity
- remove the duplicated dropdown-based Salary Band field
- keep one clear salary-range-style input, not two competing salary concepts

Requirements:
- do not reintroduce duplicate compensation inputs
- keep the request form structured and clear

### 5. Cursor pointer consistency in remaining firm opportunity actions
Ensure buttons/actions such as:
- Remove
- Edit
- Reopen
- Close

and similar clearly interactive controls use appropriate pointer cursor behavior consistently.

Scope this to the touched opportunity/dashboard/search areas.

### 6. Job Applications clickthrough page
On `/firm-dashboard`, make Job Applications actionable.

Required behavior:
- if the user clicks Job Applications (tile/card/entry), route them to a page showing:
  - the relevant job details
  - the candidates who have applied for that job
  - a clear action to connect to those candidates

Requirements:
- use real backend data
- do not use fake placeholders
- keep the page minimal and useful
- use existing jobs/application data where possible

### 7. Introduction Requests dashboard tile
Add an Introduction Requests tile/section to the firm dashboard.

Required behavior:
- show introduction requests in the dashboard
- include status such as:
  - accepted
  - rejected / declined
  - pending
  - expired if that exists in the current model
- use real backend data
- keep the presentation simple and useful

If “expired” is not currently a real backend state, do not invent it silently. Either:
- omit it for now, or
- explicitly add it only if the current model should now support it

### 8. Saved Candidates dashboard status
On the firm dashboard, saved candidates should show a status that communicates where they sit in the workflow.

Examples:
- saved
- request sent
- connected

Required behavior:
- use real persisted data
- do not show fake status labels
- derive the status from current system state where possible
- keep logic explicit and understandable

---

## Out of Scope

Do **not** implement any of the following in this phase:

- major redesign of the dashboard or search pages
- messaging/chat
- email delivery
- broad analytics
- full CRM/workflow engine
- broad interaction history system
- auth redesign
- unrelated cleanup across the app
- speculative ranking/recommendation systems

---

## Frontend and Backend Preflight

Before making changes, verify and report:

- pwd in `./frontend`
- pwd in `./backend`
- frontend dev server can run
- backend API is reachable from the frontend environment
- the frontend API base URL currently being used
- opportunities page currently loads
- candidate search page currently loads
- firm dashboard currently loads
- jobs and saved-candidates flows currently work
- intro requests and job applications currently exist in the backend

If the backend API base URL is environment-specific, report the exact value in use.

---

## Opportunities Filter Requirements

If backend changes are required:
- add explicit query parameters for the supported filters
- keep query logic simple and explicit
- use structured job fields only
- do not invent a generic search DSL
- do not mix multiple conflicting salary filter concepts

Frontend requirements:
- opportunities page filter controls should use the real backend
- the UI should update results when filters change
- filter controls should remain stable and understandable

---

## Job Applications Page Requirements

For the firm-side job applications view:
- route from dashboard into a meaningful jobs/applications page
- show real job details
- show the candidates who applied
- include a “connect” action or equivalent next step where the current system supports it

Keep this page minimal.
Do not turn it into a full applicant tracking system in this phase.

---

## Dashboard Requirements

The firm dashboard should become more truthful and more actionable.

Required dashboard improvements in this phase:
- Saved Candidates must show meaningful status
- Job Applications must be clickable and lead somewhere useful
- Introduction Requests must appear with real statuses
- no fake placeholder content should appear as if implemented

---

## Constraints

- keep code simple
- prefer explicit code over abstraction
- do not redesign the app
- do not begin large refactors
- do not modify Clerk auth, LocalUserProvider, or user bootstrap logic except where a minimal shared fix is strictly required
- do not break existing candidate onboarding/profile flows
- do not break existing firm onboarding/profile flows
- do not flatten structured data into generic text where explicit fields already exist
- keep changes minimal and reviewable

---

## Suggested Work Order

1. inspect current opportunities page, candidate search page, and firm dashboard
2. add or extend opportunities filters
3. fix the salary range selector to use a proper dual-handle control
4. improve Save Candidate / Saved visual state in search
5. correct the Request Introduction compensation field UX
6. clean up remaining cursor-pointer inconsistencies in touched areas
7. add Job Applications clickthrough page from dashboard
8. add Introduction Requests dashboard tile/section
9. add Saved Candidates dashboard status handling
10. run verification
11. fix issues and verify again

---

## Verification Requirements

You must run and report:

### Opportunities page
- opportunities page loads real jobs
- location filter works
- practice area filter works
- salary filter/range works if implemented against existing schema
- filters are backed by the real backend, not mock data

### Salary range UI
- range selector uses two handles
- selected range is visually clear
- values persist or submit correctly where applicable

### Saved candidates search UI
- saved vs unsaved candidate state is visually clear
- saving still works
- saved status remains consistent after reload

### Request Introduction modal
- duplicated dropdown-based Salary Band is removed
- range-style compensation input is present and usable
- no conflicting duplicate salary fields remain

### Dashboard
- Job Applications tile/section is clickable and useful
- clicking it shows real job + applicant data
- Introduction Requests appear on dashboard with real status values
- Saved Candidates show meaningful real status values

### Regression checks
- existing jobs flow still works
- existing intro request flow still works
- existing candidate opportunities flow still works
- existing search/filter/browse still works
- existing saved-candidates behavior still works

### Frontend quality
- modified frontend files lint clean
- frontend build/typecheck passes where configured
- report any pre-existing unrelated lint issues separately rather than fixing unrelated files

### Backend / DB
- if backend/database changes were made, verify affected endpoints, schema, and rows explicitly
- report any newly introduced status logic or data relationships

---

## Completion Requirements

When complete, report:

1. completed checklist items
2. incomplete items or blockers
3. exact verification commands run
4. result of each verification step
5. any backend/API/schema changes added to support dashboard statuses or job application clickthrough