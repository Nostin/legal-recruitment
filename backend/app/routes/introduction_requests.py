from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    AccountType,
    CandidateProfile,
    FirmProfile,
    IntroductionRequest,
    IntroductionStatus,
    User,
)
from app.schemas.introduction import (
    IntroductionCreate,
    IntroductionRead,
    IntroductionStatusPatch,
)

router = APIRouter()


def _intro_to_read(row: IntroductionRequest, firm_name: str) -> IntroductionRead:
    return IntroductionRead(
        id=row.id,
        firm_profile_id=row.firm_profile_id,
        candidate_profile_id=row.candidate_profile_id,
        status=row.status.value,
        firm_name=firm_name,
        role_title=row.role_title,
        role_location=row.role_location,
        practice_area=row.practice_area,
        employment_type=row.employment_type,
        work_arrangement=row.work_arrangement,
        sponsorship_qualification=row.sponsorship_qualification,
        salary_band=row.salary_band,
        firm_message=row.firm_message,
        revealed_firm_name=row.revealed_firm_name,
        revealed_compensation=row.revealed_compensation,
        revealed_role_description=row.revealed_role_description,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


@router.post("", response_model=IntroductionRead, status_code=status.HTTP_201_CREATED)
def create_introduction(
    body: IntroductionCreate,
    db: Session = Depends(get_db),
) -> IntroductionRead:
    firm_user = db.get(User, body.firm_user_id)
    if firm_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Firm user not found",
        )
    if firm_user.account_type != AccountType.firm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account_type must be firm",
        )
    firm_profile = (
        db.query(FirmProfile).filter(FirmProfile.user_id == body.firm_user_id).first()
    )
    if firm_profile is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Firm profile not found for this user",
        )

    candidate = db.get(CandidateProfile, body.candidate_profile_id)
    if candidate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile not found",
        )

    row = IntroductionRequest(
        firm_profile_id=firm_profile.id,
        candidate_profile_id=candidate.id,
        status=IntroductionStatus.pending,
        role_title=body.role_title.strip(),
        role_location=body.role_location.strip(),
        practice_area=body.practice_area.strip(),
        employment_type=body.employment_type.strip(),
        work_arrangement=body.work_arrangement.strip(),
        sponsorship_qualification=body.sponsorship_qualification.strip(),
        salary_band=body.salary_band.strip(),
        firm_message=body.firm_message.strip(),
        revealed_firm_name=(body.revealed_firm_name or "").strip() or None,
        revealed_compensation=(body.revealed_compensation or "").strip() or None,
        revealed_role_description=(body.revealed_role_description or "").strip() or None,
    )
    db.add(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An introduction request already exists for this firm and candidate",
        ) from None
    db.refresh(row)
    return _intro_to_read(row, firm_profile.firm_name)


@router.get("/for-candidate/{user_id}", response_model=list[IntroductionRead])
def list_for_candidate(
    user_id: int,
    db: Session = Depends(get_db),
) -> list[IntroductionRead]:
    cand = (
        db.query(CandidateProfile).filter(CandidateProfile.user_id == user_id).first()
    )
    if cand is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile not found for this user",
        )
    rows = (
        db.query(IntroductionRequest)
        .filter(IntroductionRequest.candidate_profile_id == cand.id)
        .order_by(IntroductionRequest.created_at.desc())
        .all()
    )
    out: list[IntroductionRead] = []
    for row in rows:
        fp = db.get(FirmProfile, row.firm_profile_id)
        firm_name = fp.firm_name if fp else ""
        out.append(_intro_to_read(row, firm_name))
    return out


@router.get("/for-firm/{user_id}", response_model=list[IntroductionRead])
def list_for_firm(
    user_id: int,
    db: Session = Depends(get_db),
) -> list[IntroductionRead]:
    firm_user = db.get(User, user_id)
    if firm_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Firm user not found",
        )
    if firm_user.account_type != AccountType.firm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account_type must be firm",
        )
    firm_profile = (
        db.query(FirmProfile).filter(FirmProfile.user_id == user_id).first()
    )
    if firm_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Firm profile not found for this user",
        )
    rows = (
        db.query(IntroductionRequest)
        .filter(IntroductionRequest.firm_profile_id == firm_profile.id)
        .order_by(IntroductionRequest.created_at.desc())
        .all()
    )
    out: list[IntroductionRead] = []
    for row in rows:
        out.append(_intro_to_read(row, firm_profile.firm_name))
    return out


@router.patch("/{intro_id}", response_model=IntroductionRead)
def patch_introduction_status(
    intro_id: int,
    body: IntroductionStatusPatch,
    db: Session = Depends(get_db),
) -> IntroductionRead:
    row = db.get(IntroductionRequest, intro_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Introduction request not found",
        )
    cand = db.get(CandidateProfile, row.candidate_profile_id)
    if cand is None or cand.user_id != body.candidate_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this introduction request",
        )
    if row.status != IntroductionStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Introduction request is no longer pending",
        )
    row.status = IntroductionStatus(body.status)
    db.commit()
    db.refresh(row)
    fp = db.get(FirmProfile, row.firm_profile_id)
    firm_name = fp.firm_name if fp else ""
    return _intro_to_read(row, firm_name)
