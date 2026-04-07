"""saved candidates and job close reason

Revision ID: 6b7c8d9e0f1a
Revises: 1f2c3d4e5a6b
Create Date: 2026-04-07

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "6b7c8d9e0f1a"
down_revision: Union[str, Sequence[str], None] = "1f2c3d4e5a6b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("jobs", sa.Column("close_reason", sa.Text(), nullable=True))

    op.create_table(
        "saved_candidates",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("firm_profile_id", sa.Integer(), nullable=False),
        sa.Column("candidate_profile_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["firm_profile_id"], ["firm_profiles.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["candidate_profile_id"], ["candidate_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("firm_profile_id", "candidate_profile_id", name="uq_saved_candidate_firm_candidate"),
    )
    op.create_index("ix_saved_candidates_firm_profile_id", "saved_candidates", ["firm_profile_id"])
    op.create_index("ix_saved_candidates_candidate_profile_id", "saved_candidates", ["candidate_profile_id"])


def downgrade() -> None:
    op.drop_index("ix_saved_candidates_candidate_profile_id", table_name="saved_candidates")
    op.drop_index("ix_saved_candidates_firm_profile_id", table_name="saved_candidates")
    op.drop_table("saved_candidates")
    op.drop_column("jobs", "close_reason")
