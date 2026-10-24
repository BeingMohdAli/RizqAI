from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class EmailPasswordRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=1)


class OAuthCallbackRequest(BaseModel):
    code: str = Field(min_length=1)


class PasswordRecoveryRequest(BaseModel):
    email: EmailStr


class PasswordUpdateRequest(BaseModel):
    password: str = Field(min_length=8, max_length=128)


class SessionResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int | None = None
    expires_at: int | None = None
    user_id: str
    email: EmailStr | None = None


class OAuthURLResponse(BaseModel):
    provider: Literal["google", "github"]
    url: str


class MessageResponse(BaseModel):
    message: str
