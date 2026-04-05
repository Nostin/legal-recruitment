"""
Minimal local development seed. Safe to re-run: skips if seed users already exist.

Usage (from backend directory, venv active):

  python scripts/seed.py
"""

from __future__ import annotations

import sys
from pathlib import Path

# Allow `python scripts/seed.py` without installing the package
_BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from app.database import SessionLocal  # noqa: E402
from app.models import AccountType, CandidateProfile, FirmProfile, User  # noqa: E402


def main() -> None:
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.clerk_user_id == "seed_clerk_candidate").first()
        if existing:
            print("Seed data already present (seed_clerk_candidate exists). Skipping.")
            return

        candidate_user = User(
            clerk_user_id="seed_clerk_candidate",
            email="candidate.seed@example.com",
            account_type=AccountType.candidate,
        )
        firm_user = User(
            clerk_user_id="seed_clerk_firm",
            email="firm.seed@example.com",
            account_type=AccountType.firm,
        )
        db.add(candidate_user)
        db.add(firm_user)
        db.flush()

        db.add(
            CandidateProfile(
                user_id=candidate_user.id,
                practice_area="Corporate / M&A",
                years_post_qualification=5,
                profile_summary="Seed candidate profile for local development.",
            )
        )
        db.add(
            FirmProfile(
                user_id=firm_user.id,
                firm_name="Seed Example Partners",
                office_locations=["Sydney", "Melbourne"],
                hiring_practice_areas=["Corporate / M&A", "Litigation"],
            )
        )
        db.commit()
        print("Seed completed: candidate + firm users and profiles.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
