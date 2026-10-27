from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone
import hashlib
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from auth import (
    AuthUser,
    get_supabase_admin_client,
    get_supabase_client,
    require_supabase_config,
    require_application_user as require_user,
)
from jwt_auth import hash_password, issue_session, refresh_session, verify_password
from database.db import get_db
from database.models import AuthSession, PendingSignup, UserAccount
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
    CurrentUserResponse,
    SignupOtpRequest,
    VerifySignupOtpRequest,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


_OTP_TTL = timedelta(minutes=10)
_MAX_OTP_ATTEMPTS = 5


def _hash_otp(otp: str, salt: bytes) -> str:
    return hashlib.pbkdf2_hmac(
        "sha256",
        otp.encode("utf-8"),
        salt,
        200_000,
    ).hex()


def _is_expired(expires_at: datetime, now: datetime) -> bool:
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return expires_at <= now


@router.get("/me", response_model=CurrentUserResponse)
def current_user(user: AuthUser = Depends(require_user)):
    return CurrentUserResponse(user_id=user.id, name=user.raw.name, email=user.email)


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
        print(exc)
        raise HTTPException(status_code=400, detail="Unable to create account") from exc


@router.post("/signup/request-otp", response_model=MessageResponse)
def request_signup_otp(
    payload: SignupOtpRequest,
    db: Session = Depends(get_db),
):
    email = str(payload.email).lower()
    otp = f"{secrets.randbelow(1_000_000):06d}"
    try:
        pending = db.query(PendingSignup).filter(PendingSignup.email == email).first()
        if pending is None:
            if db.query(UserAccount).filter(UserAccount.email == email).first():
                raise HTTPException(status_code=409, detail="An account with this email already exists.")
            pending = PendingSignup(email=email, password_hash=hash_password(payload.password))
            db.add(pending)
        else:
            pending.password_hash = hash_password(payload.password)
        salt = secrets.token_bytes(16)
        pending.otp_salt = salt.hex()
        pending.otp_hash = _hash_otp(otp, salt)
        pending.expires_at = datetime.now(timezone.utc) + _OTP_TTL
        pending.attempts = 0
        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except OperationalError as exc:
        db.rollback()
        print(f"Signup database schema error: {exc}", flush=True)
        raise HTTPException(
            status_code=503,
            detail="Signup storage is not initialized. Run the latest Alembic migrations.",
        ) from exc
    except Exception as exc:
        db.rollback()
        message = str(exc)
        print(f"Signup OTP error: {message}", flush=True)
        lowered_message = message.lower()
        if "already" in lowered_message and "exist" in lowered_message:
            raise HTTPException(status_code=409, detail="An account with this email already exists.") from exc
        raise HTTPException(status_code=400, detail="Unable to start account signup.") from exc

    print(f"[RizqAI signup OTP] {email}: {otp}", flush=True)
    return MessageResponse(message="OTP generated. Enter the code shown in the backend terminal.")


@router.post("/signup/verify-otp", response_model=SessionResponse)
def verify_signup_otp(
    payload: VerifySignupOtpRequest,
    db: Session = Depends(get_db),
):
    email = str(payload.email).lower()
    pending = db.query(PendingSignup).filter(PendingSignup.email == email).first()
    now = datetime.now(timezone.utc)

    if pending is None or _is_expired(pending.expires_at, now):
        if pending is not None:
            db.delete(pending)
            db.commit()
        raise HTTPException(status_code=400, detail="OTP expired. Request a new code.")
    if pending.attempts >= _MAX_OTP_ATTEMPTS:
        db.delete(pending)
        db.commit()
        raise HTTPException(status_code=429, detail="Too many invalid OTP attempts. Request a new code.")

    pending.attempts += 1
    db.commit()
    expected_hash = _hash_otp(payload.otp, bytes.fromhex(pending.otp_salt))
    if not secrets.compare_digest(expected_hash, pending.otp_hash):
        raise HTTPException(status_code=400, detail="Invalid OTP.")

    if not pending.password_hash:
        raise HTTPException(
            status_code=400,
            detail="This signup request is outdated. Request a new OTP.",
        )

    try:
        user = UserAccount(
            name=payload.name,
            email=email,
            password_hash=pending.password_hash,
        )
        db.add(user)
        db.delete(pending)
        db.commit()
        return issue_session(db, user)
    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        message = str(exc).lower()
        raise HTTPException(status_code=400, detail="Unable to verify signup.") from exc


@router.post("/login", response_model=SessionResponse)
def login(payload: EmailPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(UserAccount).filter(UserAccount.email == str(payload.email).lower()).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return issue_session(db, user)


@router.post("/refresh", response_model=SessionResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    return refresh_session(db, payload.refresh_token)


@router.post("/logout", response_model=MessageResponse)
def logout(user: AuthUser = Depends(require_user), db: Session = Depends(get_db)):
    db.query(AuthSession).filter(
        AuthSession.user_id == user.id,
        AuthSession.revoked_at.is_(None),
    ).update({"revoked_at": datetime.now(timezone.utc)})
    db.commit()
    return MessageResponse(message="Signed out")


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
        print(f"[RizqAI OAuth start error] provider={provider}: {exc}", flush=True)
        raise HTTPException(status_code=502, detail="Unable to start OAuth flow") from exc


@router.get("/callback", response_model=SessionResponse)
def oauth_callback(code: str = Query(min_length=1), db: Session = Depends(get_db)):
    require_supabase_config()
    try:
        response = get_supabase_client().auth.exchange_code_for_session(
            {"auth_code": code}
        )
        provider_session = getattr(response, "session", None)
        provider_user = getattr(provider_session, "user", None)
        email = getattr(provider_user, "email", None)
        if not email:
            raise HTTPException(status_code=502, detail="OAuth provider returned no email")
        user = db.query(UserAccount).filter(UserAccount.email == email.lower()).first()
        if user is None:
            metadata = getattr(provider_user, "user_metadata", {}) or {}
            name = metadata.get("full_name") or metadata.get("name") or email.split("@")[0]
            user = UserAccount(
                name=str(name)[:120],
                email=email.lower(),
                password_hash=hash_password(secrets.token_urlsafe(32)),
            )
            db.add(user)
            db.commit()
        return issue_session(db, user)
    except HTTPException:
        raise
    except Exception as exc:
        print(f"[RizqAI OAuth callback error]: {exc}", flush=True)
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
    db: Session = Depends(get_db),
):
    account = db.get(UserAccount, user.id)
    if account is None:
        raise HTTPException(status_code=404, detail="User not found")
    account.password_hash = hash_password(payload.password)
    db.commit()
    return MessageResponse(message="Password updated")
