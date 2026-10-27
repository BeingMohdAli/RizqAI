from __future__ import annotations

from dataclasses import dataclass
from typing import Any
from urllib.parse import urlparse

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client, create_client

from settings import SUPABASE_ANON_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
from jwt_auth import require_user as require_local_user

bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class AuthUser:
    id: str
    email: str | None
    role: str
    access_token: str
    raw: Any


def get_supabase_client() -> Client:
    if not _supabase_configured():
        raise RuntimeError("SUPABASE_URL and SUPABASE_ANON_KEY must be configured")
    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


def _user_from_response(response: Any, access_token: str) -> AuthUser:
    user = getattr(response, "user", None)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = getattr(user, "id", None)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return AuthUser(
        id=user_id,
        email=getattr(user, "email", None),
        role=getattr(user, "role", "authenticated"),
        access_token=access_token,
        raw=user,
    )


def require_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> AuthUser:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer access token required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        response = get_supabase_client().auth.get_user(credentials.credentials)
        return _user_from_response(response, credentials.credentials)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def require_application_user(
    user=Depends(require_local_user),
) -> AuthUser:
    return AuthUser(
        id=user.id,
        email=user.email,
        role="authenticated",
        access_token="",
        raw=user,
    )


def get_supabase_admin_client() -> Client:
    from settings import SUPABASE_SERVICE_ROLE_KEY

    if not _supabase_configured(require_admin=True):
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured"
        )
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def _supabase_configured(require_admin: bool = False) -> bool:
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        return False
    if require_admin and not SUPABASE_SERVICE_ROLE_KEY:
        return False
    if any(token in SUPABASE_URL for token in ("[", "]", "PROJECT-REF")):
        return False
    try:
        parsed = urlparse(SUPABASE_URL)
    except ValueError:
        return False
    return parsed.scheme == "https" and bool(parsed.netloc)


def require_supabase_config(require_admin: bool = False) -> None:
    if not _supabase_configured(require_admin=require_admin):
        requirement = "SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY" if require_admin else "SUPABASE_URL and SUPABASE_ANON_KEY"
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Authentication service is not configured correctly. Set {requirement} in the repository root .env file.",
        )
