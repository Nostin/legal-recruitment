import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint, func, text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AccountType(str, enum.Enum):
    candidate = "candidate"
    firm = "firm"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    clerk_user_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    account_type: Mapped[AccountType | None] = mapped_column(
        Enum(AccountType, name="account_type", native_enum=False, length=32),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    candidate_profile: Mapped["CandidateProfile | None"] = relationship(
        back_populates="user",
        uselist=False,
    )
    firm_profile: Mapped["FirmProfile | None"] = relationship(
        back_populates="user",
        uselist=False,
    )


class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    practice_area: Mapped[str | None] = mapped_column(String(128), nullable=True)
    years_post_qualification: Mapped[int | None] = mapped_column(Integer, nullable=True)
    pqe_is_range: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=text("false"),
        default=False,
    )
    pqe_range_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    pqe_range_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    firm_tier: Mapped[str | None] = mapped_column(String(64), nullable=True)
    university: Mapped[str | None] = mapped_column(String(128), nullable=True)
    preferred_locations: Mapped[list[str] | None] = mapped_column(
        ARRAY(String(64)),
        nullable=True,
    )
    title: Mapped[str | None] = mapped_column(String(128), nullable=True)
    current_firm: Mapped[str | None] = mapped_column(String(255), nullable=True)
    former_firms: Mapped[str | None] = mapped_column(Text, nullable=True)
    trainee_firm: Mapped[str | None] = mapped_column(String(255), nullable=True)
    primary_admission: Mapped[str | None] = mapped_column(String(32), nullable=True)
    admission_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    source_profile_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    profile_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    salary_min_k: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_max_k: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_disclosed: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=text("false"),
        default=False,
    )
    languages: Mapped[list[str] | None] = mapped_column(
        ARRAY(String(64)),
        nullable=True,
    )
    employment_types: Mapped[list[str] | None] = mapped_column(
        ARRAY(String(64)),
        nullable=True,
    )
    work_arrangements: Mapped[list[str] | None] = mapped_column(
        ARRAY(String(64)),
        nullable=True,
    )
    excluded_firms: Mapped[list[str] | None] = mapped_column(
        ARRAY(String(128)),
        nullable=True,
    )
    preferred_destinations: Mapped[list[str] | None] = mapped_column(
        ARRAY(String(128)),
        nullable=True,
    )
    specific_firm_preference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    verification_professional_email: Mapped[str | None] = mapped_column(
        String(320),
        nullable=True,
    )
    linkedin_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    open_to_roles: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=text("true"),
        default=True,
    )
    profile_verified: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=text("false"),
        default=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(back_populates="candidate_profile")
    saved_by_firms: Mapped[list["SavedCandidate"]] = relationship(
        back_populates="candidate_profile",
        cascade="all, delete-orphan",
    )
    job_interest_submissions: Mapped[list["JobInterestSubmission"]] = relationship(
        back_populates="candidate_profile",
        cascade="all, delete-orphan",
    )


class FirmProfile(Base):
    __tablename__ = "firm_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    firm_name: Mapped[str] = mapped_column(String(255), nullable=False)
    office_locations: Mapped[list[str] | None] = mapped_column(
        ARRAY(String(128)),
        nullable=True,
    )
    hiring_practice_areas: Mapped[list[str] | None] = mapped_column(
        ARRAY(String(128)),
        nullable=True,
    )
    hiring_partners_band: Mapped[str | None] = mapped_column(
        String(32),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(back_populates="firm_profile")
    jobs: Mapped[list["Job"]] = relationship(
        back_populates="firm_profile",
        cascade="all, delete-orphan",
    )
    saved_candidates: Mapped[list["SavedCandidate"]] = relationship(
        back_populates="firm_profile",
        cascade="all, delete-orphan",
    )


class IntroductionStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    declined = "declined"


class IntroductionRequest(Base):
    __tablename__ = "introduction_requests"
    __table_args__ = (
        UniqueConstraint(
            "firm_profile_id",
            "candidate_profile_id",
            name="uq_intro_firm_candidate",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    firm_profile_id: Mapped[int] = mapped_column(
        ForeignKey("firm_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    candidate_profile_id: Mapped[int] = mapped_column(
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[IntroductionStatus] = mapped_column(
        Enum(IntroductionStatus, name="introduction_status", native_enum=False, length=16),
        nullable=False,
        server_default=text("'pending'"),
        default=IntroductionStatus.pending,
    )
    role_title: Mapped[str] = mapped_column(String(255), nullable=False)
    role_location: Mapped[str] = mapped_column(String(128), nullable=False)
    practice_area: Mapped[str] = mapped_column(String(128), nullable=False)
    employment_type: Mapped[str] = mapped_column(String(64), nullable=False)
    work_arrangement: Mapped[str] = mapped_column(String(64), nullable=False)
    sponsorship_qualification: Mapped[str] = mapped_column(String(128), nullable=False)
    salary_band: Mapped[str] = mapped_column(String(64), nullable=False)
    firm_message: Mapped[str] = mapped_column(Text, nullable=False)
    revealed_firm_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    revealed_compensation: Mapped[str | None] = mapped_column(String(512), nullable=True)
    revealed_role_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    firm_profile: Mapped["FirmProfile"] = relationship()
    candidate_profile: Mapped["CandidateProfile"] = relationship()


class JobStatus(str, enum.Enum):
    open = "open"
    closed = "closed"
    removed = "removed"


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    firm_profile_id: Mapped[int] = mapped_column(
        ForeignKey("firm_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role_title: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str] = mapped_column(String(128), nullable=False)
    practice_area: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    salary_min_k: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_max_k: Mapped[int | None] = mapped_column(Integer, nullable=True)
    work_arrangement: Mapped[str] = mapped_column(String(32), nullable=False)
    close_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[JobStatus] = mapped_column(
        Enum(JobStatus, name="job_status", native_enum=False, length=16),
        nullable=False,
        server_default=text("'open'"),
        default=JobStatus.open,
    )
    posted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    firm_profile: Mapped["FirmProfile"] = relationship(back_populates="jobs")
    interest_submissions: Mapped[list["JobInterestSubmission"]] = relationship(
        back_populates="job",
        cascade="all, delete-orphan",
    )


class SavedCandidate(Base):
    __tablename__ = "saved_candidates"
    __table_args__ = (
        UniqueConstraint(
            "firm_profile_id",
            "candidate_profile_id",
            name="uq_saved_candidate_firm_candidate",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    firm_profile_id: Mapped[int] = mapped_column(
        ForeignKey("firm_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    candidate_profile_id: Mapped[int] = mapped_column(
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    firm_profile: Mapped["FirmProfile"] = relationship(back_populates="saved_candidates")
    candidate_profile: Mapped["CandidateProfile"] = relationship(back_populates="saved_by_firms")


class JobInterestSubmission(Base):
    __tablename__ = "job_interest_submissions"
    __table_args__ = (
        UniqueConstraint(
            "job_id",
            "candidate_profile_id",
            name="uq_job_interest_job_candidate",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    job_id: Mapped[int] = mapped_column(
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    candidate_profile_id: Mapped[int] = mapped_column(
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    job: Mapped["Job"] = relationship(back_populates="interest_submissions")
    candidate_profile: Mapped["CandidateProfile"] = relationship(
        back_populates="job_interest_submissions"
    )
