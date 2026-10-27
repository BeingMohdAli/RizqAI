import json
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse

from auth import AuthUser, require_application_user as require_user
from schemas.conversation import ChatRequest
from .helpers import get_message_content, serialize_node_output

router = APIRouter(prefix="/analysis", tags=["Analysis"])


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.post("/stream")
async def analyze_stream(
    chat_request: ChatRequest,
    request: Request,
    user: AuthUser = Depends(require_user),
) -> StreamingResponse:
    """Run an investment research query without persisting conversations or messages."""
    query = chat_request.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query must not be empty")

    graph = request.app.state.graph
    thread_id = f"{user.id}:{uuid.uuid4()}"

    async def event_generator():
        try:
            async for update in graph.astream(
                {"user_query": query},
                config={"configurable": {"thread_id": thread_id}},
                stream_mode="updates",
            ):
                for node_name, node_output in update.items():
                    node_output = node_output or {}
                    content = get_message_content(node_name, node_output)
                    event = serialize_node_output(node_name, node_output)
                    if content:
                        event["content"] = content
                    yield f"data: {json.dumps(event)}\n\n"

            yield f"data: {json.dumps({'node': 'done'})}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'node': 'error', 'error': str(exc)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
