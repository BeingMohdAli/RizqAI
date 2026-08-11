import yfinance as yf
from langchain_core.tools import tool


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


def get_stock_price(symbol: str) -> dict:
    """Fetch the latest price snapshot for a stock symbol."""
    try:
        ticker = yf.Ticker(symbol)
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
        return {"symbol": symbol, "error": f"get_stock_price failed: {e}"}


def get_company_info(symbol: str) -> dict:
    """Fetch company profile and fundamentals for a stock symbol."""
    try:
        ticker = yf.Ticker(symbol)
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
        return {"symbol": symbol, "error": f"get_company_info failed: {e}"}


@tool
def get_stock_snapshot(symbol: str) -> dict:
    """Combine price data and fundamentals into a single snapshot.

    This is the main entry point the Research Agent calls per company.
    Resolves company names to ticker symbols first as a safety net, in
    case the Planner Agent returns a name instead of a ticker.
    """
    resolved_symbol = resolve_ticker_symbol(symbol) or symbol

    price = get_stock_price(resolved_symbol)
    company = get_company_info(resolved_symbol)

    # Company info is the richer dict; price data fills in/overrides the
    # live price fields on top of it.
    return {**company, **price}
