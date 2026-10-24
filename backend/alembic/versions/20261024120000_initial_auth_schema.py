"""Create application tables, profiles, and RLS policies.

Revision ID: 20261024120000
Revises:
"""

from alembic import op
import sqlalchemy as sa


revision = "20261024120000"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "conversations",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.Uuid(as_uuid=False), nullable=False),
        sa.Column("title", sa.String(length=255), server_default="New Chat", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["auth.users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_conversations_user_id", "conversations", ["user_id"])
    op.create_index(
        "ix_conversations_user_updated",
        "conversations",
        ["user_id", "updated_at"],
    )

    op.create_table(
        "messages",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("conversation_id", sa.String(length=36), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("agent_name", sa.String(length=50), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["conversation_id"], ["conversations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_messages_conversation_id", "messages", ["conversation_id"])

    op.create_table(
        "user_profiles",
        sa.Column("user_id", sa.Uuid(as_uuid=False), nullable=False),
        sa.Column("display_name", sa.String(length=120), nullable=True),
        sa.Column("avatar_url", sa.String(length=2048), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("user_id"),
        sa.ForeignKeyConstraint(["user_id"], ["auth.users.id"], ondelete="CASCADE"),
    )

    bind = op.get_bind()
    if bind.dialect.name != "postgresql":
        return

    op.execute(
        """
        create or replace function public.handle_new_user()
        returns trigger language plpgsql security definer set search_path = public
        as $$
        begin
            insert into public.user_profiles (user_id, display_name, avatar_url)
            values (
                new.id,
                coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
                new.raw_user_meta_data ->> 'avatar_url'
            )
            on conflict (user_id) do nothing;
            return new;
        end;
        $$;
        """
    )
    op.execute("drop trigger if exists on_auth_user_created on auth.users")
    op.execute(
        "create trigger on_auth_user_created after insert on auth.users "
        "for each row execute procedure public.handle_new_user()"
    )
    for table in ("conversations", "messages", "user_profiles"):
        op.execute(f"alter table public.{table} enable row level security")
    op.execute(
        """
        create policy conversations_owner_select on public.conversations
            for select to authenticated using (user_id = (select auth.uid()));
        create policy conversations_owner_insert on public.conversations
            for insert to authenticated with check (user_id = (select auth.uid()));
        create policy conversations_owner_update on public.conversations
            for update to authenticated using (user_id = (select auth.uid()))
            with check (user_id = (select auth.uid()));
        create policy conversations_owner_delete on public.conversations
            for delete to authenticated using (user_id = (select auth.uid()));
        create policy messages_owner_select on public.messages
            for select to authenticated using (exists (
                select 1 from public.conversations c
                where c.id = messages.conversation_id and c.user_id = (select auth.uid())
            ));
        create policy messages_owner_insert on public.messages
            for insert to authenticated with check (exists (
                select 1 from public.conversations c
                where c.id = messages.conversation_id and c.user_id = (select auth.uid())
            ));
        create policy profiles_owner_all on public.user_profiles
            for all to authenticated using (user_id = (select auth.uid()))
            with check (user_id = (select auth.uid()));
        """
    )


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        for table, policies in {
            "conversations": (
                "conversations_owner_select",
                "conversations_owner_insert",
                "conversations_owner_update",
                "conversations_owner_delete",
            ),
            "messages": ("messages_owner_select", "messages_owner_insert"),
            "user_profiles": ("profiles_owner_all",),
        }.items():
            for policy in policies:
                op.execute(f"drop policy if exists {policy} on public.{table}")
        op.execute("drop trigger if exists on_auth_user_created on auth.users")
        op.execute("drop function if exists public.handle_new_user()")
    op.drop_table("user_profiles")
    op.drop_index("ix_messages_conversation_id", table_name="messages")
    op.drop_table("messages")
    op.drop_index("ix_conversations_user_updated", table_name="conversations")
    op.drop_index("ix_conversations_user_id", table_name="conversations")
    op.drop_table("conversations")
