import yfinance as yf


def resolve_ticker_symbol(query: str) -> str | None:
    """Best-effort resolution of a company name/ticker to a real ticker symbol.

    The Planner Agent is prompted to always return tickers (e.g. "NVDA"),
    but if it ever slips and returns a plain company name (e.g. "NVIDIA"),
    a direct yf.Ticker(...) lookup returns empty data instead of failing
    loudly. This acts as a safety net: it first checks whether `query`
    already resolves to a valid ticker, and if not, falls back to Yahoo
    Finance's search endpoint to find the closest match.

    Returns the resolved symbol, or None if nothing could be resolved.
    """
    try:
        fast_info = yf.Ticker(query).fast_info
        if fast_info.get("lastPrice") is not None:
            return query.upper()
    except Exception:
        pass

    try:
        matches = yf.Search(query, max_results=1).quotes
        if matches:
            return matches[0].get("symbol")
    except Exception:
        pass

    return None
