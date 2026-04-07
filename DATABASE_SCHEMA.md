
---

# `DATABASE_SCHEMA.md`

```md
# Database Schema

## Overview
OpenCourt uses PostgreSQL as its primary application database.

The schema is relational and centers around:
- local users
- candidate profiles
- firm profiles
- introduction requests
- jobs

This document describes the main schema concepts. It is not a substitute for the live database or Alembic migrations.

---

## Core Tables

## `users`
Represents the local OpenCourt user record associated with a Clerk user.

### Purpose
- stores local app identity
- stores business account type
- links Clerk auth to OpenCourt domain data

### Key fields
Typical important fields:
- `id`
- `clerk_user_id`
- `email`
- `account_type`
- timestamps if present

### Notes
`account_type` is the source of truth for whether a user is a:
- `candidate`
- `firm`

---

## `candidate_profiles`
Represents a candidate/lawyer profile.

### Purpose
Stores profile-builder and related candidate data used in:
- candidate onboarding/editing
- firm browse/search
- intro requests
- settings/preferences

### Relationship
- linked to `users`
- usually one candidate profile per candidate user

### Important structured fields
Examples of structured fields added during MVP work include:
- `practice_area`
- `years_post_qualification`
- `firm_tier`
- `university`
- `preferred_locations`
- `excluded_firms`
- `open_to_roles`
- `profile_verified`
- `title`
- `current_firm`
- `former_firms`
- `trainee_firm`
- `primary_admission`
- `admission_year`
- `source_profile_url`

### Notes
Important candidate fields should remain structured where possible.
Avoid flattening useful data back into generic summary text unless there is a clear reason.

---

## `firm_profiles`
Represents a firm account’s profile/onboarding data.

### Purpose
Stores firm onboarding/profile information used in:
- firm onboarding/editing
- dashboard display
- jobs ownership
- intro requests

### Relationship
- linked to `users`
- usually one firm profile per firm user in the MVP

### Important structured fields
Examples include:
- `firm_name`
- `office_locations`
- `hiring_practice_areas`
- `hiring_partners_band`

### Notes
The MVP uses a relatively simple single-profile model and does not yet implement a more complex multi-user firm organization model.

---

## `introduction_requests`
Represents a firm requesting an introduction to a candidate.

### Purpose
Stores:
- the relationship between firm and candidate
- request status
- structured role/opportunity details included in the request
- optional revealed details
- firm message

### Relationships
- FK to `firm_profiles`
- FK to `candidate_profiles`

### Important fields
Examples:
- `firm_profile_id`
- `candidate_profile_id`
- `status`
- `role_title`
- `role_location`
- `practice_area`
- `employment_type`
- `work_arrangement`
- `sponsorship_qualification`
- `salary_band`
- `firm_message`
- `revealed_firm_name`
- `revealed_compensation`
- `revealed_role_description`

### Status
A single explicit status field is used, e.g.:
- `pending`
- `accepted`
- `declined`

### Constraints
The schema includes a unique constraint preventing duplicate intro requests for the same firm profile and candidate profile combination.

---

## `jobs`
Represents a job/opportunity posted by a firm.

### Purpose
Stores structured job data for firm-managed opportunities.

### Relationship
- FK to `firm_profiles`

### Important fields
Examples:
- `firm_profile_id`
- `role_title`
- `location`
- `practice_area`
- `description`
- `salary_min_k`
- `salary_max_k`
- `work_arrangement`
- `status`
- `posted_at`
- `created_at`
- `updated_at`

### Status
The jobs domain uses a status model such as:
- `open`
- `closed`
- `removed`

### Notes
Jobs are part of the MVP foundation and support create/edit/close/remove workflows on the firm side.

---

## Possible Supporting Data
Depending on the final MVP state, there may also be lightweight supporting persistence for areas like:
- recent profile views
- blocked firms/preferences
- seed/demo data

These should be confirmed against the live database and current migrations.

---

## Schema Principles

The MVP schema follows these principles:
- explicit foreign keys
- structured columns for important business data
- simple status fields rather than many overlapping booleans
- minimal speculation
- enough structure to support current UI and workflows

---

## Verification Tips

To inspect the live schema locally:

```bash
psql postgresql://seanthompson@localhost:5432/legal
```

Useful commands:

```
\dt
\d users
\d candidate_profiles
\d firm_profiles
\d introduction_requests
\d jobs
```

To inspect data:

```
select * from users order by id desc limit 10;
select * from candidate_profiles order by id desc limit 10;
select * from firm_profiles order by id desc limit 10;
select * from introduction_requests order by id desc limit 10;
select * from jobs order by id desc limit 10;
```

---

## Important Reminder

This document should describe the schema as it actually exists, not as an idealized future design.

When the schema changes:

- update this document
- update related architecture docs
- keep docs aligned to reality