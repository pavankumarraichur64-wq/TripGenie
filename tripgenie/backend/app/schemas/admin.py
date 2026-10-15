"""Admin panel schemas."""
from typing import Optional, List
from pydantic import BaseModel


class AdminStatsResponse(BaseModel):
    total_users: int
    total_trips: int
    total_bookings: int
    total_destinations: int
    total_hotels: int
    total_flights: int
    revenue: float
