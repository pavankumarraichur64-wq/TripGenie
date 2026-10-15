"""
TripGenie — Destinations Router
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from pydantic import BaseModel

from app.db.database import get_db
from app.models.destination import Destination

router = APIRouter(prefix="/destinations", tags=["Destinations"])


class DestinationResponse(BaseModel):
    id: int
    name: str
    country: str
    description: Optional[str] = None
    best_season: Optional[str] = None
    image_url: Optional[str] = None
    avg_daily_cost: Optional[float] = None

    class Config:
        from_attributes = True


@router.get("", response_model=List[DestinationResponse])
def get_destinations(
    query: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List popular destinations for autocomplete and discovery."""
    stmt = select(Destination)
    if query:
        stmt = stmt.where(Destination.name.ilike(f"%{query}%"))
    stmt = stmt.order_by(Destination.name.asc())
    return db.execute(stmt).scalars().all()
