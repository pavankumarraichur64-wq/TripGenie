"""Hotel search & response schemas."""
from typing import Optional, List, Any
from pydantic import BaseModel


class HotelResponse(BaseModel):
    id: int
    destination_id: int
    name: str
    stars: int
    rating: float
    price_per_night: float
    amenities: Optional[List[str]] = None
    image_url: Optional[str] = None
    address: Optional[str] = None

    class Config:
        from_attributes = True


class HotelListResponse(BaseModel):
    total: int
    page: int
    per_page: int
    items: List[HotelResponse]
