import os
from pathlib import Path

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openrouter import ChatOpenRouter
from settings import (
    AUTH_REDIRECT_URL,
    DATABASE_URL,
    PASSWORD_RESET_REDIRECT_URL,
    SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_URL,
)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Primary and fallback LLMs configured with resilient timeouts and failovers.
# Groq provides ultra-fast latency for high-throughput orchestration and structured output.
groq_llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0.2,
    timeout=30,
    api_key=GROQ_API_KEY,
)

google_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.2,
    api_key=GOOGLE_API_KEY,
    timeout=20,
)

openrouter_llm = ChatOpenRouter(
    model="openai/gpt-oss-120b",
    temperature=0.2,
    timeout=30,
    api_key=OPENROUTER_API_KEY,
)

# Robust fallback chain: Groq -> Google -> OpenRouter
llm = groq_llm.with_fallbacks([google_llm, openrouter_llm])
primary_llm = llm

guardrail_llm_groq = ChatGroq(
    model="openai/gpt-oss-20b",
    api_key=GROQ_API_KEY,
    timeout=20,
    temperature=0,
)

guardrail_llm = guardrail_llm_groq.with_fallbacks([google_llm, openrouter_llm])
