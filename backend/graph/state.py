from typing import TypedDict, Any
from backend.schemas.planner_state import PlannerState

class GraphState(TypedDict):
    success: bool
    error: str
    user_query: str
    plan: PlannerState | None
    research: dict[str, Any]