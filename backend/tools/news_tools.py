from newsapi import NewsApiClient
from config import NEWS_API_KEY

from langchain_core.tools import tool


_client: NewsApiClient | None = None


def _get_client() -> NewsApiClient:
    """Lazily create a single shared NewsApiClient instance."""
    global _client
    if _client is None:
        if not NEWS_API_KEY:
            raise RuntimeError(
                "NEWS_API_KEY is not set. Add it to backend/.env "
                "(see backend/.env.example) — get a free key at https://newsapi.org"
            )
        _client = NewsApiClient(api_key=NEWS_API_KEY)
    return _client

@tool
def get_company_news(company: str, page_size: int = 5) -> dict:
    """Fetch the latest news headlines mentioning a company or ticker.

    Returns a list of simplified article dicts, or a single-item list with
    an "error" key if the request fails (so the caller can continue
    researching other companies instead of crashing the whole agent run).
    """
    try:
        client = _get_client()
        response = client.get_everything(
            q=company,
            language="en",
            sort_by="publishedAt",
            page_size=page_size,
        )

        articles = response.get("articles", [])

        simplified = [
            {
                "title": article.get("title"),
                "source": (article.get("source") or {}).get("name"),
                "url": article.get("url"),
                "published_at": article.get("publishedAt"),
                "description": article.get("description"),
            }
            for article in articles
        ]

        return {"success": True, "articles": simplified}

    except Exception as e:
        return {
            "success": False,
            "articles": [],
            "error": f"Failed to fetch news for '{company}': {str(e)}",
        }