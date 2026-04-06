"""introduction_requests

Revision ID: c7b2a1d0e4f5
Revises: 493745ef49d0
Create Date: 2026-04-06

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c7b2a1d0e4f5"
down_revision: Union[str, Sequence[str], None] = "493745ef49d0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "introduction_requests",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("firm_profile_id", sa.Integer(), nullable=False),
        sa.Column("candidate_profile_id", sa.Integer(), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "pending",
                "accepted",
                "declined",
                name="introduction_status",
                native_enum=False,
                length=16,
            ),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("role_title", sa.String(length=255), nullable=False),
        sa.Column("role_location", sa.String(length=128), nullable=False),
        sa.Column("practice_area", sa.String(length=128), nullable=False),
        sa.Column("employment_type", sa.String(length=64), nullable=False),
        sa.Column("work_arrangement", sa.String(length=64), nullable=False),
        sa.Column("sponsorship_qualification", sa.String(length=128), nullable=False),
        sa.Column("salary_band", sa.String(length=64), nullable=False),
        sa.Column("firm_message", sa.Text(), nullable=False),
        sa.Column("revealed_firm_name", sa.String(length=255), nullable=True),
        sa.Column("revealed_compensation", sa.String(length=512), nullable=True),
        sa.Column("revealed_role_description", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["candidate_profile_id"],
            ["candidate_profiles.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["firm_profile_id"],
            ["firm_profiles.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "firm_profile_id",
            "candidate_profile_id",
            name="uq_intro_firm_candidate",
        ),
    )
    op.create_index(
        "ix_introduction_requests_candidate_profile_id",
        "introduction_requests",
        ["candidate_profile_id"],
    )
    op.create_index(
        "ix_introduction_requests_firm_profile_id",
        "introduction_requests",
        ["firm_profile_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_introduction_requests_firm_profile_id",
        table_name="introduction_requests",
    )
    op.drop_index(
        "ix_introduction_requests_candidate_profile_id",
        table_name="introduction_requests",
    )
    op.drop_table("introduction_requests")
