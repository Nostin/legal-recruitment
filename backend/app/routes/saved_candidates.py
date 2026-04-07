from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AccountType, CandidateProfile, FirmProfile, SavedCandidate, User
from app.schemas.saved_candidate import (
    SavedCandidateCreate,
    SavedCandidateDelete,
    SavedCandidateRead,
)

router = APIRouter()


def _firm_profile_for_user(db: Session, user_id: int) -> FirmProfile:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Firm user not found")
    if user.account_type != AccountType.firm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account_type must be firm",
        )
    firm = db.query(FirmProfile).filter(FirmProfile.user_id == user_id).first()
    if firm is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Firm profile not found for this user",
        )
    return firm


def _to_read(row: SavedCandidate, candidate: CandidateProfile) -> SavedCandidateRead:
    return SavedCandidateRead(
        id=row.id,
        candidate_profile_id=row.candidate_profile_id,
        created_at=row.created_at,
        practice_area=candidate.practice_area,
        title=candidate.title,
        years_post_qualification=candidate.years_post_qualification,
        pqe_is_range=candidate.pqe_is_range,
        pqe_range_min=candidate.pqe_range_min,
        pqe_range_max=candidate.pqe_range_max,
        firm_tier=candidate.firm_tier,
        preferred_locations=candidate.preferred_locations,
    )


@router.get('/for-firm/{user_id}', response_model=list[SavedCandidateRead])
def list_saved_candidates_for_firm(
    user_id: int,
    db: Session = Depends(get_db),
) -> list[SavedCandidateRead]:
    firm = _firm_profile_for_user(db, user_id)
    rows = (
        db.query(SavedCandidate)
        .filter(SavedCandidate.firm_profile_id == firm.id)
        .order_by(SavedCandidate.created_at.desc())
        .all()
    )
    out: list[SavedCandidateRead] = []
    for row in rows:
        cand = db.get(CandidateProfile, row.candidate_profile_id)
        if cand is not None:
            out.append(_to_read(row, cand))
    return out


@router.post('', response_model=SavedCandidateRead, status_code=status.HTTP_201_CREATED)
def save_candidate(
    body: SavedCandidateCreate,
    db: Session = Depends(get_db),
) -> SavedCandidateRead:
    firm = _firm_profile_for_user(db, body.firm_user_id)
    cand = db.get(CandidateProfile, body.candidate_profile_id)
    if cand is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Candidate profile not found')

    row = SavedCandidate(
        firm_profile_id=firm.id,
        candidate_profile_id=cand.id,
    )
    db.add(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail='Candidate already saved by this firm',
        ) from None
    db.refresh(row)
    return _to_read(row, cand)


@router.delete('/{candidate_profile_id}', status_code=status.HTTP_204_NO_CONTENT)
def unsave_candidate(
    candidate_profile_id: int,
    body: SavedCandidateDelete,
    db: Session = Depends(get_db),
) -> None:
    firm = _firm_profile_for_user(db, body.firm_user_id)
    row = (
        db.query(SavedCandidate)
        .filter(
            SavedCandidate.firm_profile_id == firm.id,
            SavedCandidate.candidate_profile_id == candidate_profile_id,
        )
        .first()
    )
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Saved candidate not found')
    db.delete(row)
    db.commit()
