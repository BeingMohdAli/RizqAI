from config import guardrail_llm
from graph.state import GraphState
from prompts.guardrail_prompt import GUARDRAIL_PROMPT
from schemas.guardrail_state import GuardrailDecision

from langchain_core.prompts import ChatPromptTemplate
from langsmith import traceable

@traceable(name="guardrail_agent")
async def guardrail_agent(state: GraphState) -> GraphState:
    """Determines whether the user's query is within RizqAI's scope."""

    print("Guardrail agent Working....")

    try:
        guardrail_model = guardrail_llm.with_structured_output(GuardrailDecision)
        prompt = ChatPromptTemplate.from_messages([
            ("system", GUARDRAIL_PROMPT),
            ("human", "{user_query}"),
        ])
        messages = await prompt.ainvoke({"user_query": state.user_query})
        guardrail_decision = await guardrail_model.ainvoke(messages)

    except Exception as e:
        return {
            "success": False ,
            "error" : f"Guardrail Agent Failed: {str(e)}"
        }

    return {
        "success": True ,
        "guardrail" : guardrail_decision
    }
