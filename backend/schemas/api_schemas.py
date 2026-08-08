"""Request/response models for the FastAPI layer (backend/api/routes.py).

AnalyzeResponse deliberately mirrors GraphState's shape field-for-field so
the final graph state can be handed straight to it (AnalyzeResponse(**result))
without any manual re-mapping.
"""

from typing import List, Optional

from pydantic import BaseModel, Field

from backend.schemas.debate_state import DebateAgent
from backend.schemas.planner_state import PlannerState
from backend.schemas.research_state import ResearchData
from backend.schemas.risk_state import RiskState
from backend.schemas.thesis_state import ThesisAgent


class AnalyzeRequest(BaseModel):
    query: str = Field(
        min_length=1,
        description="The user's natural-language investment question, e.g. 'Should I buy NVDA?'",
    )


class AnalyzeResponse(BaseModel):
    success: bool
    error: Optional[str] = None
    user_query: str
    plan: Optional[PlannerState] = None
    completed_tasks: List[str] = Field(default_factory=list)
    research: Optional[ResearchData] = None
    risks: Optional[RiskState] = None
    debate: Optional[DebateAgent] = None
    thesis: Optional[ThesisAgent] = None


class HealthResponse(BaseModel):
    status: str