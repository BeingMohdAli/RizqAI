from config import llm
from graph.state import GraphState
from prompts.general_finance_prompt import GENERAL_FINANCE_PROMPT
from schemas.general_finance_state import GeneralFinanceAnswer

from langchain_core.prompts import ChatPromptTemplate
from langsmith import traceable


@traceable(name="general_finance_agent")
async def general_finance_agent(state: GraphState) -> GraphState:
    """Answers general finance/investing questions with a summarized response."""

    print("General Finance agent Working....")

    try:
        general_llm = llm.with_structured_output(GeneralFinanceAnswer)
        prompt = ChatPromptTemplate.from_messages([
            ("system", GENERAL_FINANCE_PROMPT),
            ("human", "{user_query}"),
        ])
        messages = await prompt.ainvoke({"user_query": state.user_query})
        answer = await general_llm.ainvoke(messages)

    except Exception as e:
        return {
            "success": False,
            "error": f"General Finance Agent Failed: {str(e)}"
        }

    return {
        "success": True,
        "general_finance": answer,
        "completed_tasks": ["general_finance_agent"]
    }