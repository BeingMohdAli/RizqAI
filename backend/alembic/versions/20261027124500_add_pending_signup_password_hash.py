"""Add the hashed password column to legacy pending signup rows.

Revision ID: 20261027124500
Revises: 20261027120000
"""

from alembic import op
import sqlalchemy as sa


revision = "20261027124500"
down_revision = "20261027120000"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # The previous revision was already applied in some environments before
    # password_hash was added to the model. Keep existing pending OTP records
    # and make the new value nullable only for those legacy rows. Every new
    # request writes a non-null PBKDF2 hash before commit.
    op.add_column(
        "pending_signups",
        sa.Column("password_hash", sa.String(length=256), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("pending_signups", "password_hash")
