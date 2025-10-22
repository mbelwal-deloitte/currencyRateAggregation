from __future__ import annotations
from typing import Any, Dict, List
from datetime import datetime, timedelta, timezone
import math

from .cache import TTLCache
from . import currency_service

_cache = TTLCache(default_ttl_seconds=60)


def _points_config(timeframe: str) -> tuple[int, int]:
    if timeframe == "daily":
        return 10, 1
    if timeframe == "weekly":
        return 12, 7
    if timeframe == "monthly":
        return 12, 30
    # Default safe fallback
    return 10, 1


async def get_trends(currency: str, timeframe: str) -> Dict[str, Any]:
    key = f"trends:{currency.upper()}:{timeframe}"
    cached = await _cache.get(key)
    if cached is not None:
        return cached

    # Anchor trend around current average rate if available
    current_rates = await currency_service.fetch_current_rates()
    baseline = next((r["average_rate"] for r in current_rates if r["currency"] == currency.upper()), 1.0)

    num_points, step_days = _points_config(timeframe)
    now = datetime.now(tz=timezone.utc)
    data_points: List[Dict[str, float]] = []

    # Create a gentle sine-wave around baseline to simulate variation
    amplitude = baseline * 0.02  # ±2%
    for i in range(num_points):
        t = now - timedelta(days=i * step_days)
        # Deterministic oscillation
        value = baseline + amplitude * math.sin(i / 2.0)
        data_points.append({t.isoformat(): float(f"{value:.6f}")})

    result: Dict[str, Any] = {
        "currency": currency.upper(),
        "timeframe": timeframe,
        "data_points": list(reversed(data_points)),
        "start_date": (now - timedelta(days=(num_points - 1) * step_days)).isoformat(),
        "end_date": now.isoformat(),
    }

    await _cache.set(key, result, ttl_seconds=60)
    return result
