from typing import Annotated
from operator import add
from pydantic import BaseModel, Field

from backend.schemas.planner_state import PlannerState
from backend.schemas.research_state import ResearchData
from backend.schemas.risk_state import RiskState
from backend.schemas.debate_state import DebateAgent
from backend.schemas.thesis_state import ThesisAgent


class GraphState(BaseModel):
    success: bool = False
    error: str | None = None
    user_query: str = ""
    plan: PlannerState | None = None
    completed_tasks: Annotated[list[str], add] = Field(default_factory=list)
    research: ResearchData | None = None
    risks: RiskState | None = None
    debate: DebateAgent | None = None
    thesis: ThesisAgent | None = None