from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AccountType, FirmProfile, User
from app.schemas.firm import FirmCreate, FirmRead, FirmUpdate

router = APIRouter()


@router.get("/{firm_id}", response_model=FirmRead)
def get_firm(firm_id: int, db: Session = Depends(get_db)) -> FirmProfile:
    row = db.get(FirmProfile, firm_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Firm profile not found",
        )
    return row


@router.post("", response_model=FirmRead, status_code=status.HTTP_201_CREATED)
def create_firm(body: FirmCreate, db: Session = Depends(get_db)) -> FirmProfile:
    user = db.get(User, body.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    if user.account_type != AccountType.firm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account_type must be firm",
        )
    existing = (
        db.query(FirmProfile).filter(FirmProfile.user_id == body.user_id).first()
    )
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This user already has a firm profile",
        )

    row = FirmProfile(
        user_id=body.user_id,
        firm_name=body.firm_name,
        office_locations=body.office_locations,
        hiring_practice_areas=body.hiring_practice_areas,
        hiring_partners_band=body.hiring_partners_band,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/{firm_id}", response_model=FirmRead)
def update_firm(
    firm_id: int,
    body: FirmUpdate,
    db: Session = Depends(get_db),
) -> FirmProfile:
    row = db.get(FirmProfile, firm_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Firm profile not found",
        )

    data = body.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(row, key, value)

    db.commit()
    db.refresh(row)
    return row
