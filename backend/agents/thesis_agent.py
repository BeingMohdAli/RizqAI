from backend.config import llm
from backend.graph.state import GraphState
from backend.prompts.prompts import THESIS_PROMPT
from backend.schemas.thesis_state import ThesisAgent
from langchain_core.prompts import ChatPromptTemplate
from langsmith import traceable


@traceable(name="thesis_agent")
async def thesis_agent(state: GraphState) -> GraphState:
    """Thesis agent generate the final thesis and recommendation for user based on 
    research, risk, and debate agent output
    """

    print("Thesis agent Working....")

    research_data = state.get("research")
    risk_data = state.get("risks")
    debate_data = state.get("debate")

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

    if not debate_data:
        return {
                "success": False ,
                "error" : "Debate Data not found"
            }

    try:
        thesis_llm = llm.with_structured_output(ThesisAgent)
        prompt = ChatPromptTemplate.from_messages([("system", THESIS_PROMPT), ("human", "Research data: {research}\n Risk Data: {risk}\n Debate data: {debate}")])
        messages = await prompt.ainvoke({"research": research_data, "risk": risk_data, "debate": debate_data})
        debate_analysis = await thesis_llm.ainvoke(messages)

    except Exception as e:
        return {
            "success": False ,
            "error" : str(e)
        }

    completed = state.get("completed_tasks", []) or []
    new_completed = completed + ["thesis_agent"]

    return {
        "success": True ,
        "debate": debate_analysis,
        "completed_tasks": new_completed
    }
