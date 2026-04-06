from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict


class AccountTypeEnum(str, Enum):
    candidate = "candidate"
    firm = "firm"


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    clerk_user_id: str
    email: str
    account_type: AccountTypeEnum | None
    created_at: datetime
    updated_at: datetime
