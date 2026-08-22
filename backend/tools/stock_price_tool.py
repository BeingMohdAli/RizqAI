import yfinance as yf
from langchain_core.tools import tool
from helpers import resolve_ticker_symbol


@tool
def get_stock_price(symbol: str) -> dict:
    """Return a near-real-time price snapshot for a ticker.

    Use this tool when the user asks for quote-style market data, including:
    - Current/last price
    - Previous close
    - Day range or 52-week range
    - Quick market-cap context tied to the quote snapshot

    Best for:
    - "What is the current price of NVDA?"
    - "How is AAPL trading today?"
    - "Give me day high/low and 52-week range for TSLA"

    Not ideal for:
    - Business profile or valuation deep dive (use get_company_info)
    - Recent headlines or event analysis (use get_company_news)

    Args:
        symbol: Ticker or company-like input. The helper attempts to resolve to
            a valid ticker, then queries Yahoo Finance with the resolved value.

    Returns:
        dict: On success, includes:
            symbol, price, previous_close, currency, day_high, day_low,
            year_high, year_low, market_cap.
        On failure:
            {"symbol": <input>, "error": "..."}

    Notes for agent tool selection:
    - Prefer this as the first tool for direct price questions.
    - Pair with get_company_news if the user asks for "price + why" context.
    - Pair with get_company_info if the user asks for "price + fundamentals".
    """
    try:
        resolved_symbol = resolve_ticker_symbol(symbol) or symbol
        ticker = yf.Ticker(resolved_symbol)
        fast_info = ticker.fast_info

        return {
            "symbol": symbol,
            "price": fast_info.get("lastPrice"),
            "previous_close": fast_info.get("previousClose"),
            "currency": fast_info.get("currency"),
            "day_high": fast_info.get("dayHigh"),
            "day_low": fast_info.get("dayLow"),
            "year_high": fast_info.get("yearHigh"),
            "year_low": fast_info.get("yearLow"),
            "market_cap": fast_info.get("marketCap"),
        }
    
    except Exception as e:
        return {
            "symbol": symbol,
            "error": f"Fetching Stock Price failed: {e}"
        }
