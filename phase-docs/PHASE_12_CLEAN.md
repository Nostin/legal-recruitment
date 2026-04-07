# Phase 12 — Polish and Firm Workflow Fixes

## Goal
Polish the current MVP, improve consistency, and resolve the highest-priority firm-side workflow issues without introducing large new product areas.

This phase focuses on UI consistency, firm redirect behavior, opportunity management UX, request-introduction modal cleanup, saved candidates, and firm-onboarding edit-flow polish.

---

## In Scope

### 1. Interactive cursor consistency
Ensure interactive button-like controls use appropriate pointer cursor behavior consistently.

Requirements:
- add `cursor-pointer` where needed on clickable custom button-like UI
- do not blindly add classes to every element without checking whether the component already behaves correctly
- keep this scoped to touched areas and obviously interactive controls

### 2. Firm sign-in redirect
When a firm successfully signs in and is fully bootstrapped as a local firm user, redirect them to:

`/search`

Requirements:
- do not break candidate sign-in flow
- do not break public routes
- do not change auth architecture unnecessarily

### 3. Opportunity removal confirmation modal
When a firm removes an opportunity, replace any JavaScript `alert` / `confirm` browser prompt with a proper in-app modal/overlay.

Required behavior:
- clear “Are you sure?” style confirmation
- opportunity is only removed after explicit confirmation
- cancel cleanly closes the modal
- use existing dialog/modal UI patterns where possible

### 4. Opportunity close reason + reopen
When a firm closes an opportunity:
- show a text input / text area asking why it is being closed
- persist the close reason
- allow the opportunity to be reopened later

Requirements:
- keep the jobs model and UI changes minimal and explicit
- if a small schema/backend change is required to store the close reason, that is allowed
- reopening should restore the opportunity to the open state cleanly

### 5. Request Introduction modal cleanup
In the “Request Introduction” overlay:
- remove the duplicated “Salary Band” option if the “Compensation” field already covers that concept
- keep the remaining structured fields clear and non-duplicative

### 6. Saved Candidates
Replace the current “Recently Viewed” concept with **Saved Candidates**.

Required behavior:
- firms can save a candidate from the search page
- saved candidates are persisted to the backend/database
- saved candidates appear on the dashboard under “Saved Candidates”
- firms can clearly tell whether a candidate is already saved
- avoid duplicate saves for the same firm/candidate pair

Requirements:
- use real backend data
- do not leave fake placeholder dashboard content
- keep the feature minimal and explicit

### 7. Firm onboarding edit-flow polish
When a firm clicks “Edit firm profile” from the dashboard and is taken to `/firm-onboarding`:
- remove the top “Back” button completely
- change the bottom “Back” button to `Cancel`
- `Cancel` should return the user to the dashboard

Requirements:
- this should apply to the edit-from-dashboard flow
- do not redesign the broader onboarding stepper unless required

---

## Out of Scope

Do **not** implement any of the following in this phase:

- candidate opportunities page
- candidate jobs redirect
- candidate job application / “I am interested” flow
- job application notifications
- broader interaction history
- messaging/chat
- email delivery
- major dashboard redesign
- broad auth redesign
- unrelated cleanup across the entire app

---

## Frontend and Backend Preflight

Before making changes, verify and report:

- `pwd` in `./frontend`
- `pwd` in `./backend`
- frontend dev server can run
- backend API is reachable from the frontend environment
- the frontend API base URL currently being used
- firm sign-in and bootstrap still work
- `/search`, `/firm-dashboard`, `/firm-onboarding`, and jobs management flow currently load
- existing intro request flow currently works
- existing jobs CRUD flow currently works

If the backend API base URL is environment-specific, report the exact value in use.

---

## Saved Candidates Data Requirements

If required, add minimal backend/database support for saved candidates.

Requirements:
- use explicit foreign keys to the relevant firm profile/user and candidate profile/user
- avoid duplicate saves for the same firm/candidate pair
- keep the model simple and explicit
- do not evolve this into a broader interaction-history system in this phase

A minimal implementation may include:
- a `saved_candidates` table
- a create/save endpoint
- a remove/unsave endpoint if needed by the current UI
- a list endpoint for dashboard rendering

---

## Opportunity Close Reason Requirements

If required, extend the jobs model minimally to support:
- close reason text
- reopen behavior

Requirements:
- keep status handling simple and explicit
- do not introduce speculative audit/history systems
- do not redesign the jobs domain beyond what this phase needs

---

## Constraints

- keep code simple
- prefer explicit code over abstraction
- do not redesign the app
- do not begin large refactors
- do not modify Clerk auth, LocalUserProvider, or user bootstrap logic except where a minimal shared fix is strictly required
- do not modify candidate onboarding/profile flows except where a minimal shared fix is strictly required
- do not introduce broad analytics, messaging, or history systems
- do not flatten important structured fields into generic text blobs where explicit fields are more appropriate

---

## Suggested Work Order

1. inspect current search, firm dashboard, firm onboarding, and jobs management flows
2. implement interactive cursor consistency in touched UI
3. add firm sign-in redirect
4. replace remove-opportunity browser prompt with proper modal
5. add close reason + reopen support for jobs
6. remove duplicated salary-band concept from intro modal
7. implement saved candidates backend support if needed
8. wire saved-candidate UI on search and dashboard
9. polish firm-onboarding edit flow buttons/navigation
10. run verification
11. fix issues and verify again

---

## Verification Requirements

You must run and report:

### Cursor / interaction polish
- touched interactive button-like controls use correct pointer behavior

### Firm redirect
- after successful firm sign-in, the user is redirected to `/search`
- candidate sign-in behavior is not broken

### Opportunity removal / close / reopen
- remove opportunity uses a proper in-app modal/overlay
- removing only happens after confirmation
- closing an opportunity requires or captures a close reason
- closed opportunities can be reopened
- close reason persists if implemented in the data model

### Request Introduction modal
- duplicated Salary Band option is removed
- remaining compensation/request fields still behave sensibly

### Saved Candidates
- a firm can save a candidate from `/search`
- a saved candidate is persisted to backend/database
- duplicate save is prevented
- saved candidates appear on `/firm-dashboard`
- saved candidates dashboard section uses real data, not fake placeholders

### Firm onboarding edit flow
- top Back button is removed in the dashboard-edit flow
- bottom Back becomes Cancel
- Cancel returns to `/firm-dashboard`

### Regression checks
- existing candidate flow still works
- existing firm flow still works
- existing jobs flow still works
- existing search/filter/browse still works
- existing intro request flow still works

### Frontend quality
- modified frontend files lint clean
- frontend build/typecheck passes where configured
- report any pre-existing unrelated lint issues separately rather than fixing unrelated files

### Backend / DB
- if backend/database changes were made, verify affected schema, rows, and endpoints explicitly

---

## Completion Requirements

When complete, report:

1. completed checklist items
2. incomplete items or blockers
3. exact verification commands run
4. result of each verification step
5. any new backend/database structures added for saved candidates or job close reasons
