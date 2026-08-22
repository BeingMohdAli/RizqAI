from langgraph.graph import START, END, StateGraph

from graph.state import GraphState
from agents.planner_agent import planner_agent
from agents.research_agent import research_agent
from agents.risk_agent import risk_agent
from agents.debate_agent import debate_agent
from agents.thesis_agent import thesis_agent
from agents.node_routing import route_next_agent


def build_graph(checkpointer):
    """Build and compile the RizqAI agent graph with the given checkpointer.

    This is a function (not a module-level instance) because AsyncSqliteSaver
    needs an active event loop to open its connection -- it can't be created
    at plain import time the way the old sync SqliteSaver could. Call this
    from an async context instead (see main.py's lifespan handler).
    """
    graph_builder = StateGraph(GraphState)

    graph_builder.add_node("planner_agent", planner_agent)
    graph_builder.add_node("research_agent", research_agent)
    graph_builder.add_node("risk_agent", risk_agent)
    graph_builder.add_node("debate_agent", debate_agent)
    graph_builder.add_node("thesis_agent", thesis_agent)

    graph_builder.add_edge(START, "planner_agent")

    routing_map = {
        "research_agent": "research_agent",
        "risk_agent": "risk_agent",
        "debate_agent": "debate_agent",
        "thesis_agent": "thesis_agent",
        END: END,
    }

    for node in [
        "planner_agent",
        "research_agent",
        "risk_agent",
        "debate_agent",
        "thesis_agent",
    ]:
        graph_builder.add_conditional_edges(node, route_next_agent, routing_map)

    return graph_builder.compile(checkpointer=checkpointer)