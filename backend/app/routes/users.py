from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AccountType, User

router = APIRouter()


class UserBootstrapCreate(BaseModel):
    clerk_user_id: str = Field(..., max_length=255)
    email: str = Field(..., max_length=320)


class UserBootstrapRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    clerk_user_id: str
    email: str
    account_type: Literal["candidate", "firm"] | None
    created_at: datetime
    updated_at: datetime


class AccountTypePatchBody(BaseModel):
    clerk_user_id: str = Field(..., max_length=255)
    account_type: Literal["candidate", "firm"]


@router.post("/bootstrap", response_model=UserBootstrapRead)
def bootstrap_user(body: UserBootstrapCreate, db: Session = Depends(get_db)) -> User:
    existing = (
        db.query(User).filter(User.clerk_user_id == body.clerk_user_id).first()
    )
    if existing is not None:
        return existing

    user = User(
        clerk_user_id=body.clerk_user_id,
        email=body.email.strip(),
        account_type=None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/by-clerk/{clerk_user_id}", response_model=UserBootstrapRead)
def get_user_by_clerk(clerk_user_id: str, db: Session = Depends(get_db)) -> User:
    row = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return row


@router.patch("/account-type", response_model=UserBootstrapRead)
def set_account_type(body: AccountTypePatchBody, db: Session = Depends(get_db)) -> User:
    row = db.query(User).filter(User.clerk_user_id == body.clerk_user_id).first()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    if row.account_type is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Account type already set",
        )
    row.account_type = AccountType(body.account_type)
    db.commit()
    db.refresh(row)
    return row
