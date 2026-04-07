# Phase 16 — Targeted Workflow Fixes

## Goal
Fix the remaining high-priority workflow issues in the MVP without introducing new broad feature work or large refactors.

This phase is intentionally narrow. It exists to correct specific missed or incorrect behaviors from earlier phases.

---

## In Scope

### 1. Opportunities salary filter change
On the `/opportunities` page, remove the current salary range slider filter entirely.

Replace it with:
- a minimum salary dropdown
- a maximum salary dropdown

Required behavior:
- candidates can filter jobs by selecting a minimum salary and/or maximum salary
- the filter should use real backend job data
- the selected min/max values should produce sensible salary-range filtering behavior
- the UI should be simple, clear, and stable
- do not keep the slider alongside the dropdowns

Requirements:
- remove the opportunities salary slider filter from this page
- use explicit dropdown-based filtering instead
- ensure min/max selections cannot create obviously broken filter combinations without handling them sensibly

### 2. Dual-handle range slider
Fix the range slider behavior so it uses a proper dual-handle range selector where a range is still required elsewhere in the app.

Required behavior:
- the slider visibly has two handles
- one handle controls the minimum value
- one handle controls the maximum value
- the selected range is visually clear
- the min and max values behave correctly and do not collapse into a single-handle interaction
- the range values persist or submit correctly wherever this slider is still used

This applies to any remaining range-based salary/compensation UI where the previous implementation still behaves like a single-knob slider.

### 3. Saved Candidates introduction action
On the firm dashboard, each saved candidate must provide a real action for the firm to request an introduction.

Required behavior:
- saved candidates shown on the dashboard must expose a clear introduction/request action
- the action must use the real introduction flow
- the action must not be a placeholder
- once an introduction has been sent, the UI should reflect the correct persisted state

Use existing introduction request patterns where possible.

### 4. Firm job applications connect flow
On pages like:

`/firm-job-applications/[id]`

the current “Connect” action for a candidate who applied for a job must be fixed.

Current bad behavior:
- clicking “Connect” redirects to `/search`

Required behavior:
- clicking “Connect” should initiate or create the correct firm-to-candidate connection / introduction flow for that applicant
- it must be tied to the job application context where appropriate
- it must not redirect the user to `/search`
- it must not behave like a placeholder or dead-end action
- the resulting state must be persisted appropriately using the existing or minimally extended backend flow

Keep this implementation minimal and explicit.
Do not build a full messaging platform or broad workflow engine.

### 5. Optional exclusion: cursor-pointer cleanup
Do **not** spend significant time on broad cursor-pointer cleanup in this phase.

If a touched control in scope clearly needs `cursor-pointer`, fixing it is acceptable.
Do not turn this phase into a global CSS sweep.

---

## Out of Scope

Do **not** implement any of the following in this phase:
- new pages unless absolutely required by one of the scoped fixes
- broad redesign of search, dashboard, opportunities, or jobs pages
- messaging/chat
- email delivery
- interaction history system
- analytics
- large styling cleanup
- broad cursor-pointer cleanup across the app
- auth redesign
- unrelated bug fixes outside the scoped issues

---

## Frontend and Backend Preflight

Before making changes, verify and report:
- pwd in `./frontend`
- pwd in `./backend`
- frontend dev server can run
- backend API is reachable from the frontend environment
- the frontend API base URL currently being used
- the current opportunities salary filter behavior can be observed
- any remaining single-handle range issue can be observed where applicable
- saved candidates currently load on the firm dashboard
- `/firm-job-applications/[id]` currently loads
- the current “Connect” action behavior can be observed

If the backend API base URL is environment-specific, report the exact value in use.

---

## Opportunities Salary Filter Requirements

On `/opportunities`:
- remove the salary range slider filter
- replace it with minimum and maximum salary dropdowns
- use the real backend jobs data and explicit query parameters where necessary
- keep the behavior simple and predictable
- ensure results update sensibly when min/max salary selections change

Do not reintroduce a slider on `/opportunities`.

---

## Dual-Handle Slider Requirements

If the current slider component or library usage is incorrect elsewhere:
- fix it using the existing slider component/library where possible
- do not replace the whole UI library unless absolutely necessary
- do not fake a two-handle appearance with broken behavior

Verification must explicitly prove:
- both handles are rendered
- both handles are usable
- the selected range is correct
- persisted/submitted values match the selected range

---

## Saved Candidates Requirements

On the firm dashboard:
- each saved candidate must provide a real introduction action
- the action must use the real backend flow
- duplicate introduction requests should still be prevented
- the UI should show a correct post-request state if applicable

Do not redirect to unrelated pages just to complete the flow.

---

## Job Applications Connect Requirements

For each job applicant shown on the firm job applications page:
- the “Connect” action must not redirect to `/search`
- it must create or initiate the correct introduction/connection behavior directly from that context
- it should use the candidate/job/application information already available in the current flow
- it should be clear and minimal for the user

If a minimal backend addition is needed, it is allowed.
Do not overengineer.

---

## Constraints

- keep code simple
- prefer explicit code over abstraction
- do not redesign the app
- do not begin large refactors
- do not modify Clerk auth, LocalUserProvider, or user bootstrap logic except where a minimal shared fix is strictly required
- do not modify candidate onboarding/profile, firm onboarding/profile, opportunities, or jobs CRUD beyond what is minimally required for these fixes
- do not introduce messaging, email, or large workflow systems
- keep changes minimal and reviewable

---

## Suggested Work Order

1. inspect the current opportunities salary filter and replace it with min/max salary dropdowns
2. inspect any remaining slider implementation in the affected UI
3. fix the dual-handle range behavior where still required
4. inspect saved-candidate dashboard actions
5. wire real introduction action from saved candidates
6. inspect the firm job applications “Connect” action
7. replace the bad redirect behavior with the proper introduction/connection flow
8. run verification
9. fix issues and verify again

---

## Verification Requirements

You must run and report:

### Opportunities salary filter
- `/opportunities` no longer uses the salary range slider
- minimum salary dropdown works
- maximum salary dropdown works
- min/max salary filtering changes the results correctly
- filtering uses real backend data

### Dual-handle slider
- any remaining relevant slider now renders two handles
- both handles are usable
- the selected range is visually clear
- submitted/persisted values match the selected range

### Saved candidates
- saved candidates on the dashboard have a real introduction action
- using that action creates or initiates the correct introduction flow
- duplicate introduction requests are still prevented
- the saved-candidate UI reflects the resulting state correctly

### Job applications connect flow
- `/firm-job-applications/[id]` still loads
- clicking “Connect” no longer redirects to `/search`
- clicking “Connect” now performs the correct introduction/connection behavior for that applicant
- resulting state is persisted correctly if persistence is part of the flow

### Regression checks
- existing candidate search still works
- existing intro request flow still works
- existing saved-candidate behavior still works
- existing job applications page still works
- existing jobs flow still works

### Frontend quality
- modified frontend files lint clean
- frontend build/typecheck passes where configured
- report any pre-existing unrelated lint issues separately rather than fixing unrelated files

### Backend / DB
- if backend/database changes were made, verify affected endpoints or rows explicitly
- report any minimal schema/API additions made to support these fixes

---

## Completion Requirements

When complete, report:

1. completed checklist items
2. incomplete items or blockers
3. exact verification commands run
4. result of each verification step
5. exact explanation of how the saved-candidate introduction action now works
6. exact explanation of how the job-application connect action now works
