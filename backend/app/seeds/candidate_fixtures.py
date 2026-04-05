"""
Candidate fixtures sourced from frontend/data/candidates.ts (parsed at seed time).

We do not store real names on profiles (anonymous product model). See
SOURCE_FIELD_MAPPING for column mapping.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# SOURCE_FIELD_MAPPING (candidates.ts -> candidate_profiles)
# ---------------------------------------------------------------------------
# area                 -> practice_area
# rawPracticeArea      -> profile_summary line when different from area
# pqe                  -> years_post_qualification
# tier                 -> firm_tier
# uni                  -> university
# location             -> preferred_locations (single-element array)
# notes                -> profile_summary (free-text)
# title                -> title
# currentFirm          -> current_firm
# formerFirms          -> former_firms (comma-separated text as in source)
# traineeFirm          -> trainee_firm
# primaryAdmission     -> primary_admission
# admissionYear        -> admission_year
# profile              -> source_profile_url (any URL); if linkedin.com also
#                        sets linkedin_url
# verified             -> profile_verified
# id                   -> seed key only (clerk_user_id suffix)
#
# No column (by design / gap):
#   - name (PII)
#   - showCurrentFirm, showUniversity, showFormerFirms, showTraineeFirm,
#     showAdmission
# ---------------------------------------------------------------------------

REPO_ROOT = Path(__file__).resolve().parents[3]
CANDIDATES_TS_PATH = REPO_ROOT / "frontend" / "data" / "candidates.ts"


def _strip_trailing_commas(json_like: str) -> str:
    out = json_like
    prev = None
    while prev != out:
        prev = out
        out = re.sub(r",(\s*[}\]])", r"\1", out)
    return out


def load_candidates_from_ts(path: Path | None = None) -> list[dict[str, Any]]:
    """Parse the exported array from candidates.ts into Python dicts."""
    ts_path = path or CANDIDATES_TS_PATH
    if not ts_path.is_file():
        raise FileNotFoundError(
            f"Cannot load fixtures: {ts_path} not found (expected OpenCourt repo layout).",
        )
    text = ts_path.read_text(encoding="utf-8")
    m = re.search(r"export const candidates = (\[[\s\S]*\]);?\s*$", text)
    if not m:
        raise ValueError(f"Could not find candidates array in {ts_path}")
    raw = _strip_trailing_commas(m.group(1))
    data = json.loads(raw)
    if not isinstance(data, list):
        raise ValueError("candidates export is not a JSON array")
    return data


def _linkedin_url_only(url: str | None) -> str | None:
    if not url or not isinstance(url, str):
        return None
    u = url.strip()
    if "linkedin.com" in u.lower():
        return u[:512]
    return None


def _source_profile_url(url: str | None) -> str | None:
    if not url or not isinstance(url, str):
        return None
    return url.strip()[:1024]


def _build_profile_summary(row: dict[str, Any]) -> str | None:
    """Only fields without dedicated columns: notes + raw practice tag."""
    lines: list[str] = []

    notes = row.get("notes")
    if notes:
        lines.append(str(notes))

    area = row.get("area")
    raw_pa = row.get("rawPracticeArea")
    if raw_pa and raw_pa != area:
        lines.append(f"Practice detail: {raw_pa}")

    if not lines:
        return None
    return "\n".join(lines)


def fixture_row_to_candidate_fields(row: dict[str, Any]) -> dict[str, Any]:
    """
    Map one candidates.ts object to CandidateProfile constructor kwargs
    (excluding user_id / id).
    """
    area = row.get("area")
    if area is not None:
        area = str(area)[:128]

    loc = row.get("location")
    preferred = [str(loc)] if loc else None

    profile_url = row.get("profile")

    title = row.get("title")
    if title is not None:
        title = str(title)[:128]

    cf = row.get("currentFirm")
    if cf is not None:
        cf = str(cf)[:255]

    ff = row.get("formerFirms")
    if ff is not None:
        ff = str(ff)

    tf = row.get("traineeFirm")
    if tf is not None:
        tf = str(tf)[:255]

    adm = row.get("primaryAdmission")
    if adm is not None:
        adm = str(adm)[:32]

    yr = row.get("admissionYear")
    if yr is not None and not isinstance(yr, int):
        try:
            yr = int(yr)
        except (TypeError, ValueError):
            yr = None

    return {
        "practice_area": area,
        "years_post_qualification": row.get("pqe"),
        "pqe_is_range": False,
        "pqe_range_min": None,
        "pqe_range_max": None,
        "firm_tier": (str(row["tier"])[:64] if row.get("tier") is not None else None),
        "university": (str(row["uni"])[:128] if row.get("uni") is not None else None),
        "preferred_locations": preferred,
        "title": title,
        "current_firm": cf,
        "former_firms": ff,
        "trainee_firm": tf,
        "primary_admission": adm,
        "admission_year": yr,
        "source_profile_url": _source_profile_url(profile_url),
        "profile_summary": _build_profile_summary(row),
        "linkedin_url": _linkedin_url_only(profile_url),
        "open_to_roles": True,
        "profile_verified": bool(row.get("verified", False)),
    }
