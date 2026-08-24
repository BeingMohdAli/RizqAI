from config import llm
from graph.state import GraphState
from prompts.debate_prompt import DEBATE_PROMPT
from schemas.debate_state import DebateAgent

from langchain_core.prompts import ChatPromptTemplate
from langsmith import traceable


@traceable(name="debate_agent")
async def debate_agent(state: GraphState) -> GraphState:
    """Generates bears and bull case on the basis of research and risk agent output"""

    print("Debate agent Working....")

    research = state.research
    if not research:
        return {
                "success": False ,
                "error" : "Research Data not found"
            }

    research_summary = research.summary
    if not research_summary:
        return {
            "success": False,
            "error" : "Research Summary Data not found"
        }
    
    risk_data = state.risks
    if not risk_data:
        return {
            "success": False,
            "error" : "Risk Data not found"
        }

    try:
        prompt = ChatPromptTemplate.from_messages([("system", DEBATE_PROMPT), ("human", "Research Summary: {research_summary}\n Risk Data: {risk}")])
        debate_llm = llm.with_structured_output(DebateAgent)
        messages = await prompt.ainvoke({"research_summary": research_summary, "risk": risk_data})
        debate_analysis = await debate_llm.ainvoke(messages)

    except Exception as e:
        return {
            "success": False ,
            "error" : f"Debate Agent Failed: {str(e)}"
        }

    return {
        "success": True ,
        "debate": debate_analysis,
        "completed_tasks": ["debate_agent"]
    }
