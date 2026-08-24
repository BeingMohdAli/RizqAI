import os
from pathlib import Path

from dotenv import load_dotenv
from langchain_mistralai import ChatMistralAI
from langchain_groq import ChatGroq


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


llm = ChatMistralAI(
    model="mistral-large-latest",
    temperature=0.2,
)


NEWS_API_KEY = os.getenv("NEWS_API_KEY")


guardrail_llm = ChatGroq(
    model="openai/gpt-oss-20b",
)
