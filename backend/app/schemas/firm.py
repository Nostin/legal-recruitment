from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

HiringPartnersBand = Literal["1-3", "4-10", "11+"]


class FirmRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    firm_name: str
    office_locations: list[str] | None
    hiring_practice_areas: list[str] | None
    hiring_partners_band: str | None
    created_at: datetime
    updated_at: datetime


class FirmCreate(BaseModel):
    user_id: int = Field(..., description="Local users.id for a firm account")
    firm_name: str = Field(..., min_length=1, max_length=255)
    office_locations: list[str] | None = None
    hiring_practice_areas: list[str] | None = None
    hiring_partners_band: HiringPartnersBand | None = None


class FirmUpdate(BaseModel):
    firm_name: str | None = Field(None, min_length=1, max_length=255)
    office_locations: list[str] | None = None
    hiring_practice_areas: list[str] | None = None
    hiring_partners_band: HiringPartnersBand | None = None
