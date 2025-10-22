from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import ORJSONResponse

from dotenv import load_dotenv

from models import CurrencyRate, TrendData
from services import currency_service, trend_service

load_dotenv()

app = FastAPI(
    title="Currency Rate Aggregation API",
    default_response_class=ORJSONResponse,
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enable gzip compression for large responses
app.add_middleware(GZipMiddleware, minimum_size=500)


# Lightweight cache headers for GET endpoints
@app.middleware("http")
async def add_cache_headers(request, call_next):
    response = await call_next(request)
    if request.method == "GET":
        path = request.url.path
        if path.startswith("/api/rates/current"):
            # Frequent updates; cache briefly
            response.headers["Cache-Control"] = "public, max-age=15, must-revalidate"
        elif path.startswith("/api/trends"):
            # Trends change less frequently
            response.headers["Cache-Control"] = "public, max-age=300"
        elif path.startswith("/api/health"):
            response.headers["Cache-Control"] = "no-store"
    return response

# API endpoints for currency rates
API_ENDPOINTS = [
    "https://2025-06-18.currency-api.pages.dev/v1/currencies/usd.json",
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@2025-06-18/v1/currencies/usd.json"
]

@app.get("/")
async def root():
    return {"message": "Currency Rate Aggregation API"}

@app.get("/api/rates/current")
async def get_current_rates():
    """Fetch and aggregate current rates from multiple sources"""
    try:
        rates = await currency_service.fetch_current_rates()
        return rates
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trends/{currency}/{timeframe}")
async def get_trends(currency: str, timeframe: str):
    """Get historical trend data for a specific currency and timeframe"""
    valid_timeframes = ["daily", "weekly", "monthly"]
    if timeframe not in valid_timeframes:
        raise HTTPException(status_code=400, detail="Invalid timeframe")
    
    try:
        trends = await trend_service.get_trends(currency, timeframe)
        return trends
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """API health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow()}