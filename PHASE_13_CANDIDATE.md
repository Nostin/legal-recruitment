
---

# `PHASE_13_CANDIDATE_OPPORTUNITIES.md`

```md
# Phase 13 — Candidate Opportunities

## Goal
Introduce the candidate-facing opportunities experience so signed-in candidates can browse open jobs and be redirected there as part of the candidate journey.

This phase covers the candidate-side jobs page, candidate navigation, candidate redirect behavior, and the “I am interested” UI entry point.

This phase does **not** yet need to fully implement firm-side visibility of job applications unless minimally required by the current candidate flow.

---

## In Scope

### 1. Candidate opportunities page
Create a candidate-facing page that lists open job opportunities.

Requirements:
- use real backend jobs data
- show only relevant/open jobs
- present the jobs in a clean, minimal list or card layout
- do not rely on mock job data
- keep the UI aligned with the existing app style

### 2. Candidate sign-in redirect
After a candidate signs in successfully and is fully bootstrapped as a local candidate user, redirect them to the opportunities page.

This redirect should happen only when appropriate for candidate users.

Do not break firm redirect behavior established earlier.

### 3. Candidate header navigation
When a candidate is signed in, add an `Opportunities` header link next to `Notifications`.

Requirements:
- preserve existing candidate navigation
- keep header role-aware and consistent
- do not break account dropdown behavior

### 4. “I am interested” action
Each job opportunity available to the candidate should provide an `I am interested` action.

When clicked:
- open an overlay/modal
- prompt the candidate to send their profile to the firm
- keep the UX simple and clear
- do not rely on browser alerts/prompts

This phase may create the UI and backend foundation needed for interest submission if required.

---

## Out of Scope

Do **not** implement any of the following in this phase unless minimally necessary to complete the candidate flow:

- full firm-side dashboard handling of job applications
- advanced application workflow/statuses beyond the minimum needed
- saved jobs feature
- messaging/chat
- email delivery
- large redesign of jobs presentation
- broad changes to intro request system
- broad dashboard redesign

---

## Frontend and Backend Preflight

Before making changes, verify and report:

- pwd in `./frontend`
- pwd in `./backend`
- frontend dev server can run
- backend API is reachable from the frontend environment
- the frontend API base URL currently being used
- jobs endpoints currently respond
- candidate sign-in and bootstrap currently work
- current header/nav behavior for candidates currently works
- current jobs foundation still works before changes

If the backend API base URL is environment-specific, report the exact value in use.

---

## Opportunities Page Requirements

### Data requirements
Use the existing jobs backend as the source of truth for the jobs list.

Requirements:
- show only jobs that should be visible to candidates
- if jobs have status, show only appropriate/open jobs
- do not expose removed or closed jobs as active opportunities
- keep filtering/sorting minimal unless already supported by the prototype

### UI requirements
The page should:
- clearly show open opportunities
- present enough structured job detail to be useful
- include the `I am interested` action
- remain simple and uncluttered

Do not overbuild the page in this phase.

---

## Candidate Redirect Requirements

After successful sign-in/bootstrap:
- candidate users should land on the opportunities page
- firm users should not use the candidate redirect
- preserve existing public/protected route behavior

Keep this logic explicit and minimal.

---

## “I am interested” Flow Requirements

When a candidate clicks `I am interested`:
- open an overlay/modal
- clearly explain that the candidate is sending their profile to the firm
- require explicit confirmation to proceed
- use existing role-aware candidate profile data where appropriate

Do not use browser alerts/prompts.

If backend persistence is required in this phase, implement only the minimum necessary to support the action cleanly.

---

## Constraints

- keep code simple
- prefer explicit code over abstraction
- do not redesign the app
- do not begin large refactors
- do not modify Clerk auth, LocalUserProvider, or user bootstrap logic except where a minimal shared fix is strictly required
- do not modify firm onboarding, intro request flow, or jobs CRUD beyond what is minimally required for candidate opportunities
- do not introduce messaging, notifications expansion, or broader application history systems in this phase unless absolutely required

---

## Suggested Work Order

1. inspect current candidate nav/header and jobs foundation
2. add or update candidate opportunities route/page
3. connect opportunities page to real jobs backend
4. add candidate Opportunities nav link
5. implement candidate sign-in redirect to opportunities
6. implement `I am interested` modal/overlay
7. add minimal backend support only if required
8. run verification
9. fix issues and verify again

---

## Verification Requirements

You must run and report:

### Candidate opportunities page
- candidate can access the opportunities page
- opportunities page shows real backend job data
- only appropriate/open jobs are shown
- no mock job data is used

### Candidate redirect
- after candidate sign-in, the user is redirected to the opportunities page
- firm sign-in redirect behavior still works correctly

### Candidate navigation
- signed-in candidate header shows `Opportunities` next to `Notifications`
- existing candidate navigation still works

### “I am interested” flow
- clicking `I am interested` opens a real in-app overlay/modal
- the modal clearly prompts the candidate to send their profile to the firm
- confirm/cancel behavior works sensibly
- if persistence is part of this phase, the action is persisted correctly

### Regression checks
- existing jobs foundation still works
- existing firm jobs management still works
- existing candidate profile flow still works
- existing intro request flow still works

### Frontend quality
- modified frontend files lint clean
- frontend build/typecheck passes where configured
- report any pre-existing unrelated lint issues separately rather than fixing unrelated files

### Backend / DB
- if backend/database changes were made, verify affected endpoints or rows explicitly

---

## Completion Requirements

When complete, report:

1. completed checklist items
2. incomplete items or blockers
3. exact verification commands run
4. result of each verification step
5. whether the “I am interested” action is only UI or also persisted in this phase