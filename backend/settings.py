import os
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
AUTH_REDIRECT_URL = os.getenv(
    "AUTH_REDIRECT_URL",
    "http://localhost:3000/auth/callback",
)
PASSWORD_RESET_REDIRECT_URL = os.getenv(
    "PASSWORD_RESET_REDIRECT_URL",
    "http://localhost:3000/auth/reset-password",
)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./rizqai.db")
