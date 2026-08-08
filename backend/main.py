"""FastAPI entry point for the RizqAI backend.

Run from the repo root (the folder containing `backend/`):

    uvicorn backend.main:app --reload --port 8000

Then visit http://localhost:8000/docs for interactive API docs.
"""

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import router

load_dotenv()

app = FastAPI(
    title="RizqAI API",
    description="AI-powered investment research assistant — Planner, Research, Risk, Debate, and Thesis agents over a single API.",
    version="0.1.0",
)

# Comma-separated list of allowed origins, e.g. "http://localhost:3000,https://myapp.com"
# Defaults to the Next.js dev server so local frontend development works out of the box.
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


@app.get("/")
async def root():
    return {"message": "RizqAI API is running", "docs": "/docs"}