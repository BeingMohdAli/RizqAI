from pydantic import BaseModel, Field


class GeneralFinanceAnswer(BaseModel):
    answer: str = Field(
        description="A clear, summarized answer to the user's general finance/investing question. "
        "Should be concise (3-6 sentences) and educational, not tied to any specific company."
    )
    key_points: list[str] = Field(
        default_factory=list,
        description="Optional short bullet points highlighting the most important takeaways.",
    )