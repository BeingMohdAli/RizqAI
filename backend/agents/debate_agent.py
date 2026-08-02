from backend.config import llm
from backend.graph.state import GraphState
from backend.prompts.prompts import DEBATE_PROMPT
from backend.schemas.debate_state import DebateAgent
from langchain_core.prompts import ChatPromptTemplate
from langsmith import traceable


@traceable(name="debate_agent")
async def debate_agent(state: GraphState) -> GraphState:
    """Debate agent generate bears and bull case on the basis of research and risk agent output"""

    print("Debate agent Working....")

    research_data = state.get("research")
    risk_data = state.get("risks")

    if not research_data:
        return {
                "success": False ,
                "error" : "Research Data not found"
            }

    if not risk_data:
        return {
                "success": False ,
                "error" : "Risk Data not found"
            }

    try:
        debate_llm = llm.with_structured_output(DebateAgent)
        prompt = ChatPromptTemplate.from_messages([("system", DEBATE_PROMPT), ("human", "Research data: {research}\n Risk Data: {risk}")])
        messages = await prompt.ainvoke({"research": research_data, "risk": risk_data})
        debate_analysis = await debate_llm.ainvoke(messages)

    except Exception as e:
        return {
            "success": False ,
            "error" : str(e)
        }

    completed = state.get("completed_tasks", []) or []
    new_completed = completed + ["debate_agent"]

    return {
        "success": True ,
        "debate": debate_analysis,
        "completed_tasks": new_completed
    }
