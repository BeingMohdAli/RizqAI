"""Remove conversation, message, and profile persistence.

Revision ID: 20261027131500
Revises: 20261027130000
"""

from alembic import op


revision = "20261027131500"
down_revision = "20261027130000"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_table("user_profiles")
    op.drop_table("messages")
    op.drop_table("conversations")


def downgrade() -> None:
    raise NotImplementedError("The removed persistence tables are not restored by downgrade.")
