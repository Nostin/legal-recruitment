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
