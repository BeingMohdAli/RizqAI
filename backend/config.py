import os
from pathlib import Path


from dotenv import load_dotenv
from langchain_mistralai import ChatMistralAI
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
NEWS_API_KEY = os.getenv("NEWS_API_KEY")


primary_llm = ChatGoogleGenerativeAI(
    model="gemini-3.7-flash",
    temperature="0.2",
    api_key=GOOGLE_API_KEY,
)


fallback_llm_1 = ChatMistralAI(
    model="mistral-large-latest",
    temperature=0.2,
    api_key=MISTRAL_API_KEY
)


fallback_llm_2 = ChatGroq(
    model="openai/gpt-oss-20b",
    temperature=0.2,
    api_key=GROQ_API_KEY
)


llm = primary_llm.with_fallbacks([fallback_llm_1, fallback_llm_2])


guardrail_llm = ChatGroq(
    model="openai/gpt-oss-20b",
    api_key=GROQ_API_KEY
)
