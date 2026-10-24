# Authentication

RizqAI delegates identity, password hashing, OAuth, email delivery, access-token
issuance, refresh-token rotation, and reset-token expiry to Supabase Auth. The
backend never stores passwords, reset tokens, access tokens, or refresh tokens.

## Environment

Copy the root `.env.example` to `.env` and set:

- `DATABASE_URL`: Supabase PostgreSQL connection string. Use the pooler URL for
  deployed/serverless workloads when appropriate.
- `SUPABASE_URL`: project URL.
- `SUPABASE_ANON_KEY`: publishable anon key used for user-scoped Auth calls.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key used to revoke all sessions at
  logout. Never expose it to the frontend.
- `AUTH_REDIRECT_URL`: allow-listed OAuth callback URL.
- `PASSWORD_RESET_REDIRECT_URL`: allow-listed password reset URL.

## Supabase setup

1. Run the Alembic migration from the repository root:

   ```text
   alembic -c backend/alembic.ini upgrade head
   ```

   Alembic creates the application tables, profile trigger, indexes, foreign
   keys, and RLS policies. The SQL file at
   [`supabase/migrations/20261024115129_auth_and_rls.sql`](../supabase/migrations/20261024115129_auth_and_rls.sql)
   is retained for Supabase SQL-editor/manual installations; do not run both
   migration paths against the same database.
2. In **Authentication > URL Configuration**, add the redirect URLs used by
   `AUTH_REDIRECT_URL` and `PASSWORD_RESET_REDIRECT_URL`.
3. Enable Email provider and configure SMTP in Supabase. Disable anonymous
   sign-ins for production.
4. Under **Authentication > Providers**, enable Google and GitHub.
5. In Google Cloud OAuth, add the Supabase provider callback URL shown by the
   Supabase dashboard. Add the Google client ID/secret to Supabase.
6. In GitHub OAuth, create an OAuth app with the same Supabase provider callback
   URL, then add its client ID/secret to Supabase.

Supabase owns OAuth provider state and code exchange. The backend only accepts a
short-lived callback `code`; it does not accept provider access tokens.

## API

All auth responses are JSON. Session responses contain the access and refresh
tokens because the caller must hold them to authenticate subsequent requests.
The server does not log them. Send the access token as:
`Authorization: Bearer <access-token>`.

- `POST /auth/signup` with `{ "email", "password" }`
- `POST /auth/login` with `{ "email", "password" }`
- `POST /auth/refresh` with `{ "refresh_token" }`; replace the old session with
  the returned rotated session.
- `POST /auth/logout` with a bearer token; all sessions for that user are
  revoked using the service role API.
- `GET /auth/oauth/google` or `/auth/oauth/github`; open the returned URL.
- `GET /auth/callback?code=...`; exchanges a one-time OAuth code.
- `POST /auth/password/recover` with `{ "email" }`. The response is deliberately
  identical whether the email exists.
- `POST /auth/password/update` with a bearer token from the Supabase recovery
  session and `{ "password" }`. Supabase makes recovery sessions and reset
  tokens expiring and single-use.

`/conversations/*` is protected by Supabase `auth.get_user`, which validates
signature, expiry, revocation, and claims remotely. Every conversation query is
scoped to the authenticated user ID. Supabase RLS provides a second
authorization boundary for PostgreSQL access.

## Local testing

Install backend dependencies with `pip install -r backend/requirements.txt`,
apply the migration to a development Supabase project, and run:

```text
uvicorn main:app --app-dir backend --reload
```

Useful migration commands:

```text
alembic -c backend/alembic.ini current
alembic -c backend/alembic.ini history
alembic -c backend/alembic.ini upgrade head
alembic -c backend/alembic.ini downgrade -1
```

Set `DATABASE_URL` to the Supabase PostgreSQL URL before running these
commands. Alembic loads the URL from the same environment configuration as the
backend. Application startup no longer calls `create_all`; migrations must be
applied before deployment.

Run the focused tests with:

```text
pytest backend/tests -q
```

The health endpoint is intentionally public for container health checks; it
does not access AI functionality.
