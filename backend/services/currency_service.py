import asyncio
from typing import Any, Dict, List
from urllib.parse import urlsplit
from datetime import datetime, timezone

from .http_client import get_async_client
from .cache import TTLCache

# Cache current rates for 30 seconds by default
_cache = TTLCache(default_ttl_seconds=30)

# External API endpoints (redundant sources for resiliency)
API_ENDPOINTS: List[str] = [
    "https://2025-06-18.currency-api.pages.dev/v1/currencies/usd.json",
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@2025-06-18/v1/currencies/usd.json",
]


async def _fetch_json(url: str) -> Dict[str, Any]:
    client = get_async_client()
    resp = await client.get(url)
    resp.raise_for_status()
    return resp.json()


def _hostname(url: str) -> str:
    return urlsplit(url).hostname or url


async def fetch_current_rates() -> List[Dict[str, Any]]:
    """
    Fetch and aggregate current USD-based currency rates from multiple sources.
    Returns a list of dicts with keys matching the frontend's AggregatedRate type.
    """
    cache_key = "current_rates"
    cached = await _cache.get(cache_key)
    if cached is not None:
        return cached

    # Fetch from multiple sources concurrently
    results: List[Dict[str, Any]] = []
    sources: List[str] = []

    async def fetch_and_collect(url: str) -> None:
        try:
            data = await _fetch_json(url)
            # Expect shape: { "date": "YYYY-MM-DD", "usd": { "eur": 0.9, ... } }
            usd_map = data.get("usd") or {}
            if isinstance(usd_map, dict) and usd_map:
                results.append(usd_map)
                sources.append(_hostname(url))
        except Exception:
            # Ignore failed source to keep endpoint resilient
            pass

    await asyncio.gather(*(fetch_and_collect(u) for u in API_ENDPOINTS))

    if not results:
        # No sources succeeded; return empty list
        await _cache.set(cache_key, [], ttl_seconds=10)
        return []

    # Aggregate across available sources
    all_currencies = set()
    for r in results:
        all_currencies.update(r.keys())

    aggregated: List[Dict[str, Any]] = []
    now_iso = datetime.now(tz=timezone.utc).isoformat()

    # Optionally prioritize a subset of popular currencies first
    priority = ["eur", "gbp", "jpy", "aud", "cad", "chf", "cny", "inr", "brl", "zar"]
    ordered_currencies = list(dict.fromkeys(priority + sorted(all_currencies)))

    for code in ordered_currencies:
        values: List[float] = []
        for src_map in results:
            v = src_map.get(code)
            if isinstance(v, (int, float)):
                values.append(float(v))
        if not values:
            continue
        avg = sum(values) / len(values)
        aggregated.append(
            {
                "currency": code.upper(),
                "average_rate": avg,
                "min_rate": min(values),
                "max_rate": max(values),
                "last_updated": now_iso,
                "sources": sources,
            }
        )

    # Limit to a reasonable number to keep payload small
    aggregated = aggregated[:50]

    await _cache.set(cache_key, aggregated, ttl_seconds=30)
    return aggregated
