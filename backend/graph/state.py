from typing import TypedDict
from backend.schemas.planner_state import PlannerState
from backend.schemas.research_state import ResearchData

class GraphState(TypedDict):
    success: bool
    error: str
    user_query: str
    plan: PlannerState | None
    research: ResearchData | None