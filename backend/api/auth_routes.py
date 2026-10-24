from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status

from auth import (
    AuthUser,
    get_supabase_admin_client,
    get_supabase_client,
    require_supabase_config,
    require_user,
)
from settings import AUTH_REDIRECT_URL, PASSWORD_RESET_REDIRECT_URL
from schemas.auth import (
    EmailPasswordRequest,
    MessageResponse,
    OAuthCallbackRequest,
    OAuthURLResponse,
    PasswordRecoveryRequest,
    PasswordUpdateRequest,
    RefreshRequest,
    SessionResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _session_response(session: Any) -> SessionResponse:
    if session is None or not getattr(session, "access_token", None):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Authentication provider returned no session",
        )
    user = getattr(session, "user", None)
    user_id = getattr(user, "id", None)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Authentication provider returned no user",
        )
    return SessionResponse(
        access_token=session.access_token,
        refresh_token=session.refresh_token,
        token_type=getattr(session, "token_type", "bearer"),
        expires_in=getattr(session, "expires_in", None),
        expires_at=getattr(session, "expires_at", None),
        user_id=user_id,
        email=getattr(user, "email", None),
    )


@router.post("/signup", response_model=SessionResponse | MessageResponse)
def signup(payload: EmailPasswordRequest):
    require_supabase_config()
    try:
        response = get_supabase_client().auth.sign_up(
            {"email": str(payload.email), "password": payload.password}
        )
        session = getattr(response, "session", None)
        if session is None:
            return MessageResponse(
                message="Signup successful. Check your email to confirm your account."
            )
        return _session_response(session)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to create account") from exc


@router.post("/login", response_model=SessionResponse)
def login(payload: EmailPasswordRequest):
    require_supabase_config()
    try:
        response = get_supabase_client().auth.sign_in_with_password(
            {"email": str(payload.email), "password": payload.password}
        )
        return _session_response(getattr(response, "session", None))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid email or password") from exc


@router.post("/refresh", response_model=SessionResponse)
def refresh(payload: RefreshRequest):
    require_supabase_config()
    try:
        response = get_supabase_client().auth.refresh_session(payload.refresh_token)
        return _session_response(getattr(response, "session", None))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid refresh token") from exc


@router.post("/logout", response_model=MessageResponse)
def logout(user: AuthUser = Depends(require_user)):
    try:
        get_supabase_admin_client().auth.admin.sign_out(
            user.access_token,
            scope="global",
        )
        return MessageResponse(message="Signed out")
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Unable to terminate session") from exc


@router.get("/oauth/{provider}", response_model=OAuthURLResponse)
def oauth(provider: str):
    if provider not in {"google", "github"}:
        raise HTTPException(status_code=400, detail="Unsupported OAuth provider")
    require_supabase_config()
    try:
        response = get_supabase_client().auth.sign_in_with_oauth(
            {
                "provider": provider,
                "options": {"redirect_to": AUTH_REDIRECT_URL},
            }
        )
        url = getattr(response, "url", None)
        if not url:
            raise HTTPException(status_code=502, detail="OAuth provider returned no URL")
        return OAuthURLResponse(provider=provider, url=url)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Unable to start OAuth flow") from exc


@router.get("/callback", response_model=SessionResponse)
def oauth_callback(code: str = Query(min_length=1)):
    require_supabase_config()
    try:
        response = get_supabase_client().auth.exchange_code_for_session(
            {"auth_code": code}
        )
        return _session_response(getattr(response, "session", None))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid OAuth callback") from exc


@router.post("/password/recover", response_model=MessageResponse)
def recover_password(payload: PasswordRecoveryRequest):
    require_supabase_config()
    try:
        get_supabase_client().auth.reset_password_for_email(
            str(payload.email),
            options={"redirect_to": PASSWORD_RESET_REDIRECT_URL},
        )
        return MessageResponse(
            message="If an account exists, a password reset email has been sent."
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Unable to send reset email") from exc


@router.post("/password/update", response_model=MessageResponse)
def update_password(
    payload: PasswordUpdateRequest,
    user: AuthUser = Depends(require_user),
):
    del user
    try:
        get_supabase_client().auth.update_user({"password": payload.password})
        return MessageResponse(message="Password updated")
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to update password") from exc
