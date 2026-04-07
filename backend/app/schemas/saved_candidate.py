from datetime import datetime

from pydantic import BaseModel, Field


class SavedCandidateCreate(BaseModel):
    firm_user_id: int = Field(..., description="Local users.id for a firm account")
    candidate_profile_id: int


class SavedCandidateDelete(BaseModel):
    firm_user_id: int = Field(..., description="Local users.id for a firm account")


class SavedCandidateRead(BaseModel):
    id: int
    candidate_profile_id: int
    created_at: datetime
    practice_area: str | None
    title: str | None
    years_post_qualification: int | None
    pqe_is_range: bool
    pqe_range_min: int | None
    pqe_range_max: int | None
    firm_tier: str | None
    preferred_locations: list[str] | None
