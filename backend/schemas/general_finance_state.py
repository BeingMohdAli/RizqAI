from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class ResponseMode(str, Enum):
    CONCEPTUAL = "conceptual"
    MEMORY_FOLLOWUP = "memory_followup"


class GeneralFinanceAnswer(BaseModel):
    mode: ResponseMode = Field(
        description="The primary function of this response: 'conceptual' for general finance concepts/questions, "
        "or 'memory_followup' when answering a specific user query using existing agent outputs stored in memory."
    )

    answer: str = Field(
        description="The main narrative response. For 'conceptual' questions: a clear, concise (3-5 sentences) "
        "educational explanation. For 'memory_followup': a direct, targeted answer addressing ONLY the user's specific "
        "question using stored memory data."
    )

    key_points: List[str] = Field(
        default_factory=list,
        description="Core takeaways, key metrics, or specific bullet points supporting the answer.",
    )
