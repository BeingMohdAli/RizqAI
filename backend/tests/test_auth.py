from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import auth
import api.auth_routes as auth_routes
from api.auth_routes import router as auth_router
from api.routes import router as conversation_router
from database.db import get_db
from database.models import Base, PendingSignup, UserAccount
import jwt_auth


class FakeAuth:
    def __init__(self):
        self.calls = []
        self.admin = self

    def create_user(self, payload):
        self.calls.append(("create_user", payload))
        return SimpleNamespace(user=SimpleNamespace(id="user-1", email=payload["email"]))

    def update_user_by_id(self, user_id, payload):
        self.calls.append(("update_user_by_id", user_id, payload))
        return SimpleNamespace(user=SimpleNamespace(id=user_id))

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
    monkeypatch.setattr(auth, "SUPABASE_SERVICE_ROLE_KEY", "service-role")
    monkeypatch.setattr(jwt_auth, "JWT_SECRET", "test-jwt-secret")

    app = FastAPI()
    app.include_router(auth_router)
    app.include_router(conversation_router)
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    db = sessionmaker(bind=engine)()
    user = UserAccount(
        name="Test User",
        email="user@example.com",
        password_hash=jwt_auth.hash_password("correct horse battery"),
    )
    db.add(user)
    db.commit()
    app.state.test_session = jwt_auth.issue_session(db, user)
    app.dependency_overrides[get_db] = lambda: db
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
    assert login.json()["name"] == "Test User"


def test_signup_otp_is_required_before_confirmed_account_creation(client, capsys):
    test_client, fake = client
    payload = {"email": "otp@example.com", "password": "correct horse battery"}

    requested = test_client.post("/auth/signup/request-otp", json=payload)

    assert requested.status_code == 200
    output = capsys.readouterr().out
    assert "otp@example.com" in output
    pending = client[0].app.dependency_overrides[get_db]().query(PendingSignup).filter_by(
        email="otp@example.com"
    ).one()
    assert pending.otp_hash != "123456"
    assert not hasattr(pending, "password")
    otp = output.strip().split(":")[-1].strip()

    verified = test_client.post(
        "/auth/signup/verify-otp",
        json={**payload, "otp": otp, "name": "OTP User"},
    )

    assert verified.status_code == 200
    assert verified.json()["name"] == "OTP User"


def test_signup_otp_rejects_invalid_code(client):
    test_client, fake = client
    payload = {"email": "invalid-otp@example.com", "password": "correct horse battery"}

    test_client.post("/auth/signup/request-otp", json=payload)
    verified = test_client.post(
        "/auth/signup/verify-otp",
        json={**payload, "otp": "000000", "name": "Invalid User"},
    )

    assert verified.status_code == 400
    assert "Invalid OTP" in verified.json()["detail"]
    assert not any(call[0] == "login" for call in fake.calls)


def test_signup_otp_resend_replaces_existing_pending_password_hash(client):
    test_client, _ = client
    payload = {"email": "resend@example.com", "password": "first password"}

    first = test_client.post("/auth/signup/request-otp", json=payload)
    assert first.status_code == 200
    db = client[0].app.dependency_overrides[get_db]()
    pending = db.query(PendingSignup).filter_by(email=payload["email"]).one()
    first_hash = pending.password_hash

    second = test_client.post(
        "/auth/signup/request-otp",
        json={"email": payload["email"], "password": "second password"},
    )

    assert second.status_code == 200
    assert pending.password_hash != first_hash
    assert pending.password_hash is not None
    assert "second password" not in pending.password_hash


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
    assert callback.status_code == 200
    assert callback.json()["email"] == "user@example.com"
    assert recovery.json()["message"].startswith("If an account exists")
    assert ("callback", {"auth_code": "one-time-code"}) in fake.calls


def test_oauth_url_does_not_require_server_side_pkce_storage(client, monkeypatch):
    class OAuthClient:
        def __init__(self):
            self.auth = self

        def sign_in_with_oauth(self, payload):
            assert payload["options"]["redirect_to"] == "http://localhost:3000/auth/callback"
            return SimpleNamespace(
                url="https://example.supabase.co/auth/v1/authorize"
                "?provider=google&redirect_to=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback"
            )

    monkeypatch.setattr(auth_routes, "get_supabase_client", lambda: OAuthClient())
    response = client[0].get("/auth/oauth/google")

    assert response.status_code == 200
    assert "code_challenge" not in response.json()["url"]


def test_refresh_logout_and_password_update(client):
    test_client, _ = client
    session = test_client.app.state.test_session
    refresh = test_client.post("/auth/refresh", json={"refresh_token": session["refresh_token"]})
    bearer = "Bearer " + refresh.json()["access_token"]
    update = test_client.post(
        "/auth/password/update",
        headers={"Authorization": bearer},
        json={"password": "new password value"},
    )
    logout = test_client.post("/auth/logout", headers={"Authorization": bearer})

    assert refresh.status_code == logout.status_code == update.status_code == 200
    assert refresh.json()["name"] == "Test User"


def test_removed_conversation_endpoint_is_unavailable(client):
    test_client, _ = client
    response = test_client.get("/conversations", headers={"Authorization": "Bearer invalid"})
    assert response.status_code == 404


def test_ai_endpoint_requires_authentication(client):
    test_client, _ = client
    response = test_client.post("/analysis/stream", json={"query": "Analyze Apple"})
    assert response.status_code == 401
