from typing import Annotated
from operator import add
from pydantic import BaseModel, Field


from schemas.guardrail_state import GuardrailDecision
from schemas.planner_state import PlannerState
from schemas.research_state import ResearchData
from schemas.risk_state import RiskState
from schemas.debate_state import DebateAgent
from schemas.thesis_state import ThesisAgent
from schemas.general_finance_state import GeneralFinanceAnswer


class GraphState(BaseModel):
    success: bool = False
    error: str | None = None
    user_query: str = ""
    guardrail: GuardrailDecision | None = None
    plan: PlannerState | None = None
    completed_tasks: Annotated[list[str], add] = Field(default_factory=list)
    research: ResearchData | None = None
    risks: RiskState | None = None
    debate: DebateAgent | None = None
    thesis: ThesisAgent | None = None
    general_finance: GeneralFinanceAnswer | None = None
