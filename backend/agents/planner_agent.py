from config import llm
from graph.state import GraphState
from prompts.planner_prompt import PLANNER_PROMPT
from schemas.planner_state import PlannerState


from langchain_core.prompts import ChatPromptTemplate
from langsmith import traceable


@traceable(name="planner_agent")
async def planner_agent(state: GraphState) -> GraphState:
    """Extracts company ticker and plan the agents to run"""

    print("Planner agent Working....")

    try:
        planner_llm = llm.with_structured_output(PlannerState)
        prompt = ChatPromptTemplate.from_messages([
            ("system", PLANNER_PROMPT),
            ("human", "{user_query}"),
        ])
        messages = await prompt.ainvoke({"user_query": state.user_query})
        plan = await planner_llm.ainvoke(messages)

    except Exception as e:
        return {
            "success": False ,
            "error" : f"Planner Agent Failed: {str(e)}"
        }

    return {
        "success": True ,
        "plan" : plan
    }
