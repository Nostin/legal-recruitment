Phase 2 is not yet fully accepted.

The candidate schema, migration, and endpoints are in place, but the seeded candidate profile data is not being mapped cleanly enough from the prototype fixture data in ./frontend/data/candidates.ts.

Please patch only the candidate seed/fixture implementation.

Requirements:
- inspect ./frontend/data/candidates.ts carefully
- improve the fixture-to-database mapping so candidate profile records better reflect the actual prototype data
- populate meaningful fields where source data exists instead of leaving many fields blank
- do not invent unrealistic data unless necessary
- keep the existing schema, routes, and migration structure intact unless a minimal schema tweak is absolutely required
- keep the seed script idempotent
- do not touch frontend code
- do not make unrelated backend changes

Mapping guidance:
- map area/rawPracticeArea to the most appropriate candidate practice area field
- map pqe to years_post_qualification unless a better existing field is already present
- map tier to firm_tier
- map uni to university
- map location to preferred_locations
- map notes into the most appropriate summary/notes/profile field
- map profile into linkedin_url or another existing profile URL field only if that is actually appropriate for the schema; do not misuse fields silently
- preserve verified status
- where source data has no clean destination column, report that explicitly rather than discarding it silently

Verification:
- rerun seed successfully
- provide example output for several candidate rows showing meaningful field population
- report exactly how source fixture fields map to database columns
- report any source fields that do not yet have a sensible destination in the current schema