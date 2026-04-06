from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class IntroductionCreate(BaseModel):
    firm_user_id: int = Field(..., description="Local users.id for the hiring firm")
    candidate_profile_id: int
    role_title: str = Field(..., min_length=1, max_length=255)
    role_location: str = Field(..., min_length=1, max_length=128)
    practice_area: str = Field(..., min_length=1, max_length=128)
    employment_type: str = Field(..., min_length=1, max_length=64)
    work_arrangement: str = Field(..., min_length=1, max_length=64)
    sponsorship_qualification: str = Field(..., min_length=1, max_length=128)
    salary_band: str = Field(..., min_length=1, max_length=64)
    firm_message: str = Field(..., min_length=1)
    revealed_firm_name: str | None = Field(None, max_length=255)
    revealed_compensation: str | None = Field(None, max_length=512)
    revealed_role_description: str | None = None


class IntroductionStatusPatch(BaseModel):
    candidate_user_id: int = Field(..., description="Must own the candidate profile")
    status: Literal["accepted", "declined"]


class IntroductionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    firm_profile_id: int
    candidate_profile_id: int
    status: Literal["pending", "accepted", "declined"]
    firm_name: str
    role_title: str
    role_location: str
    practice_area: str
    employment_type: str
    work_arrangement: str
    sponsorship_qualification: str
    salary_band: str
    firm_message: str
    revealed_firm_name: str | None
    revealed_compensation: str | None
    revealed_role_description: str | None
    created_at: datetime
    updated_at: datetime
