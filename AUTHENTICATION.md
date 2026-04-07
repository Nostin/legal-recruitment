# Authentication

## Overview
OpenCourt uses **Clerk** for authentication.

Authentication and application identity are deliberately split:

- **Clerk** manages sign-in/sign-up
- **OpenCourt database** stores the local app user record and business account type

This keeps auth separate from app-specific roles and profile data.

---

## Auth Method

The MVP uses Clerk email-based passwordless authentication.

In local development, email code / verification code has been preferred because it is easier to test than same-browser email-link flows.

---

## Local Frontend Env

Typical required frontend env values:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

Clerk values live in:

```
frontend/.env.local
```

Do not commit real secrets.

---

## Auth UI

The app uses Clerk sign-in/sign-up pages and existing route integration in the frontend.

Auth UI has not necessarily been fully branded or themed to match OpenCourt yet. Default Clerk styling may still appear in places.

This is cosmetic and separate from auth correctness.

---

## Public vs Protected Behavior

Typical public pages:

- /
- /sign-in
- /sign-up
- account-type choice flow where applicable

Protected app pages depend on account and flow, but generally include:

- candidate profile and settings pages
- firm dashboard and firm management pages
- other signed-in app areas

The frontend should redirect or route unauthenticated users appropriately.

--- 

## Local User Bootstrap

After a successful Clerk sign-in, OpenCourt must create or link a local app user row.

The local user row should contain at minimum:

- clerk_user_id
- email
- account_type

The local user record is essential because business role and app behavior depend on it.

A successful Clerk sign-in without a local users row is not sufficient for the app to function properly.

---

## Account Type

Allowed account types:

- candidate
- firm

The local database is the source of truth for account type.

Do not rely on Clerk alone to determine candidate vs firm behavior.

If account type is not yet known for a newly signed-in user, the app should route the user through the account-type choice flow before final profile/onboarding behavior continues.

---

## Candidate and Firm Profiles

Local auth bootstrap should create or link the users row.

It should not prematurely create full candidate or firm profile records unless the onboarding flow is intentionally doing so later.

Profile creation should remain part of the relevant candidate or firm onboarding/profile flow.

---

## Common Failure Modes

### 1. Clerk sign-in works, but local user row is missing

This means bootstrap failed.
Check:

- frontend bootstrap request
- backend bootstrap endpoint
- DB persistence
- account type handling

### 2. Auth works in UI, but protected flows behave strangely

Check:

- local user row existence
- account type value
- route protection logic
- LocalUserProvider behavior

### 3. Sign-in works but wrong email/provider assumptions are made

Check:

- Clerk config in dashboard
- email code vs email link flow
- frontend env vars

---

## Guidance for Future Changes

When working on auth:

- do not redesign Clerk integration casually
- do not change LocalUserProvider unless necessary
- do not overwrite account_type unexpectedly
- reuse existing bootstrap flow where possible
- verify both auth success and local users row creation

A phase touching auth is not complete until:

- sign-in succeeds
- local users row exists
- account_type is correct
- protected routes behave correctly