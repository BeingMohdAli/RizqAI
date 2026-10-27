from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from database.db import get_db
from database.models import AuthSession, UserAccount
from settings import JWT_SECRET


_ACCESS_TTL = timedelta(minutes=30)
_REFRESH_TTL = timedelta(days=30)
_bearer = HTTPBearer(auto_error=False)


def _expired(value: datetime) -> bool:
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value <= datetime.now(timezone.utc)


def _b64(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode()


def _unb64(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 310_000)
    return f"pbkdf2_sha256$310000${salt.hex()}${digest.hex()}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        algorithm, rounds, salt_hex, digest_hex = encoded.split("$")
        if algorithm != "pbkdf2_sha256":
            return False
        candidate = hashlib.pbkdf2_hmac(
            "sha256", password.encode(), bytes.fromhex(salt_hex), int(rounds)
        ).hex()
        return hmac.compare_digest(candidate, digest_hex)
    except (ValueError, TypeError):
        return False


def _sign(payload: dict[str, object]) -> str:
    if not JWT_SECRET:
        raise HTTPException(status_code=503, detail="JWT_SECRET is not configured.")
    header = _b64(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    body = _b64(json.dumps(payload, separators=(",", ":")).encode())
    signature = _b64(hmac.new(JWT_SECRET.encode(), f"{header}.{body}".encode(), hashlib.sha256).digest())
    return f"{header}.{body}.{signature}"


def _decode(token: str) -> dict[str, object]:
    if not JWT_SECRET:
        raise ValueError("JWT_SECRET is not configured")
    header, body, signature = token.split(".")
    expected = _b64(hmac.new(JWT_SECRET.encode(), f"{header}.{body}".encode(), hashlib.sha256).digest())
    if not hmac.compare_digest(signature, expected):
        raise ValueError("invalid signature")
    payload = json.loads(_unb64(body))
    if payload.get("type") != "access" or int(payload["exp"]) <= int(datetime.now(timezone.utc).timestamp()):
        raise ValueError("expired token")
    return payload


def issue_session(db: Session, user: UserAccount) -> dict[str, object]:
    now = datetime.now(timezone.utc)
    access_exp = now + _ACCESS_TTL
    refresh_exp = now + _REFRESH_TTL
    refresh = secrets.token_urlsafe(48)
    session = AuthSession(
        user_id=user.id,
        refresh_token_hash=hashlib.sha256(refresh.encode()).hexdigest(),
        expires_at=refresh_exp,
    )
    db.add(session)
    db.flush()
    db.commit()
    return {
        "access_token": _sign({"sub": user.id, "sid": session.id, "email": user.email, "name": user.name,
                               "type": "access", "exp": int(access_exp.timestamp())}),
        "refresh_token": refresh,
        "token_type": "bearer",
        "expires_in": int(_ACCESS_TTL.total_seconds()),
        "expires_at": int(access_exp.timestamp()),
        "user_id": user.id,
        "email": user.email,
        "name": user.name,
    }


def require_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> UserAccount:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required")
    try:
        payload = _decode(credentials.credentials)
        user = db.get(UserAccount, str(payload["sub"]))
        session = db.get(AuthSession, str(payload["sid"]))
        if (
            session is None
            or session.user_id != user.id
            or session.revoked_at is not None
            or _expired(session.expires_at)
        ):
            user = None
    except (ValueError, KeyError, TypeError):
        user = None
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired access token")
    return user


def refresh_session(db: Session, refresh_token: str) -> dict[str, object]:
    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    session = db.query(AuthSession).filter(
        AuthSession.refresh_token_hash == token_hash,
        AuthSession.revoked_at.is_(None),
    ).first()
    if session is None or _expired(session.expires_at):
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    session.revoked_at = datetime.now(timezone.utc)
    user = db.get(UserAccount, session.user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid refresh session")
    return issue_session(db, user)
