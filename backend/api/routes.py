import json
from uuid import uuid4
from datetime import datetime, timezone


from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session


from database.db import get_db
from database.models import Conversation, Message
from schemas.conversation import ChatRequest, ConversationListItem, MessageResponse
from graph.graph import final_graph
from helpers import serialize_node_output, generate_conversation_title


app = FastAPI(
    title="RizqAi",
    version="1.0.0"
)


router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.get("/health")
async def health():
    return {
        "status": "ok"
    }


@router.get("", response_model=list[ConversationListItem])
def get_conversations(db: Session = Depends(get_db)):
    return (
        db.query(Conversation)
        .order_by(Conversation.updated_at.desc())
        .all()
    )


@router.get("/{conversation_id}/messages", response_model=list[MessageResponse],)
def get_messages(conversation_id: str, db: Session = Depends(get_db)):
    conversation = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id)
        .first()
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    return (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )



@router.post("/messages/stream")
async def analyze_stream(request: ChatRequest, db: Session = Depends(get_db)) -> StreamingResponse:

    query = request.query.strip()

    if not query:
        raise HTTPException(
            status_code=400,
            detail="Query must not be empty",
        )

    conversation_id = request.conversation_id

    if conversation_id is None:

        conversation_id = str(uuid4())
        conversation = Conversation(
            id=conversation_id,
            title=generate_conversation_title(query),
        )
        db.add(conversation)

    else:
        conversation = (
            db.query(Conversation)
            .filter(Conversation.id == conversation_id)
            .first()
        )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    is_first_message = len(conversation.messages) == 0
    
    user_message = Message(
        conversation_id=conversation_id,
        role="user",
        content=query
    )

    if is_first_message:
        conversation.title = generate_conversation_title(query)

    db.add(user_message)
    db.commit()

    config = {
        "configurable": {
            "thread_id": conversation_id,
        }
    }

    async def event_generator():
        last_agent_response = None

        try:

            async for update in final_graph.astream(
                {"user_query": query},
                config=config,
                stream_mode="updates",
            ):

                for node_name, node_output in update.items():

                    event = serialize_node_output(
                        node_name,
                        node_output or {},
                    )

                    last_agent_response = event

                    yield (
                        f"data: "
                        f"{json.dumps(event)}\n\n"
                    )

            if last_agent_response is not None:

                assistant_message = Message(
                    conversation_id=conversation_id,
                    role="assistant",
                    content=json.dumps(last_agent_response),
                )

                db.add(assistant_message)

            conversation.updated_at = datetime.now(timezone.utc)
            db.commit()

            yield (
                f"data: "
                f"{json.dumps({'node': 'done'})}\n\n"
            )

        except Exception as e:

            db.rollback()

            yield (
                f"data: "
                f"{json.dumps({
                    'node': 'error',
                    'error': str(e),
                })}\n\n"
            )

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
