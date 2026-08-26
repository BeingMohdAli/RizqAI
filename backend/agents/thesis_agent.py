from config import llm
from graph.state import GraphState
from prompts.thesis_prompt import THESIS_PROMPT
from schemas.thesis_state import ThesisAgent


from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import AIMessage
from langsmith import traceable


@traceable(name="thesis_agent")
async def thesis_agent(state: GraphState) -> GraphState:
    """Generate the final thesis and recommendation for user based on 
    research, risk, and debate agent output
    """

    print("Thesis agent Working....")

    research = state.research
    research_summary = research.summary
    if not research_summary:
        return {
                "success": False ,
                "error" : "Research Summary not found"
            }
    
    risk_data = state.risks
    if not risk_data:
        return {
                "success": False ,
                "error" : "Risk Data not found"
            }
    
    debate_data = state.debate
    if not debate_data:
        return {
                "success": False ,
                "error" : "Debate Data not found"
            }

    try:
        thesis_llm = llm.with_structured_output(ThesisAgent)
        prompt = ChatPromptTemplate.from_messages([("system", THESIS_PROMPT), ("human", "Research Summary: {research_summary}\n Risk Data: {risk}\n Debate data: {debate}")])
        messages = await prompt.ainvoke({"research_summary": research_summary, "risk": risk_data, "debate": debate_data})
        thesis_analysis = await thesis_llm.ainvoke(messages)

    except Exception as e:
        return {
            "success": False ,
            "error" : f"Thesis Agent Failed: {str(e)}"
        }

    return {
        "success": True ,
        "thesis": thesis_analysis,
        "messages": [
            AIMessage(content=f"Thesis Agent Output: \n{thesis_analysis}")
        ],
        "completed_tasks": ["thesis_agent"]
    }
