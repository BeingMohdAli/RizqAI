import json
import logging

from fastapi import APIRouter, Body, HTTPException
from fastapi.responses import StreamingResponse

from backend.graph.graph import final_graph

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")


@router.get("/")
async def home():
    return {
        "message": "RizqAI API is running"
    }


@router.get("/health")
async def health():
    return {
        "status": "ok"
    }


def _serialize_node_output(node_name: str, node_output: dict) -> dict:
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


@router.post("/analyze/stream")
async def analyze_stream(query: str = Body(..., embed=True)) -> StreamingResponse:
    """Same pipeline as /analyze, but streamed as Server-Sent Events so the
    frontend can render each agent's result as soon as it's ready instead of
    waiting for the whole multi-agent run to finish.

    Each event is a JSON object: {"node": "<agent_name>", "data": {...}}
    A final {"node": "done"} event closes the stream.
    """
    if not query or not query.strip():
        raise HTTPException(status_code=400, detail="query must not be empty")

    async def event_generator():
        try:
            async for update in final_graph.astream(
                {"user_query": query}, stream_mode="updates"
            ):
                for node_name, node_output in update.items():
                    event = _serialize_node_output(node_name, node_output or {})
                    yield f"data: {json.dumps(event)}\n\n"
            yield f"data: {json.dumps({'node': 'done'})}\n\n"
        except Exception as e:
            logger.exception("final_graph.astream failed")
            yield f"data: {json.dumps({'node': 'error', 'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
