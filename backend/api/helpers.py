"""
Helper functions used by api's
"""

def serialize_node_output(node_name: str, node_output: dict) -> dict:
    """Convert one node's raw LangGraph output (which may contain Pydantic
    model instances, e.g. PlannerState/ResearchData/...) into plain JSON.
    """
    data = {}
    for key, value in node_output.items():
        if hasattr(value, "model_dump"):
            data[key] = value.model_dump()
        else:
            data[key] = value
    return {"node": node_name, "data": data}


def generate_conversation_title(query: str, max_length: int = 60) -> str:
    title = " ".join(query.strip().split())

    if len(title) <= max_length:
        return title

    return title[:max_length].rstrip() + "..."
