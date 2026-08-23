from config import llm
from graph.state import GraphState
from prompts.prompts import PLANNER_PROMPT
from schemas.planner_state import PlannerState

from langchain_core.prompts import ChatPromptTemplate
from langsmith import traceable


@traceable(name="planner_agent")
async def planner_agent(state: GraphState) -> GraphState:
    """Extracts company ticker and plan the agents to run"""

    print("Planner agent Working....")

    try:
        planner_llm = llm.with_structured_output(PlannerState)

        # Resolve pronouns like "should i buy it??" using the last company
        # discussed in this conversation, if any.
        previous_companies = (
            state.plan.companies
            if state.plan and state.plan.companies
            else []
        )

        context_line = (
            f"Previously discussed company/companies: {', '.join(previous_companies)}."
            if previous_companies
            else "No prior company has been discussed yet in this conversation."
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", PLANNER_PROMPT),
            ("human", "{context}\n\nCurrent user message: {user_query}"),
        ])

        messages = await prompt.ainvoke({
            "context": context_line,
            "user_query": state.user_query,
        })
        plan = await planner_llm.ainvoke(messages)

    except Exception as e:
        return {
            "success": False,
            "error": f"Planner Agent Failed: {str(e)}"
        }

    return {
        "success": True,
        "plan": plan
    }