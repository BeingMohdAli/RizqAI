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

    research = state.get("summary")
    research_summary = research.summary
    risk_data = state.get("risks")

    if not research or risk_data or research_summary:
        return {
                "success": False ,
                "error" : "Research or Risk Data not found"
            }

    try:
        debate_llm = llm.with_structured_output(DebateAgent)
        prompt = ChatPromptTemplate.from_messages([("system", DEBATE_PROMPT), ("human", "Research Summary: {research_summary}\n Risk Data: {risk}")])
        messages = await prompt.ainvoke({"research_summary": research_summary, "risk": risk_data})
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
