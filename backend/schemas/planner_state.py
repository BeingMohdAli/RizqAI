from enum import Enum
from typing import List
from pydantic import BaseModel, Field


class Agent(str, Enum):
    RESEARCH = "research_agent"
    RISK = "risk_agent"
    DEBATE = "debate_agent"
    THESIS = "thesis_agent"


class PlannerState(BaseModel):

    companies: List[str] = Field(
        default_factory=list,
        description="Resolved company names or tickers referenced in prompt or context.",
    )

    tasks: List[Agent] = Field(default_factory=list,
        description="Ordered list of missing/stale agents to execute.",
    )
