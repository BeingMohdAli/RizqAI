from langgraph.graph import START, END, StateGraph

from backend.agents.planner_agent import planner_agent
from backend.agents.research_agent import research_agent
from backend.schemas.planner_state import Agent

from .state import GraphState

graph_builder = StateGraph(GraphState)

graph_builder.add_node("planner_agent", planner_agent)
graph_builder.add_node("research_agent", research_agent)


def route_after_planner(state: GraphState) -> str:
    """Decide which agent runs next based on the Planner Agent's task list.

    Falls through to END if planning failed or research wasn't requested.
    Other agents (risk, debate, thesis) can be added to this router the
    same way once they're implemented.
    """
    if not state.get("success"):
        return END

    plan = state.get("plan")
    if not plan or Agent.RESEARCH not in plan.tasks:
        return END

    return "research_agent"


graph_builder.add_edge(START, "planner_agent")
graph_builder.add_conditional_edges(
    "planner_agent",
    route_after_planner,
    {"research_agent": "research_agent", END: END},
)
graph_builder.add_edge("research_agent", END)

final_graph = graph_builder.compile()