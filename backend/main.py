from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import ORJSONResponse
from datetime import datetime, timedelta
import httpx
import asyncio
import os
from dotenv import load_dotenv
from typing import List, Dict
import random

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
        # Mock data for demonstration
        currencies = ["EUR", "GBP", "JPY", "AUD", "CAD"]
        rates = []
        for currency in currencies:
            base_rate = random.uniform(0.5, 2.0)
            rates.append({
                "currency": currency,
                "average_rate": base_rate,
                "min_rate": base_rate * 0.99,
                "max_rate": base_rate * 1.01,
                "last_updated": datetime.utcnow().isoformat(),
                "sources": ["API_1", "API_2"]
            })
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
        # Mock trend data
        points = 30 if timeframe == "monthly" else 7 if timeframe == "weekly" else 24
        base_rate = random.uniform(0.5, 2.0)
        
        end_date = datetime.utcnow()
        if timeframe == "daily":
            start_date = end_date - timedelta(hours=points)
            delta = timedelta(hours=1)
        elif timeframe == "weekly":
            start_date = end_date - timedelta(days=points)
            delta = timedelta(days=1)
        else:
            start_date = end_date - timedelta(days=points)
            delta = timedelta(days=1)

        data_points = []
        current_date = start_date
        while current_date <= end_date:
            rate = base_rate + random.uniform(-0.1, 0.1)
            data_points.append({current_date.isoformat(): rate})
            current_date += delta

        return {
            "currency": currency,
            "timeframe": timeframe,
            "data_points": data_points,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """API health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow()}