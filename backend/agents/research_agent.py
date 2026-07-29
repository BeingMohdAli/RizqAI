import asyncio
import json

from langchain_core.prompts import ChatPromptTemplate
from langsmith import traceable

from backend.config import llm
from backend.graph.state import GraphState
from backend.prompts.prompts import RESEARCH_PROMPT
from backend.tools.news_tools import get_company_news
from backend.tools.stock_tools import get_stock_snapshot


async def _research_company(company: str) -> dict:
    """Gather stock data + news for a single company concurrently.

    yfinance and newsapi-python are both synchronous/blocking libraries, so
    each call is pushed to a thread via run_in_executor rather than blocking
    the event loop directly.
    """
    loop = asyncio.get_event_loop()

    snapshot_task = loop.run_in_executor(None, get_stock_snapshot, company)
    news_task = loop.run_in_executor(None, get_company_news, company)

    snapshot, news = await asyncio.gather(snapshot_task, news_task)

    return {
        "symbol": company,
        "snapshot": snapshot,
        "news": news,
    }


@traceable(name="research_agent")
async def research_agent(state: GraphState) -> GraphState:
    """Research Agent.

    Fetches stock price, fundamentals, company info, and the latest news for
    every company identified by the Planner Agent (state["plan"].companies),
    then asks the LLM for a short, neutral, non-advisory summary of each.

    Populates state["research"] with:
        {
            "<SYMBOL>": {"symbol": ..., "snapshot": {...}, "news": [...]},
            ...
            "summary": "<LLM-written overview of all companies researched>",
        }
    """

    print("Research agent Working....")

    plan = state.get("plan")
    companies = plan.companies if plan else []

    if not companies:
        return {
            "success": False,
            "error": "Research agent received no companies to research.",
        }

    try:
        results = await asyncio.gather(
            *(_research_company(company) for company in companies)
        )

        research_data: dict = {item["symbol"]: item for item in results}

        prompt = ChatPromptTemplate.from_messages([("system", RESEARCH_PROMPT)])
        messages = await prompt.ainvoke(
            {"research_data": json.dumps(research_data, default=str)}
        )
        summary = await llm.ainvoke(messages)

        research_data["summary"] = summary.content

    except Exception as e:
        return {
            "success": False,
            "error": f"research_agent failed: {e}",
        }

    return {
        "success": True,
        "research": research_data,
    }