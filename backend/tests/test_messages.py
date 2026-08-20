from database.models import Conversation, Message


def test_get_conversation_messages(client, db_session,):

    conversation = Conversation(title="NVIDIA Analysis")

    db_session.add(conversation)
    db_session.commit()
    db_session.refresh(conversation)

    db_session.add(
        Message(
            conversation_id=conversation.id,
            role="user",
            content="Analyze NVIDIA",
        )
    )

    db_session.add(
        Message(
            conversation_id=conversation.id,
            role="assistant",
            content="NVIDIA looks strong.",
        )
    )

    db_session.commit()

    response = client.get(f"/conversations/{conversation.id}/messages")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

    assert data[0]["role"] == "user"
    assert data[0]["content"] == "Analyze NVIDIA"

    assert data[1]["role"] == "assistant"
    assert data[1]["content"] == "NVIDIA looks strong."


def test_get_messages_unknown_conversation(client):

    response = client.get("/conversations/nonexistent-id/messages")

    assert response.status_code == 404
