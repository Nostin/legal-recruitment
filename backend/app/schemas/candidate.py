from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CandidateRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    practice_area: str | None
    years_post_qualification: int | None
    pqe_is_range: bool
    pqe_range_min: int | None
    pqe_range_max: int | None
    firm_tier: str | None
    university: str | None
    preferred_locations: list[str] | None
    title: str | None
    current_firm: str | None
    former_firms: str | None
    trainee_firm: str | None
    primary_admission: str | None
    admission_year: int | None
    source_profile_url: str | None
    profile_summary: str | None
    salary_min_k: int | None
    salary_max_k: int | None
    salary_disclosed: bool
    languages: list[str] | None
    employment_types: list[str] | None
    work_arrangements: list[str] | None
    excluded_firms: list[str] | None
    preferred_destinations: list[str] | None
    specific_firm_preference: str | None
    verification_professional_email: str | None
    linkedin_url: str | None
    open_to_roles: bool
    profile_verified: bool
    created_at: datetime
    updated_at: datetime


class CandidateCreate(BaseModel):
    user_id: int = Field(..., description="Local users.id for a candidate account")
    practice_area: str | None = None
    years_post_qualification: int | None = None
    pqe_is_range: bool = False
    pqe_range_min: int | None = None
    pqe_range_max: int | None = None
    firm_tier: str | None = None
    university: str | None = None
    preferred_locations: list[str] | None = None
    title: str | None = None
    current_firm: str | None = None
    former_firms: str | None = None
    trainee_firm: str | None = None
    primary_admission: str | None = None
    admission_year: int | None = None
    source_profile_url: str | None = None
    profile_summary: str | None = None
    salary_min_k: int | None = None
    salary_max_k: int | None = None
    salary_disclosed: bool = False
    languages: list[str] | None = None
    employment_types: list[str] | None = None
    work_arrangements: list[str] | None = None
    excluded_firms: list[str] | None = None
    preferred_destinations: list[str] | None = None
    specific_firm_preference: str | None = None
    verification_professional_email: str | None = None
    linkedin_url: str | None = None
    open_to_roles: bool = True
    profile_verified: bool = False


class CandidateUpdate(BaseModel):
    practice_area: str | None = None
    years_post_qualification: int | None = None
    pqe_is_range: bool | None = None
    pqe_range_min: int | None = None
    pqe_range_max: int | None = None
    firm_tier: str | None = None
    university: str | None = None
    preferred_locations: list[str] | None = None
    title: str | None = None
    current_firm: str | None = None
    former_firms: str | None = None
    trainee_firm: str | None = None
    primary_admission: str | None = None
    admission_year: int | None = None
    source_profile_url: str | None = None
    profile_summary: str | None = None
    salary_min_k: int | None = None
    salary_max_k: int | None = None
    salary_disclosed: bool | None = None
    languages: list[str] | None = None
    employment_types: list[str] | None = None
    work_arrangements: list[str] | None = None
    excluded_firms: list[str] | None = None
    preferred_destinations: list[str] | None = None
    specific_firm_preference: str | None = None
    verification_professional_email: str | None = None
    linkedin_url: str | None = None
    open_to_roles: bool | None = None
    profile_verified: bool | None = None
