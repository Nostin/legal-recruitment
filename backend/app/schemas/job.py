from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

JobStatus = Literal["open", "closed", "removed"]
WorkArrangement = Literal["remote", "hybrid", "onsite"]


class JobRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    firm_profile_id: int
    role_title: str
    location: str
    practice_area: str
    description: str
    salary_min_k: int | None
    salary_max_k: int | None
    work_arrangement: WorkArrangement
    close_reason: str | None
    status: JobStatus
    posted_at: datetime
    created_at: datetime
    updated_at: datetime


class JobCreate(BaseModel):
    firm_user_id: int = Field(..., description="Local users.id for a firm account")
    role_title: str = Field(..., min_length=1, max_length=255)
    location: str = Field(..., min_length=1, max_length=128)
    practice_area: str = Field(..., min_length=1, max_length=128)
    description: str = Field(..., min_length=1)
    salary_min_k: int | None = Field(None, ge=0, le=5000)
    salary_max_k: int | None = Field(None, ge=0, le=5000)
    work_arrangement: WorkArrangement

    @model_validator(mode="after")
    def validate_salary_range(self):
        if self.salary_min_k is not None and self.salary_max_k is not None:
            if self.salary_min_k > self.salary_max_k:
                raise ValueError("salary_min_k cannot exceed salary_max_k")
        return self


class JobUpdate(BaseModel):
    firm_user_id: int = Field(..., description="Local users.id for a firm account")
    role_title: str = Field(..., min_length=1, max_length=255)
    location: str = Field(..., min_length=1, max_length=128)
    practice_area: str = Field(..., min_length=1, max_length=128)
    description: str = Field(..., min_length=1)
    salary_min_k: int | None = Field(None, ge=0, le=5000)
    salary_max_k: int | None = Field(None, ge=0, le=5000)
    work_arrangement: WorkArrangement

    @model_validator(mode="after")
    def validate_salary_range(self):
        if self.salary_min_k is not None and self.salary_max_k is not None:
            if self.salary_min_k > self.salary_max_k:
                raise ValueError("salary_min_k cannot exceed salary_max_k")
        return self


class JobStatusPatch(BaseModel):
    firm_user_id: int = Field(..., description="Must own the firm profile for this job")
    status: Literal["open", "closed", "removed"]
    close_reason: str | None = Field(None, max_length=2000)
