Phase 2 is close, but candidate seed data is still relying too heavily on profile_summary for fields that should be structured.

Please patch the candidate schema and seed mapping with minimal changes.

Requirements:
- add explicit candidate profile columns for obviously important structured fields currently being packed into profile_summary:
  - title
  - current_firm
  - former_firms
  - trainee_firm
  - primary_admission
  - admission_year
  - source_profile_url
- create a minimal migration for these additions
- update the seed mapping to populate these columns from ./frontend/data/candidates.ts
- keep the existing endpoints working
- keep the seed script idempotent
- do not touch frontend code
- do not make unrelated backend changes

Verification:
- migration applies successfully
- seed reruns successfully
- example candidate rows show these structured fields populated
- existing candidate endpoints still work