"""job interest submissions

Revision ID: 7c8d9e0f1a2b
Revises: 6b7c8d9e0f1a
Create Date: 2026-04-07

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "7c8d9e0f1a2b"
down_revision: Union[str, Sequence[str], None] = "6b7c8d9e0f1a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "job_interest_submissions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("job_id", sa.Integer(), nullable=False),
        sa.Column("candidate_profile_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["candidate_profile_id"], ["candidate_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("job_id", "candidate_profile_id", name="uq_job_interest_job_candidate"),
    )
    op.create_index("ix_job_interest_submissions_job_id", "job_interest_submissions", ["job_id"])
    op.create_index("ix_job_interest_submissions_candidate_profile_id", "job_interest_submissions", ["candidate_profile_id"])


def downgrade() -> None:
    op.drop_index("ix_job_interest_submissions_candidate_profile_id", table_name="job_interest_submissions")
    op.drop_index("ix_job_interest_submissions_job_id", table_name="job_interest_submissions")
    op.drop_table("job_interest_submissions")
