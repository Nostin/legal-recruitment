# Phase 4 — Authentication and Account Bootstrap

## Goal
Implement Clerk magic-link authentication in the frontend and establish the local app user bootstrap flow.

This phase should make it possible for users to sign in, access protected pages, and have a local app user record associated with their Clerk identity.

---

## In Scope

### Clerk auth
Set up Clerk magic-link authentication in `./frontend`.

Assume these environment variables already exist locally:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

### Public vs protected routes
Implement route protection so:

- marketing/public pages remain public
- app pages that require authentication are protected

### Navigation states
Add basic signed-in and signed-out navigation states.

### Local user bootstrap
On first authenticated use, establish a local application user record linked to the Clerk user.

The local user record must include:

- clerk user id
- email
- account type

### Account type capture
Support choosing account type:

- candidate
- firm

If the existing prototype already contains a clear user choice flow, use that.

If the account type is not yet known for a newly authenticated user, route them through the existing account-type choice flow before creating the final local profile record.

Store account type in the local app database.

---

## Out of Scope

Do **not** implement:

- backend Clerk token verification
- advanced Clerk organization features
- notifications
- email sending beyond Clerk-auth-managed login flow
- intro requests
- major auth UI redesign
- full business-logic authorization layers beyond route protection and local user bootstrap

---

## Preflight Check

Before making any backend or database changes, verify database access from the exact execution environment being used for this phase.

Run and report the result of:

- pwd
- whoami
- python --version
- which psql
- psql --version
- echo $DATABASE_URL
- psql "$DATABASE_URL" -c "select current_database(), current_user;"
- psql "$DATABASE_URL" -c "\dt"

If DATABASE_URL is not set, load it from the expected local .env file and report that step explicitly.

Do not assume database access based on previous phases or based on the user’s local terminal.

Do not proceed with migrations or seed steps until database access is verified successfully.

If database access fails, stop and report the exact failure.

---

## Implementation Requirements

### Clerk setup
- implement sign-in with email magic links
- keep changes minimal
- do not redesign the auth flow more than necessary

### Local user bootstrap
Create the minimum logic needed so authenticated users can be associated with a local `users` row.

This may be done by a frontend-to-backend call if needed.

### Account type handling
Persist whether the user is a `candidate` or `firm`.

The local database remains the source of truth for account type.

---

## Suggested Work Order

1. inspect current frontend auth state
2. confirm Clerk setup points
3. add or finalize Clerk integration
4. protect required routes
5. add signed-in/signed-out nav state
6. implement first-login local user bootstrap
7. implement account type persistence
8. verify auth behavior
9. fix issues and verify

---

## Constraints

- keep UI changes minimal
- do not redesign frontend unnecessarily
- do not implement backend token verification yet
- do not add speculative role/permission systems
- only implement what is needed to support authentication and local account bootstrap

---

## Verification Requirements

You must run and report:

### Auth
- user can request a magic link sign-in
- user can sign in successfully
- public pages remain public
- protected pages require auth
- signed-in navigation state appears
- signed-out navigation state appears

### Data/bootstrap
- first authenticated use creates or links a local user record
- local user record stores correct account type

### Frontend
- frontend still runs after auth changes
- frontend lint/build/typecheck passes where configured

---

## Completion Requirements

When complete, report:

1. completed checklist items
2. incomplete items or blockers
3. exact verification commands run
4. result of each verification step