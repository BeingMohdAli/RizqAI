from typing import TypedDict, List
from backend.schemas.planner_state import PlannerState
from backend.schemas.research_state import ResearchData
from backend.schemas.risk_state import RiskState
from backend.schemas.debate_state import DebateAgent
from backend.schemas.thesis_state import ThesisAgent

class GraphState(TypedDict):
    success: bool
    error: str
    user_query: str
    plan: PlannerState | None
    completed_tasks: List[str]
    research: ResearchData | None
    risks: RiskState | None
    debate: DebateAgent | None
    thesis: ThesisAgent | None