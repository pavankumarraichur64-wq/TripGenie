"""Booking schemas."""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class BookingCreate(BaseModel):
    trip_id: Optional[int] = None
    type: str = Field(..., description="hotel | flight")
    item_id: int
    amount: float
    details: Optional[Dict[str, Any]] = None


class BookingResponse(BaseModel):
    id: int
    user_id: int
    trip_id: Optional[int] = None
    type: str
    item_id: int
    booking_ref: str
    amount: float
    status: str
    details: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True
