from langgraph.graph import START, END, StateGraph

from backend.graph.state import GraphState
from backend.agents.planner_agent import planner_agent
from backend.agents.research_agent import research_agent
from backend.agents.risk_agent import risk_agent
from backend.agents.debate_agent import debate_agent
from backend.agents.thesis_agent import thesis_agent
from backend.agents.node_routing import route_next_agent

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
    END: END
}

graph_builder.add_conditional_edges(
    "planner_agent",
    route_next_agent,
    routing_map
)

graph_builder.add_conditional_edges(
    "research_agent",
    route_next_agent,
    routing_map
)

graph_builder.add_conditional_edges(
    "risk_agent",
    route_next_agent,
    routing_map
)

graph_builder.add_conditional_edges(
    "debate_agent",
    route_next_agent,
    routing_map
)

graph_builder.add_conditional_edges(
    "thesis_agent",
    route_next_agent,
    routing_map
)

final_graph = graph_builder.compile()
