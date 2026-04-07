from datetime import datetime

from pydantic import BaseModel, Field


class JobInterestCreate(BaseModel):
    candidate_user_id: int = Field(..., description="Local users.id for candidate")
    job_id: int


class JobInterestRead(BaseModel):
    id: int
    job_id: int
    candidate_profile_id: int
    created_at: datetime


class JobInterestFirmRead(BaseModel):
    id: int
    job_id: int
    candidate_profile_id: int
    created_at: datetime
    job_role_title: str
    job_location: str
    job_practice_area: str
    candidate_practice_area: str | None
    candidate_years_post_qualification: int | None
    candidate_pqe_is_range: bool
    candidate_pqe_range_min: int | None
    candidate_pqe_range_max: int | None
    candidate_firm_tier: str | None
