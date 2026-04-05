"""
Seed firm users + profiles aligned with frontend firm onboarding field shapes.

Each entry: clerk_user_id, email, firm_name, office_locations, hiring_practice_areas,
hiring_partners_band (matches Select values: 1-3, 4-10, 11+).
"""

from __future__ import annotations

from typing import Any, TypedDict


class FirmFixture(TypedDict):
    clerk_user_id: str
    email: str
    firm_name: str
    office_locations: list[str]
    hiring_practice_areas: list[str]
    hiring_partners_band: str


# Realistic local dev firms (not placeholders); mirrors onboarding options.
FIRM_FIXTURES: list[FirmFixture] = [
    {
        "clerk_user_id": "seed_clerk_firm",
        "email": "firm.seed@example.com",
        "firm_name": "Herbert Smith Freehills",
        "office_locations": ["Melbourne", "Sydney"],
        "hiring_practice_areas": ["Corporate / M&A", "Banking & Finance", "Litigation"],
        "hiring_partners_band": "4-10",
    },
    {
        "clerk_user_id": "seed_firm_gilbert_tobin",
        "email": "firm.gtlaw.seed@example.com",
        "firm_name": "Gilbert + Tobin",
        "office_locations": ["Sydney", "Melbourne"],
        "hiring_practice_areas": ["IP / Technology", "Corporate / M&A"],
        "hiring_partners_band": "1-3",
    },
    {
        "clerk_user_id": "seed_firm_ashurst",
        "email": "firm.ashurst.seed@example.com",
        "firm_name": "Ashurst",
        "office_locations": ["Melbourne", "Brisbane", "Perth"],
        "hiring_practice_areas": ["Real Estate", "Construction", "Banking & Finance"],
        "hiring_partners_band": "11+",
    },
]


def fixture_to_profile_fields(f: FirmFixture) -> dict[str, Any]:
    return {
        "firm_name": f["firm_name"],
        "office_locations": f["office_locations"],
        "hiring_practice_areas": f["hiring_practice_areas"],
        "hiring_partners_band": f["hiring_partners_band"],
    }
