from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from dotenv import load_dotenv
from services import currency_service, trend_service
from services.http_client import startup as http_startup, shutdown as http_shutdown

load_dotenv()

app = FastAPI(title="Currency Rate Aggregation API")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    await http_startup()


@app.on_event("shutdown")
async def on_shutdown():
    await http_shutdown()

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