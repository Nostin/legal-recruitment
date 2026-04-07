"""jobs foundation

Revision ID: 1f2c3d4e5a6b
Revises: c7b2a1d0e4f5
Create Date: 2026-04-07

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "1f2c3d4e5a6b"
down_revision: Union[str, Sequence[str], None] = "c7b2a1d0e4f5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "jobs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("firm_profile_id", sa.Integer(), nullable=False),
        sa.Column("role_title", sa.String(length=255), nullable=False),
        sa.Column("location", sa.String(length=128), nullable=False),
        sa.Column("practice_area", sa.String(length=128), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("salary_min_k", sa.Integer(), nullable=True),
        sa.Column("salary_max_k", sa.Integer(), nullable=True),
        sa.Column("work_arrangement", sa.String(length=32), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "open",
                "closed",
                "removed",
                name="job_status",
                native_enum=False,
                length=16,
            ),
            nullable=False,
            server_default="open",
        ),
        sa.Column(
            "posted_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
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
        sa.ForeignKeyConstraint(["firm_profile_id"], ["firm_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_jobs_firm_profile_id", "jobs", ["firm_profile_id"])


def downgrade() -> None:
    op.drop_index("ix_jobs_firm_profile_id", table_name="jobs")
    op.drop_table("jobs")
