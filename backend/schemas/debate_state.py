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

"""
{
  "bull_case": {
    "summary": "The company demonstrates strong fundamentals and continues to benefit from growing AI demand.",

    "arguments": [
      "Revenue growth remains strong.",
      "The company is the market leader in AI hardware.",
      "Recent earnings exceeded expectations.",
      "Demand for AI infrastructure continues to increase."
    ]
  },

  "bear_case": {
    "summary": "Despite strong business performance, investors should consider valuation and concentration risks.",

    "arguments": [
      "The valuation is significantly above historical averages.",
      "The business depends heavily on continued AI demand.",
      "Export restrictions could affect future growth.",
      "The investment carries a high overall risk score."
    ]
  },

  "key_conflicts": [
    "Strong growth vs expensive valuation",
    "Market leadership vs increasing competition",
    "High revenue growth vs regulatory uncertainty"
  ]
}
"""