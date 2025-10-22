import asyncio
import time
from typing import Any, Dict, Optional, Tuple


class TTLCache:
    def __init__(self, default_ttl_seconds: int = 30) -> None:
        self._default_ttl_seconds = default_ttl_seconds
        self._data: Dict[str, Tuple[Any, float]] = {}
        self._lock = asyncio.Lock()

    async def get(self, key: str) -> Optional[Any]:
        async with self._lock:
            item = self._data.get(key)
            if item is None:
                return None
            value, expires_at = item
            now = time.monotonic()
            if now >= expires_at:
                # Expired - delete and return None
                del self._data[key]
                return None
            return value

    async def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        async with self._lock:
            ttl = ttl_seconds if ttl_seconds is not None else self._default_ttl_seconds
            expires_at = time.monotonic() + max(0, ttl)
            self._data[key] = (value, expires_at)

    async def invalidate(self, key: str) -> None:
        async with self._lock:
            self._data.pop(key, None)

    async def clear(self) -> None:
        async with self._lock:
            self._data.clear()
