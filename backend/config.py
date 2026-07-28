import os

from dotenv import load_dotenv
from langchain_mistralai import ChatMistralAI

load_dotenv()

llm = ChatMistralAI(
    model="mistral-large-latest",
    temperature=0.2,
)

# Used by backend/tools/news_tools.py to fetch market news for the Research Agent.
NEWS_API_KEY = os.getenv("NEWS_API_KEY")