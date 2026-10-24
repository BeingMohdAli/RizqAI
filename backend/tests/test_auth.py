from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

import auth
import api.auth_routes as auth_routes
from api.auth_routes import router as auth_router
from api.routes import router as conversation_router


class FakeAuth:
    def __init__(self):
        self.calls = []
        self.admin = self

    def sign_up(self, payload):
        self.calls.append(("signup", payload))
        return SimpleNamespace(session=make_session())

    def sign_in_with_password(self, payload):
        self.calls.append(("login", payload))
        return SimpleNamespace(session=make_session())

    def refresh_session(self, token):
        self.calls.append(("refresh", token))
        return SimpleNamespace(session=make_session())

    def sign_in_with_oauth(self, payload):
        self.calls.append(("oauth", payload))
        return SimpleNamespace(url="https://accounts.example.test/oauth")

    def exchange_code_for_session(self, code):
        self.calls.append(("callback", code))
        return SimpleNamespace(session=make_session())

    def reset_password_for_email(self, email, options):
        self.calls.append(("recover", email, options))

    def update_user(self, payload):
        self.calls.append(("update", payload))

    def get_user(self, token):
        if token == "expired":
            raise RuntimeError("token expired")
        return SimpleNamespace(
            user=SimpleNamespace(id="user-1", email="user@example.com", role="authenticated")
        )

    def sign_out(self, token, scope="global"):
        self.calls.append(("logout", token, scope))


def make_session():
    return SimpleNamespace(
        access_token="access",
        refresh_token="refresh",
        token_type="bearer",
        expires_in=3600,
        expires_at=2_000_000_000,
        user=SimpleNamespace(id="user-1", email="user@example.com"),
    )


@pytest.fixture
def client(monkeypatch):
    fake = FakeAuth()
    monkeypatch.setattr(auth, "get_supabase_client", lambda: SimpleNamespace(auth=fake))
    monkeypatch.setattr(auth, "get_supabase_admin_client", lambda: SimpleNamespace(auth=fake))
    monkeypatch.setattr(auth_routes, "get_supabase_client", lambda: SimpleNamespace(auth=fake))
    monkeypatch.setattr(
        auth_routes,
        "get_supabase_admin_client",
        lambda: SimpleNamespace(auth=fake),
    )
    monkeypatch.setattr(auth, "SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setattr(auth, "SUPABASE_ANON_KEY", "anon")

    app = FastAPI()
    app.include_router(auth_router)
    app.include_router(conversation_router)
    return TestClient(app), fake


def test_email_signup_and_login(client):
    test_client, fake = client

    signup = test_client.post(
        "/auth/signup",
        json={"email": "user@example.com", "password": "correct horse battery"},
    )
    login = test_client.post(
        "/auth/login",
        json={"email": "user@example.com", "password": "correct horse battery"},
    )

    assert signup.status_code == 200
    assert login.status_code == 200
    assert login.json()["access_token"] == "access"
    assert ("signup", {"email": "user@example.com", "password": "correct horse battery"}) in fake.calls


def test_oauth_and_password_recovery(client):
    test_client, fake = client

    google = test_client.get("/auth/oauth/google")
    github = test_client.get("/auth/oauth/github")
    callback = test_client.get("/auth/callback?code=one-time-code")
    recovery = test_client.post(
        "/auth/password/recover", json={"email": "user@example.com"}
    )

    assert google.json()["provider"] == "google"
    assert github.json()["provider"] == "github"
    assert callback.json()["user_id"] == "user-1"
    assert recovery.json()["message"].startswith("If an account exists")
    assert ("callback", {"auth_code": "one-time-code"}) in fake.calls


def test_refresh_logout_and_password_update(client):
    test_client, fake = client
    refresh = test_client.post("/auth/refresh", json={"refresh_token": "refresh"})
    logout = test_client.post(
        "/auth/logout", headers={"Authorization": "Bearer access"}
    )
    update = test_client.post(
        "/auth/password/update",
        headers={"Authorization": "Bearer access"},
        json={"password": "new password value"},
    )

    assert refresh.status_code == logout.status_code == update.status_code == 200
    assert ("refresh", "refresh") in fake.calls
    assert ("logout", "access", "global") in fake.calls


def test_expired_jwt_is_rejected(client):
    test_client, _ = client
    response = test_client.get(
        "/conversations", headers={"Authorization": "Bearer expired"}
    )
    assert response.status_code == 401


def test_ai_endpoint_requires_authentication(client):
    test_client, _ = client
    response = test_client.get("/conversations")
    assert response.status_code == 401
