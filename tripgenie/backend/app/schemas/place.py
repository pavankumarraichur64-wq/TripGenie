"""Place lookup response schemas."""
from typing import Optional

from pydantic import BaseModel


class PlaceLookupResponse(BaseModel):
    name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_source: Optional[str] = None
    photo_url: Optional[str] = None
    photo_page_url: Optional[str] = None
    photo_artist: Optional[str] = None
    photo_license: Optional[str] = None
