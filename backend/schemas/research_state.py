from pydantic import BaseModel, Field
from typing import Dict, Any, List

class ToolOutputDict(BaseModel):
    tool: str = Field(description="Tool Name")
    tool_input: Dict[str, Any] = Field(description="Tool Input")
    output: Any = Field(description="Tool Output")

class ResearchData(BaseModel):
    summary: str = Field(description="Combined summary of the tool output")
    tool_data: List[ToolOutputDict] = Field(description="Combined tool data")