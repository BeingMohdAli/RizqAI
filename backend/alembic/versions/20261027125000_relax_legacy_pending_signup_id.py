"""Allow local-auth pending signups without a Supabase user ID.

Revision ID: 20261027125000
Revises: 20261027124500
"""

from alembic import op


revision = "20261027125000"
down_revision = "20261027124500"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "pending_signups",
        "supabase_user_id",
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "pending_signups",
        "supabase_user_id",
        nullable=False,
    )
