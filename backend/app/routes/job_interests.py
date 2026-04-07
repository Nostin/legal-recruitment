from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import CandidateProfile, Job, JobInterestSubmission, JobStatus, User
from app.schemas.job_interest import JobInterestCreate, JobInterestRead

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


@router.get('/for-candidate/{user_id}', response_model=list[JobInterestRead])
def list_for_candidate(user_id: int, db: Session = Depends(get_db)) -> list[JobInterestSubmission]:
    cand = _candidate_profile_for_user(db, user_id)
    return (
        db.query(JobInterestSubmission)
        .filter(JobInterestSubmission.candidate_profile_id == cand.id)
        .order_by(JobInterestSubmission.created_at.desc())
        .all()
    )


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
