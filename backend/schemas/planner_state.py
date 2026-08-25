from enum import Enum
from typing import List
from pydantic import BaseModel, Field


class Agent(str, Enum):
    RESEARCH = "research_agent"
    RISK = "risk_agent"
    DEBATE = "debate_agent"
    THESIS = "thesis_agent"


class PlannerState(BaseModel):
    companies: List[str] = Field(default_factory=list, description="Stock ticker symbols for the companies mentioned by the user (e.g. 'NVDA', not 'NVIDIA').")
    tasks: List[Agent] = Field(description="Agents that should be executed.")
