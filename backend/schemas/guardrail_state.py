from enum import Enum
from pydantic import BaseModel, Field


class QueryCategory(str, Enum):
    COMPANY_ANALYSIS = "company_analysis"
    GENERAL_FINANCE = "general_finance"
    IRRELEVANT = "irrelevant"


class GuardrailDecision(BaseModel):
    category: QueryCategory = Field(
        description="Classification of the user's request: company_analysis, general_finance, or irrelevant."
    )
    reason: str = Field(
        description="Short explanation for the classification."
    )
