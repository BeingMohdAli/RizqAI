from database.models import Conversation

def test_get_conversations(client, db_session):

    conversation = Conversation(title="NVIDIA Analysis")

    db_session.add(conversation)
    db_session.commit()

    response = client.get("/conversations")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["title"] == "NVIDIA Analysis"


def test_get_conversations_does_not_create_chat(client, db_session):

    response = client.get("/conversations")

    assert response.status_code == 200
    assert response.json() == []
    assert db_session.query(Conversation).count() == 0
