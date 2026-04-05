from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AccountType, CandidateProfile, User
from app.schemas.candidate import CandidateCreate, CandidateRead, CandidateUpdate

router = APIRouter()


def _validate_pqe_payload(
    *,
    pqe_is_range: bool,
    pqe_range_min: int | None,
    pqe_range_max: int | None,
) -> None:
    if pqe_is_range:
        if pqe_range_min is None or pqe_range_max is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="pqe_range_min and pqe_range_max are required when pqe_is_range is true",
            )
        if pqe_range_min > pqe_range_max:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="pqe_range_min cannot be greater than pqe_range_max",
            )


@router.get("", response_model=list[CandidateRead])
def list_candidates(db: Session = Depends(get_db)) -> list[CandidateProfile]:
    return (
        db.query(CandidateProfile)
        .order_by(CandidateProfile.id.asc())
        .all()
    )


@router.get("/{candidate_id}", response_model=CandidateRead)
def get_candidate(candidate_id: int, db: Session = Depends(get_db)) -> CandidateProfile:
    row = db.get(CandidateProfile, candidate_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile not found",
        )
    return row


@router.post("", response_model=CandidateRead, status_code=status.HTTP_201_CREATED)
def create_candidate(body: CandidateCreate, db: Session = Depends(get_db)) -> CandidateProfile:
    user = db.get(User, body.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    if user.account_type != AccountType.candidate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account_type must be candidate",
        )
    existing = (
        db.query(CandidateProfile)
        .filter(CandidateProfile.user_id == body.user_id)
        .first()
    )
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This user already has a candidate profile",
        )

    _validate_pqe_payload(
        pqe_is_range=body.pqe_is_range,
        pqe_range_min=body.pqe_range_min,
        pqe_range_max=body.pqe_range_max,
    )

    row = CandidateProfile(
        user_id=body.user_id,
        practice_area=body.practice_area,
        years_post_qualification=body.years_post_qualification,
        pqe_is_range=body.pqe_is_range,
        pqe_range_min=body.pqe_range_min,
        pqe_range_max=body.pqe_range_max,
        firm_tier=body.firm_tier,
        university=body.university,
        preferred_locations=body.preferred_locations,
        title=body.title,
        current_firm=body.current_firm,
        former_firms=body.former_firms,
        trainee_firm=body.trainee_firm,
        primary_admission=body.primary_admission,
        admission_year=body.admission_year,
        source_profile_url=body.source_profile_url,
        profile_summary=body.profile_summary,
        salary_min_k=body.salary_min_k,
        salary_max_k=body.salary_max_k,
        salary_disclosed=body.salary_disclosed,
        languages=body.languages,
        employment_types=body.employment_types,
        work_arrangements=body.work_arrangements,
        excluded_firms=body.excluded_firms,
        preferred_destinations=body.preferred_destinations,
        specific_firm_preference=body.specific_firm_preference,
        verification_professional_email=body.verification_professional_email,
        linkedin_url=body.linkedin_url,
        open_to_roles=body.open_to_roles,
        profile_verified=body.profile_verified,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/{candidate_id}", response_model=CandidateRead)
def update_candidate(
    candidate_id: int,
    body: CandidateUpdate,
    db: Session = Depends(get_db),
) -> CandidateProfile:
    row = db.get(CandidateProfile, candidate_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile not found",
        )

    data = body.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(row, key, value)

    merged_is_range = row.pqe_is_range
    merged_min = row.pqe_range_min
    merged_max = row.pqe_range_max
    _validate_pqe_payload(
        pqe_is_range=merged_is_range,
        pqe_range_min=merged_min,
        pqe_range_max=merged_max,
    )

    db.commit()
    db.refresh(row)
    return row
