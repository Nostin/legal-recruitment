import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, func, text
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
    account_type: Mapped[AccountType] = mapped_column(
        Enum(AccountType, name="account_type", native_enum=False, length=32),
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
