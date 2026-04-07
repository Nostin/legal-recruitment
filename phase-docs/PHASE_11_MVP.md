# Phase 11 — Final MVP Fixes

## Goal
Resolve the remaining core MVP gaps in the current OpenCourt implementation so the app is coherent, truthful, and usable for a first MVP pass.

This phase is for final MVP fixes only. It is not for new major features.

---

## In Scope

### 1. Block Specific Firms on /lawyer-settings
Make the “Block Specific Firms” functionality real and clear.

Required behavior:
- show a combobox / searchable dropdown of firms that are **not already blocked**
- selecting a firm adds it to the blocked firms list
- blocked firms appear as removable chips/tags
- removing a chip unblocks that firm
- changes persist to the backend/database
- when the page loads, the currently blocked firms are shown correctly

Requirements:
- use real firm data from the backend
- do not rely on hardcoded or mock firm names
- avoid allowing duplicate blocked firms
- keep the UI simple and clear

### 2. Profile Builder loading / disabled state
Improve the `/profile-builder` UX when a candidate already has saved data.

Required behavior:
- when existing candidate profile data is being loaded, the form should clearly show a loading or disabled state
- inputs should not appear fully editable before the existing data has finished hydrating
- the user should not be able to accidentally interact with stale/default values while the saved profile is still loading
- once loading is complete, the form should become fully interactive

Requirements:
- keep the existing UI design as intact as possible
- use a minimal, sensible loading/disabled approach
- do not redesign the profile builder flow

### 3. Recently Viewed Profiles on /firm-dashboard
Resolve the currently non-functional “recently viewed profiles” area.

Choose **one** of the following approaches:

#### Preferred option if straightforward:
Implement a minimal real recently viewed profiles feature.

Minimum required behavior:
- when a firm views a candidate profile in the relevant existing flow, record that event
- show a list of recently viewed candidate profiles on `/firm-dashboard`
- keep it simple and minimal
- use real backend data, not mock placeholders

#### Acceptable fallback if implementation would be too large for this phase:
Remove or hide the non-functional recently viewed profiles section so the dashboard does not show fake or misleading content.

Do **not** leave a fake or non-functional recently viewed section visible.

---

## Out of Scope

Do **not** implement any of the following in this phase:

- new major product features
- saved candidates feature beyond what is strictly required for recently viewed profiles
- interaction history feature
- jobs expansion beyond minimal bug/polish fixes directly required by this phase
- messaging or chat
- notifications redesign
- email delivery
- major UI redesign
- broad architecture refactors
- documentation files such as SYSTEM_OVERVIEW.md, AGENT_GUIDE.md, AUTHENTICATION.md, DATABASE_SCHEMA.md

---

## Frontend and Backend Preflight

Before making changes, verify and report:

- pwd in `./frontend`
- pwd in `./backend`
- frontend dev server can run
- backend API is reachable from the frontend environment
- the frontend API base URL currently being used
- `/lawyer-settings` currently loads
- `/profile-builder` currently loads
- `/firm-dashboard` currently loads
- Clerk auth still works
- existing jobs, search, and intro request flows still work before changes

If the backend API base URL is environment-specific, report the exact value in use.

---

## Blocked Firms Requirements

### Backend / data requirements
If required, add the minimal backend support needed so blocked firms can be managed properly.

This may include:
- an endpoint to list firms for the combobox
- using the existing excluded firms persistence shape if already suitable
- minimal backend validation or normalization

Requirements:
- use real firm records
- do not allow duplicate blocked firms
- preserve current blocked firms when editing
- make persistence explicit and predictable

### Frontend requirements
On `/lawyer-settings`:
- show blocked firms as chips/tags
- allow adding firms from a searchable/selectable list of unblocked firms
- allow removing blocked firms
- save changes to the backend
- reload correctly from persisted data

Do not make this ambiguous or hidden behind unclear interactions.

---

## Profile Builder Loading State Requirements

On `/profile-builder`:
- detect when a saved candidate profile is still being loaded
- show a clear loading or disabled state
- avoid user interaction before hydration completes
- keep the final UX simple and minimal

Allowed approaches:
- disabled form controls while loading
- loading overlay
- skeleton/loading state
- a combination of the above if minimal

Do not redesign the step flow or rewrite the form unnecessarily.

---

## Recently Viewed Profiles Requirements

### Preferred implementation path
If the current app structure supports it with a minimal addition, implement recently viewed profiles using a small, explicit data model.

A minimal implementation may include:
- a table to record firm profile → candidate profile views with timestamp
- one simple backend endpoint for recent views
- dashboard display of recent candidates

Requirements:
- keep it minimal
- use explicit foreign keys
- avoid overengineering
- do not turn this into a full analytics/history system

### Fallback path
If implementing it cleanly would be too large for this phase:
- remove or hide the fake/non-functional recently viewed section
- do not leave placeholder content that appears real

At the end of the phase, the dashboard must not present fake recently viewed data.

---

## Constraints

- keep code simple
- prefer explicit code over abstraction
- do not redesign the app
- do not begin large refactors
- do not modify Clerk auth, LocalUserProvider, or user bootstrap logic except where a minimal shared fix is strictly required
- do not modify jobs, candidate browse, intro request, or onboarding flows except where a minimal shared fix is strictly required for this phase
- do not flatten important structured fields into generic text blobs
- keep changes minimal and reviewable

---

## Suggested Work Order

1. inspect `/lawyer-settings`, `/profile-builder`, and `/firm-dashboard`
2. identify current blocked-firms data flow and missing pieces
3. implement blocked-firms combobox/chip UX + persistence
4. implement profile-builder loading/disabled state during hydration
5. inspect recently viewed section and decide:
   - implement minimally, or
   - remove/hide
6. make the minimum backend changes required
7. run verification
8. fix issues and verify again

---

## Verification Requirements

You must run and report:

### Blocked firms
- `/lawyer-settings` shows existing blocked firms correctly
- a firm can be added from the available list
- added blocked firms appear as chips/tags
- a blocked firm can be removed
- duplicate blocked firms cannot be added
- blocked firms persist correctly in the backend/database

### Profile builder loading state
- `/profile-builder` shows a loading or disabled state while saved candidate data is loading
- inputs are not prematurely interactive before hydration completes
- once loading completes, existing values appear correctly
- candidate save/edit behavior still works after the loading-state change

### Recently viewed profiles
If implemented:
- viewing a candidate records a recent view
- `/firm-dashboard` shows real recently viewed profiles
- displayed recent views come from backend data

If removed/hidden:
- `/firm-dashboard` no longer shows fake or misleading recently viewed content

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
- if backend/database changes were made, verify affected endpoints or tables explicitly
- inspect resulting schema/rows for any new persistence added in this phase

---

## Completion Requirements

When complete, report:

1. completed checklist items
2. incomplete items or blockers
3. exact verification commands run
4. result of each verification step
5. whether recently viewed profiles were implemented or intentionally removed/hidden
6. any minimal backend/API changes made to support blocked firms or recently viewed profiles