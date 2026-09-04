import json


def serialize_node_output(node_name: str, node_output: dict) -> dict:
    """Convert one node's raw LangGraph output (which may contain Pydantic
    model instances, e.g. PlannerState/ResearchData/...) into plain JSON.
    """
    data = {}
    for key, value in node_output.items():
        if key =="messages":
            continue
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


def get_message_content(node_name: str, node_output: dict) -> str | None:

    output_keys = {
        "research_agent": "research",
        "risk_agent": "risks",
        "debate_agent": "debate",
        "thesis_agent": "thesis",
        "general_finance_agent": "general_finance",
    }

    key = output_keys.get(node_name)

    if not key:
        return None

    value = node_output.get(key)

    if value is None:
        return None

    if hasattr(value, "model_dump"):
        value = value.model_dump()


    return json.dumps(value, default=str)
