from typing import Optional
import httpx

_async_client: Optional[httpx.AsyncClient] = None


def get_async_client() -> httpx.AsyncClient:
    global _async_client
    if _async_client is None:
        _async_client = httpx.AsyncClient(
            http2=True,
            timeout=httpx.Timeout(connect=10.0, read=10.0, write=10.0, pool=10.0),
            limits=httpx.Limits(max_connections=100, max_keepalive_connections=20),
            headers={
                "accept": "application/json",
                "user-agent": "currency-dashboard-backend/1.0",
            },
        )
    return _async_client


async def startup() -> None:
    # Lazily creating ensures idempotency
    get_async_client()


async def shutdown() -> None:
    global _async_client
    if _async_client is not None:
        await _async_client.aclose()
        _async_client = None
