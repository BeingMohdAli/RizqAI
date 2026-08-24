import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager


from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from api.routes import router
from database.db import init_db
from graph.graph import graph_builder


load_dotenv()
init_db()


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with AsyncSqliteSaver.from_conn_string("rizqai_checkpoints.db") as checkpointer:
        app.state.graph = graph_builder.compile(checkpointer=checkpointer)
        yield


app = FastAPI(
    title="RizqAI API",
    description="AI-powered investment research assistant — Planner, Research, Risk, Debate, and Thesis agents over a single API.",
    version="0.1.0",
    lifespan=lifespan
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
