"""Trip and Itinerary schemas."""
from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ItineraryItemBase(BaseModel):
    time_slot: str
    title: str
    description: Optional[str] = None
    category: str
    estimated_cost: float = 0.0
    position: int = 0


class ItineraryItemResponse(ItineraryItemBase):
    id: int
    day_id: int
    place_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photo_url: Optional[str] = None
    photo_credit: Optional[str] = None

    class Config:
        from_attributes = True


class LocalTransportOption(BaseModel):
    mode: str
    description: str
    estimated_fare: float
    estimated_minutes: int
    currency: str = "INR"
    is_mock: bool = True


class ItineraryDayBase(BaseModel):
    day_number: int
    title: str
    summary: Optional[str] = None


class ItineraryDayResponse(ItineraryDayBase):
    id: int
    trip_id: int
    items: List[ItineraryItemResponse] = []
    local_transport: List[LocalTransportOption] = []

    class Config:
        from_attributes = True


class TripGenerateRequest(BaseModel):
    destination: str
    start_date: Optional[date] = None
    days: int = Field(ge=1, le=14, default=3)
    travellers: int = Field(ge=1, default=1)
    budget: float = Field(ge=1000.0, default=20000.0)
    trip_type: str = "leisure"  # leisure, adventure, family, romantic, budget
    interests: List[str] = []
    custom_prompt: Optional[str] = None


class TripResponse(BaseModel):
    id: int
    user_id: int
    destination_id: Optional[int] = None
    destination_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    map_location_source: Optional[str] = None
    title: str
    start_date: Optional[date] = None
    days: int
    travellers: int
    budget: float
    trip_type: str
    interests: Optional[List[str]] = None
    total_estimated_cost: Optional[float] = None
    status: str
    created_at: datetime
    itinerary_days: List[ItineraryDayResponse] = []

    class Config:
        from_attributes = True


class DayRegenerateRequest(BaseModel):
    interests: Optional[List[str]] = None
    custom_notes: Optional[str] = None
