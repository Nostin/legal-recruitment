from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AccountType, CandidateProfile, FirmProfile, Job, JobInterestSubmission, JobStatus, User
from app.schemas.job_interest import JobInterestCreate, JobInterestFirmRead, JobInterestRead

router = APIRouter()


def _candidate_profile_for_user(db: Session, user_id: int) -> CandidateProfile:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate user not found")
    if user.account_type is None or user.account_type.value != "candidate":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account_type must be candidate",
        )
    cand = db.query(CandidateProfile).filter(CandidateProfile.user_id == user_id).first()
    if cand is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile not found for this user",
        )
    return cand


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


@router.get('/for-candidate/{user_id}', response_model=list[JobInterestRead])
def list_for_candidate(user_id: int, db: Session = Depends(get_db)) -> list[JobInterestSubmission]:
    cand = _candidate_profile_for_user(db, user_id)
    return (
        db.query(JobInterestSubmission)
        .filter(JobInterestSubmission.candidate_profile_id == cand.id)
        .order_by(JobInterestSubmission.created_at.desc())
        .all()
    )


@router.get('/for-firm/{user_id}', response_model=list[JobInterestFirmRead])
def list_for_firm(
    user_id: int,
    db: Session = Depends(get_db),
) -> list[JobInterestFirmRead]:
    firm = _firm_profile_for_user(db, user_id)
    rows = (
        db.query(JobInterestSubmission)
        .join(Job, Job.id == JobInterestSubmission.job_id)
        .filter(Job.firm_profile_id == firm.id)
        .order_by(JobInterestSubmission.created_at.desc())
        .all()
    )
    out: list[JobInterestFirmRead] = []
    for row in rows:
        job = db.get(Job, row.job_id)
        cand = db.get(CandidateProfile, row.candidate_profile_id)
        if job is None or cand is None:
            continue
        out.append(
            JobInterestFirmRead(
                id=row.id,
                job_id=row.job_id,
                candidate_profile_id=row.candidate_profile_id,
                created_at=row.created_at,
                job_role_title=job.role_title,
                job_location=job.location,
                job_practice_area=job.practice_area,
                candidate_practice_area=cand.practice_area,
                candidate_years_post_qualification=cand.years_post_qualification,
                candidate_pqe_is_range=cand.pqe_is_range,
                candidate_pqe_range_min=cand.pqe_range_min,
                candidate_pqe_range_max=cand.pqe_range_max,
                candidate_firm_tier=cand.firm_tier,
            )
        )
    return out


@router.post('', response_model=JobInterestRead, status_code=status.HTTP_201_CREATED)
def create_job_interest(body: JobInterestCreate, db: Session = Depends(get_db)) -> JobInterestSubmission:
    cand = _candidate_profile_for_user(db, body.candidate_user_id)
    job = db.get(Job, body.job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    if job.status != JobStatus.open:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Job is not open")

    row = JobInterestSubmission(job_id=job.id, candidate_profile_id=cand.id)
    db.add(row)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Interest already submitted for this job",
        ) from None
    db.refresh(row)
    return row
