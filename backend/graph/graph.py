from langgraph.graph import START, END, StateGraph


from graph.state import GraphState
from agents.guardrail_agent import guardrail_agent
from agents.planner_agent import planner_agent
from agents.research_agent import research_agent
from agents.risk_agent import risk_agent
from agents.debate_agent import debate_agent
from agents.thesis_agent import thesis_agent
from agents.node_routing import route_next_agent, route_after_guardrail


graph_builder = StateGraph(GraphState)


graph_builder.add_node("guardrail_agent", guardrail_agent)
graph_builder.add_node("planner_agent", planner_agent)
graph_builder.add_node("research_agent", research_agent)
graph_builder.add_node("risk_agent", risk_agent)
graph_builder.add_node("debate_agent", debate_agent)
graph_builder.add_node("thesis_agent", thesis_agent)


graph_builder.add_edge(START, "guardrail_agent")
graph_builder.add_conditional_edges("guardrail_agent", route_after_guardrail)


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
