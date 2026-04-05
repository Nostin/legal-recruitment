"""
Local development seed (idempotent).

- Ensures a demo firm user + firm profile (Phase 1 baseline).
- Ensures one legacy demo candidate (seed_clerk_candidate).
- Upserts candidate users/profiles by parsing frontend/data/candidates.ts (see
  app.seeds.candidate_fixtures for column mapping). Re-runs refresh mapped fields.

Usage (from backend directory, venv active):

  python scripts/seed.py
"""

from __future__ import annotations

import sys
from pathlib import Path

_BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from app.database import SessionLocal  # noqa: E402
from app.models import AccountType, CandidateProfile, FirmProfile, User  # noqa: E402
from app.seeds.candidate_fixtures import (  # noqa: E402
    fixture_row_to_candidate_fields,
    load_candidates_from_ts,
)


def _ensure_firm_baseline(db) -> None:
    if db.query(User).filter(User.clerk_user_id == "seed_clerk_firm").first():
        return
    firm_user = User(
        clerk_user_id="seed_clerk_firm",
        email="firm.seed@example.com",
        account_type=AccountType.firm,
    )
    db.add(firm_user)
    db.flush()
    db.add(
        FirmProfile(
            user_id=firm_user.id,
            firm_name="Seed Example Partners",
            office_locations=["Sydney", "Melbourne"],
            hiring_practice_areas=["Corporate / M&A", "Litigation"],
        )
    )


def _ensure_legacy_candidate(db) -> None:
    if db.query(User).filter(User.clerk_user_id == "seed_clerk_candidate").first():
        return
    candidate_user = User(
        clerk_user_id="seed_clerk_candidate",
        email="candidate.seed@example.com",
        account_type=AccountType.candidate,
    )
    db.add(candidate_user)
    db.flush()
    db.add(
        CandidateProfile(
            user_id=candidate_user.id,
            practice_area="Corporate / M&A",
            years_post_qualification=5,
            firm_tier="Top Tier",
            university="University of Melbourne",
            preferred_locations=["Melbourne"],
            profile_summary="Seed candidate profile for local development.",
            open_to_roles=True,
            profile_verified=False,
        )
    )


def _upsert_ts_fixture_candidates(db) -> None:
    """
    Insert or update users/profiles from frontend/data/candidates.ts.
    Idempotent: safe to re-run; refreshes mapped columns on existing seed rows.
    """
    for row in load_candidates_from_ts():
        fixture_id = row["id"]
        clerk_id = f"seed_ts_candidate_{fixture_id}"
        fields = fixture_row_to_candidate_fields(row)

        user = db.query(User).filter(User.clerk_user_id == clerk_id).first()
        if user is None:
            user = User(
                clerk_user_id=clerk_id,
                email=f"candidate.ts.{fixture_id}.seed@example.com",
                account_type=AccountType.candidate,
            )
            db.add(user)
            db.flush()

        profile = (
            db.query(CandidateProfile)
            .filter(CandidateProfile.user_id == user.id)
            .first()
        )
        if profile is None:
            db.add(CandidateProfile(user_id=user.id, **fields))
        else:
            for key, value in fields.items():
                setattr(profile, key, value)


def main() -> None:
    db = SessionLocal()
    try:
        _ensure_firm_baseline(db)
        _ensure_legacy_candidate(db)
        _upsert_ts_fixture_candidates(db)
        db.commit()
        n_profiles = db.query(CandidateProfile).count()
        print(f"Seed completed. Total candidate_profiles: {n_profiles}")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
