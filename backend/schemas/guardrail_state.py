from pydantic import BaseModel, Field


class GuardrailDecision(BaseModel):
    is_relevant: bool = Field(
        description="Whether the user's request is related to finance or investment analysis."
    )

    reason: str = Field(
        description="Short explanation for the classification."
    )
