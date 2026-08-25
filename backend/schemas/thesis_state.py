from pydantic import BaseModel, Field
from typing import Literal, List


class ThesisAgent(BaseModel):
    recommendation: Literal["BUY", "HOLD", "SELL", "WATCH"] = Field(
        description="The final actionable investment directive based on the comprehensive synthesis of all agent findings."
    )
    confidence: int = Field(
        description="The degree of certainty in the final recommendation, rated on a scale from 0 (completely uncertain) to 10 (absolute certainty).", 
        ge=0, 
        le=10
    )
    investment_thesis: str = Field(
        description="A cohesive, 3-to-5 sentence macroeconomic and fundamental explanation justifying the final recommendation."
    )
    key_reasons: List[str] = Field(
        description="A bulleted list of the most critical, high-impact pillars or data points supporting the investment thesis."
    )
    potential_risks: List[str] = Field(
        description="A list of primary vulnerabilities, negative catalysts, or failure points that could invalidate this thesis."
    )
    next_steps: List[str] = Field(
        description="A list of immediate, concrete follow-up actions or monitoring metrics the investor should track next."
    )
    disclaimer: str = Field(
        description="A standard regulatory and legal notice stating that this analysis is for informational purposes only and does not constitute formal financial advice."
    )
