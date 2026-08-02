from backend.config import llm
from backend.graph.state import GraphState
from backend.prompts.prompts import RISK_PROMPT
from backend.schemas.risk_state import RiskState
from langchain_core.prompts import ChatPromptTemplate
from langsmith import traceable


@traceable(name="risk_agent")
async def risk_agent(state: GraphState) -> GraphState:
    """Risk agent evaluate all risks on the basis of researh data"""

    print("Risk agent Working....")

    research_data = state.get("research")

    if not research_data:
        return {
                "success": False ,
                "error" : "Research Data not found"
            }

    try:
        risk_llm = llm.with_structured_output(RiskState)
        prompt = ChatPromptTemplate.from_messages([("system", RISK_PROMPT), ("human", "Research data: {research}")])
        messages = await prompt.ainvoke({"research": research_data})
        risk_analysis = await risk_llm.ainvoke(messages)

    except Exception as e:
        return {
            "success": False ,
            "error" : str(e)
        }

    completed = state.get("completed_tasks", []) or []
    new_completed = completed + ["risk_agent"]

    return {
        "success": True ,
        "risks": risk_analysis,
        "completed_tasks": new_completed
    }
