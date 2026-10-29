"""On-demand place location and image lookup."""
import logging
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Query

from app.schemas.place import PlaceLookupResponse
from app.services.place_lookup import lookup_place

router = APIRouter(prefix="/places", tags=["Places"])
logger = logging.getLogger(__name__)


@router.get("/lookup", response_model=PlaceLookupResponse)
async def get_place_lookup(
    place: str = Query(..., min_length=2, max_length=120),
    near: Optional[str] = Query(None, max_length=120),
):
    """Find a place on the map and a possible Wikimedia Commons photo."""
    try:
        return await lookup_place(place, near)
    except httpx.HTTPError as exc:
        logger.exception("OpenStreetMap place lookup failed")
        raise HTTPException(
            status_code=503,
            detail="Place lookup is temporarily unavailable. Please try again.",
        ) from exc
