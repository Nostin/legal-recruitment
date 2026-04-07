from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AccountType, FirmProfile, Job, JobStatus, User
from app.schemas.job import JobCreate, JobRead, JobStatusPatch, JobUpdate

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


def _assert_owns_job(row: Job, firm: FirmProfile) -> None:
    if row.firm_profile_id != firm.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this job",
        )


@router.get("", response_model=list[JobRead])
def list_jobs(
    db: Session = Depends(get_db),
    status_filter: JobStatus | None = Query(None, alias="status"),
    firm_user_id: int | None = Query(None),
) -> list[Job]:
    q = db.query(Job)
    if status_filter is not None:
        q = q.filter(Job.status == status_filter)
    if firm_user_id is not None:
        firm = _firm_profile_for_user(db, firm_user_id)
        q = q.filter(Job.firm_profile_id == firm.id)
    return q.order_by(Job.created_at.desc()).all()


@router.get("/{job_id}", response_model=JobRead)
def get_job(job_id: int, db: Session = Depends(get_db)) -> Job:
    row = db.get(Job, job_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return row


@router.post("", response_model=JobRead, status_code=status.HTTP_201_CREATED)
def create_job(body: JobCreate, db: Session = Depends(get_db)) -> Job:
    firm = _firm_profile_for_user(db, body.firm_user_id)
    row = Job(
        firm_profile_id=firm.id,
        role_title=body.role_title.strip(),
        location=body.location.strip(),
        practice_area=body.practice_area.strip(),
        description=body.description.strip(),
        salary_min_k=body.salary_min_k,
        salary_max_k=body.salary_max_k,
        work_arrangement=body.work_arrangement,
        status=JobStatus.open,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/{job_id}", response_model=JobRead)
def update_job(job_id: int, body: JobUpdate, db: Session = Depends(get_db)) -> Job:
    row = db.get(Job, job_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    firm = _firm_profile_for_user(db, body.firm_user_id)
    _assert_owns_job(row, firm)
    if row.status == JobStatus.removed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Removed jobs cannot be edited",
        )

    row.role_title = body.role_title.strip()
    row.location = body.location.strip()
    row.practice_area = body.practice_area.strip()
    row.description = body.description.strip()
    row.salary_min_k = body.salary_min_k
    row.salary_max_k = body.salary_max_k
    row.work_arrangement = body.work_arrangement

    db.commit()
    db.refresh(row)
    return row


@router.patch("/{job_id}", response_model=JobRead)
def patch_job_status(job_id: int, body: JobStatusPatch, db: Session = Depends(get_db)) -> Job:
    row = db.get(Job, job_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    firm = _firm_profile_for_user(db, body.firm_user_id)
    _assert_owns_job(row, firm)

    next_status = JobStatus(body.status)
    if row.status == JobStatus.removed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Job is already removed",
        )
    if row.status == next_status:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Job is already {row.status.value}",
        )

    row.status = next_status
    db.commit()
    db.refresh(row)
    return row
