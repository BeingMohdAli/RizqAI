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
    """Fetch recent English-language headlines relevant to a company/ticker.

    Use this tool when the user asks for latest developments, catalysts,
    events, sentiment-driving headlines, or "what's new" about a company.

    Best for:
    - Recent news and timeline context
    - Qualitative signals that may explain market moves
    - Identifying potential risk/opportunity narratives from headlines

    Not ideal for:
    - Exact price/quote requests (use get_stock_price)
    - Fundamental profile requests like P/E, EPS, sector (use get_company_info)

    Args:
        company: Company name or ticker to search in article text.
        page_size: Number of latest articles to return (default 5).

    Returns:
        dict:
            On success:
                {
                    "success": True,
                    "articles": [
                        {
                            "title": str | None,
                            "source": str | None,
                            "url": str | None,
                            "published_at": str | None,
                            "description": str | None,
                        },
                        ...
                    ],
                }
            On failure:
                {
                    "success": False,
                    "articles": [],
                    "error": "..."
                }

    Notes for agent tool selection:
    - Prefer this tool for queries like "latest news", "recent headlines",
      "what happened today/this week", "key catalysts", or "press coverage".
    - Combine with get_stock_price and/or get_company_info when the user asks
      for both news and quantitative context.
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
