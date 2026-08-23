import os
from dotenv import load_dotenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router
from database.db import init_db

load_dotenv()
init_db()

app = FastAPI(
    title="RizqAI API",
    description="AI-powered investment research assistant — Planner, Research, Risk, Debate, and Thesis agents over a single API.",
    version="0.1.0",
)


_frontend_origins = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
allow_origins = [origin.strip() for origin in _frontend_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(router)
