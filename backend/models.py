from pydantic import BaseModel
from datetime import datetime
from typing import Dict, List, Optional

class CurrencyRate(BaseModel):
    currency: str
    rate: float
    source: str
    timestamp: datetime

class TrendData(BaseModel):
    currency: str
    timeframe: str
    data_points: List[Dict[str, float]]
    start_date: datetime
    end_date: datetime

class AggregatedRate(BaseModel):
    currency: str
    average_rate: float
    min_rate: float
    max_rate: float
    last_updated: datetime
    sources: List[str]