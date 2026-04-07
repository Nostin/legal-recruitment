# Phase 4 — Authentication and Account Bootstrap

## Goal
Complete Clerk email-based passwordless authentication in the frontend and establish the local app user bootstrap flow.

This phase should make it possible for users to sign in, access protected pages, and have a local app user record associated with their Clerk identity.

---

## In Scope

### Clerk auth
Set up Clerk email authentication in `./frontend`.

Assume these environment variables already exist locally:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

### Public vs protected routes
Implement route protection so:

#### Public
/
/join
/sign-in
/sign-up

#### Protected
/profile-builder
/firm-onboarding
/search
/firm-dashboard
/notifications
/lawyer-settings

### Navigation states
Add basic signed-in and signed-out navigation states.

### Local user bootstrap

- if a signed-in Clerk user does not yet have a local app user record, create one
- do not create duplicate local users for the same Clerk user
- if account type is not yet known, route the user through the existing account-type choice flow before creating the final profile record
- the local users table remains the source of truth for account_type
- do not replace or redesign existing Clerk sign-in/sign-up routes unless required to make auth function correctly
- if a local user record already exists for the Clerk user, reuse it and do not overwrite account_type unintentionally
- only create the final candidate or firm profile through the existing onboarding flows, not during the initial auth bootstrap

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
- python3 --version
- which psql
- psql --version
- echo $DATABASE_URL
- psql "$DATABASE_URL" -c "select current_database(), current_user;"
- psql "$DATABASE_URL" -c "\dt"

If DATABASE_URL is not set, load it from the expected local .env file and report that step explicitly.

Do not assume database access based on previous phases or based on the user’s local terminal.

Do not proceed with migrations or seed steps until database access is verified successfully.

If database access fails, stop and report the exact failure.

## Frontend Auth Preflight

Before making auth changes, verify and report:

- pwd in ./frontend
- whether frontend/.env.local exists
- whether NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set
- whether CLERK_SECRET_KEY is set
- whether NEXT_PUBLIC_CLERK_SIGN_IN_URL is set
- whether NEXT_PUBLIC_CLERK_SIGN_UP_URL is set

If NEXT_PUBLIC_CLERK_SIGN_IN_URL or NEXT_PUBLIC_CLERK_SIGN_UP_URL are not set, either:
- add them to the local frontend env if needed for the current Clerk setup, or
- report that the current Clerk integration does not require them and continue

If the Clerk env vars are not present, stop and report that explicitly before making further auth changes.

---

## Implementation Requirements

### Clerk setup
- implement sign-in with email and emailed code or link
- keep changes minimal
- do not redesign the auth flow more than necessary

### Local user bootstrap
Create the minimum logic needed so authenticated users can be associated with a local `users` row.

- if backend support is required for local user bootstrap, add only the minimum endpoint(s) needed to create or fetch the local user record
- do not implement broader user management APIs in this phase

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
- user can start email sign-in
- user can complete sign-in successfully
- public pages remain public
- unauthenticated access to protected pages should redirect to /sign-in or the configured Clerk sign-in flow
- signed-in navigation state appears
- signed-out navigation state appears
- do not break existing public navigation or landing-page behavior while adding auth protection

### Manual auth verification note
If the current execution environment cannot access the email inbox used for Clerk authentication, complete all implementation and all non-email verification automatically, then stop and report the remaining manual verification step required from the user:

- request email sign-in
- open the received Clerk email
- complete sign-in using the emailed link or code
- confirm protected route access and local user bootstrap after successful sign-in

### Data/bootstrap
- first authenticated use creates or links a local user record
- local user record stores correct account type
- verify in the database that the created or linked local users row contains the expected clerk_user_id, email, and account_type

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