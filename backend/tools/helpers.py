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
    query = query.strip()

    if not query:
        return None

    try:
        matches = yf.Search(query, max_results=5).quotes

        if not matches:
            return None

        query_upper = query.upper()

        # If the user already supplied a valid ticker,
        # prefer an exact symbol match.
        for match in matches:
            symbol = match.get("symbol")

            if symbol and symbol.upper() == query_upper:
                return symbol.upper()

        # Otherwise use the best Yahoo Finance search result.
        symbol = matches[0].get("symbol")

        return symbol.upper() if symbol else None

    except Exception:
        return None
