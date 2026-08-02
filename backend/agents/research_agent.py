from langsmith import traceable
from langchain_classic.agents.agent import AgentExecutor
from langchain_classic.agents.tool_calling_agent.base import create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from backend.config import llm
from backend.graph.state import GraphState
from backend.prompts.prompts import RESEARCH_PROMPT
from backend.tools.news_tools import get_company_news
from backend.tools.stock_tools import get_stock_snapshot

TOOLS = [get_stock_snapshot, get_company_news]

@traceable(name="research_agent")
async def research_agent(state: GraphState) -> GraphState:
    print("Research agent Working....")

    plan = state.get("plan")
    companies = plan.companies if plan else []

    if not companies:
        return {
            "success": False,
            "error": "Research agent received no companies to research.",
        }

    try:

        prompt = ChatPromptTemplate.from_messages([
            ("system", RESEARCH_PROMPT),
            ("human", "Please research the following companies: {companies}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ])

        agent = create_tool_calling_agent(llm=llm, tools=TOOLS, prompt=prompt)

        agent_executor = AgentExecutor(
            agent=agent,
            tools=TOOLS,
            handle_parsing_errors=True,
            max_iterations=6,
            return_intermediate_steps=True
        )

        result = await agent_executor.ainvoke({"companies": companies})

        tool_outputs = []
        for action, observation in result.get("intermediate_steps", []):
            tool_outputs.append({
                "tool": action.tool,
                "tool_input": action.tool_input,
                "output": observation
            })

        research_data = {
            "summary": result.get("output"),
            "tool_data": tool_outputs
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"research_agent failed: {e}",
        }

    return {
        "success": True,
        "research": research_data,
    }