from config import llm
from graph.state import GraphState
from prompts.prompts import RISK_PROMPT
from schemas.risk_state import RiskState

from langchain_core.prompts import ChatPromptTemplate
from langsmith import traceable


@traceable(name="risk_agent")
async def risk_agent(state: GraphState) -> GraphState:
    """Evaluates all risks on the basis of researh data"""

    print("Risk agent Working....")

    research = state.research
    research_data = research.tool_data
    if not research_data:
        return {
                "success": False ,
                "error" : "Research Data not found"
            }
    
    research_summary = research.summary
    if not research_summary:
        return {
                "success": False ,
                "error" : "Research Summary not found"
            }

    try:
        risk_llm = llm.with_structured_output(RiskState)
        prompt = ChatPromptTemplate.from_messages([("system", RISK_PROMPT), ("human", "Research Tool data: {research_data} Research Summary: {research_summary} Using both, perform a risk assessment.")])
        messages = await prompt.ainvoke({"research_data": research_data, "research_summary": research_summary})
        risk_analysis = await risk_llm.ainvoke(messages)

    except Exception as e:
        return {
            "success": False ,
            "error" : f"Risk Agent Failed: {str(e)}"
        }

    return {
        "success": True ,
        "risks": risk_analysis,
        "completed_tasks": ["risk_agent"]
    }
