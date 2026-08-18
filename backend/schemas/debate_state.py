from pydantic import BaseModel, Field
from typing import List


class CaseOutput(BaseModel):
    summary: str = Field(
        description="A concise, high-level thesis synthesizing the core premise and narrative of this specific market position."
    )
    arguments: List[str] = Field(
        description="A comprehensive list of distinct, supporting data points, macroeconomic factors, or logical assertions that justify this stance."
    )


class DebateAgent(BaseModel):
    bull_case: CaseOutput = Field(
        description="The optimistic investment thesis highlighting growth drivers, competitive advantages, and positive market indicators."
    )
    bear_case: CaseOutput = Field(
        description="The pessimistic investment thesis highlighting structural risks, valuation concerns, and potential headwinds."
    )
    key_conflicts: List[str] = Field(
        description="A list of core points of tension or direct contradictions where the bull and bear narratives clash (e.g., valuation vs. growth trajectory)."
    )