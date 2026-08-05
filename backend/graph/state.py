from typing import Annotated, TypedDict
from operator import add

from backend.schemas.planner_state import PlannerState
from backend.schemas.research_state import ResearchData
from backend.schemas.risk_state import RiskState
from backend.schemas.debate_state import DebateAgent
from backend.schemas.thesis_state import ThesisAgent


class GraphState(TypedDict):
    success: bool
    error: str | None
    user_query: str
    plan: PlannerState | None
    completed_tasks: Annotated[list[str], add]
    research: ResearchData | None
    risk: RiskState | None
    debate: DebateAgent | None
    thesis: ThesisAgent | None
