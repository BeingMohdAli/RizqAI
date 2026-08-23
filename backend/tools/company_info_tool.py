import yfinance as yf
from helpers import resolve_ticker_symbol
from langchain_core.tools import tool


@tool
def get_company_info(symbol: str) -> dict:
    """Return company profile + fundamental metrics for a ticker.

    Use this tool when the user asks for company background or valuation-style
    fundamentals, for example:
    - "What does NVIDIA do?"
    - "Show Apple fundamentals"
    - "Give me market cap / P-E / EPS for MSFT"

    Best for:
    - Business profile context (name, sector, industry, summary)
    - Valuation and financial snapshot fields (market cap, trailing/forward PE,
      EPS, dividend yield, beta)
    - 52-week context from Yahoo Finance info fields

    Not ideal for:
    - Breaking/news events (use get_company_news)
    - Intraday/near-real-time price checks (use get_stock_price)

    Args:
        symbol: Ticker or company name-like string. The helper attempts ticker
            resolution first; if resolution fails, the original input is used.

    Returns:
        dict: On success, includes keys such as:
            symbol, name, sector, industry, summary, market_cap, pe_ratio,
            forward_pe, eps, dividend_yield, beta, 52_week_high, 52_week_low.
        On failure:
            {"symbol": <input>, "error": "..."}

    Notes for agent tool selection:
    - Choose this tool if the user asks "what company is this", "fundamentals",
      "valuation", "financial metrics", or "business summary".
    - Pair with get_stock_price when the user also asks for current trading data.
    """
    try:
        resolved_symbol = resolve_ticker_symbol(symbol) or symbol
        ticker = yf.Ticker(resolved_symbol)
        info = ticker.info

        return {
            "symbol": symbol,
            "name": info.get("longName"),
            "sector": info.get("sector"),
            "industry": info.get("industry"),
            "summary": info.get("longBusinessSummary"),
            "market_cap": info.get("marketCap"),
            "pe_ratio": info.get("trailingPE"),
            "forward_pe": info.get("forwardPE"),
            "eps": info.get("trailingEps"),
            "dividend_yield": info.get("dividendYield"),
            "beta": info.get("beta"),
            "52_week_high": info.get("fiftyTwoWeekHigh"),
            "52_week_low": info.get("fiftyTwoWeekLow"),
        }
    
    except Exception as e:
        return {
            "symbol": symbol,
            "error": f"Fetching Company info failed: {e}"
        }
