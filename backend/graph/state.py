from typing import Annotated
from operator import add
from pydantic import BaseModel, Field

from backend.schemas.planner_state import PlannerState
from backend.schemas.research_state import ResearchData
from backend.schemas.risk_state import RiskState
from backend.schemas.debate_state import DebateAgent
from backend.schemas.thesis_state import ThesisAgent


class GraphState(BaseModel):
    success: bool = Field(
        default=True,
        description="Whether graph execution succeeded."
    )

    error: str | None = Field(
        default=None,
        description="Error message if execution failed."
    )

    user_query: str = Field(
        description="Original user query."
    )

    plan: PlannerState | None = Field(
        default=None,
        description="Planner agent output."
    )

    completed_tasks: Annotated[list[str], add] = Field(
        default_factory=list,
        description="Names of completed agents."
    )

    research: ResearchData | None = Field(
        default=None,
        description="Research agent output."
    )

    risk: RiskState | None = Field(
        default=None,
        description="Risk agent output."
    )

    debate: DebateAgent | None = Field(
        default=None,
        description="Debate agent output."
    )

    thesis: ThesisAgent | None = Field(
        default=None,
        description="Final investment thesis."
    )
