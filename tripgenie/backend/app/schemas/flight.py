"""Flight search & response schemas."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class FlightResponse(BaseModel):
    id: int
    airline: str
    flight_no: str
    origin: str
    destination: str
    depart_time: datetime
    arrive_time: datetime
    duration_min: int
    price: float
    flight_class: str
    seats_available: int

    class Config:
        from_attributes = True


class FlightListResponse(BaseModel):
    total: int
    items: List[FlightResponse]
