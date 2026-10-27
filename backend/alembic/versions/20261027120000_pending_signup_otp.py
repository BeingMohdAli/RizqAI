"""Persist hashed signup OTPs without storing passwords.

Revision ID: 20261027120000
Revises: 20261024120000
"""

from alembic import op
import sqlalchemy as sa


revision = "20261027120000"
down_revision = "20261024120000"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "pending_signups",
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("supabase_user_id", sa.String(length=36), nullable=False),
        sa.Column("otp_salt", sa.String(length=64), nullable=False),
        sa.Column("otp_hash", sa.String(length=128), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("email"),
        sa.UniqueConstraint("supabase_user_id"),
    )
    op.create_index("ix_pending_signups_expires_at", "pending_signups", ["expires_at"])


def downgrade() -> None:
    op.drop_index("ix_pending_signups_expires_at", table_name="pending_signups")
    op.drop_table("pending_signups")
    op.drop_index("ix_auth_sessions_user_id", table_name="auth_sessions")
    op.drop_table("auth_sessions")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
