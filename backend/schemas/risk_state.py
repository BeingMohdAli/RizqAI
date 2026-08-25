from pydantic import BaseModel, Field
from typing import Literal, List


class RiskState(BaseModel):
    risk_score: int = Field(
        description="The calculated numerical risk score of the investment, scaled on a strict range from 1 (lowest risk) to 10 (highest risk).", 
        ge=1, 
        le=10
    )
    risk_level: Literal["HIGH", "LOW", "MEDIUM"] = Field(
        description="The categorical classification of the investment's risk severity."
    )
    summary: str = Field(
        description="A concise narrative summary synthesizing the key findings of the overall risk assessment."
    )
    mitigating_factors: List[str] = Field(
        description="A list of specific strategies, controls, or conditions that reduce or offset the identified investment risks."
    )
    risks: List[str] = Field(
        description="A list of distinct, potential adverse events or vulnerabilities that could negatively impact the investment."
    )
