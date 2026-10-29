"""
TripGenie — Flights Search Router
"""
from datetime import datetime, date, time, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, select

from app.db.database import get_db
from app.models.flight import Flight
from app.schemas.flight import FlightListResponse, FlightResponse

router = APIRouter(prefix="/flights", tags=["Flights"])

DESTINATION_ROUTE_ALIASES = {
    "kerala": ("kochi",),
    "ladakh": ("leh",),
    "andaman": ("port blair",),
}


@router.get("", response_model=FlightListResponse)
def search_flights(
    origin: Optional[str] = Query(None),
    destination: Optional[str] = Query(None),
    depart_date: Optional[date] = Query(None),
    flight_class: Optional[str] = Query(None, regex="^(economy|business)$"),
    max_price: Optional[float] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Search flights by origin, destination, class, and price."""
    query = select(Flight)

    if origin:
        query = query.where(Flight.origin.ilike(f"%{origin}%"))
    if destination:
        route_names = (destination, *DESTINATION_ROUTE_ALIASES.get(destination.casefold(), ()))
        query = query.where(
            or_(*(Flight.destination.ilike(f"%{name}%") for name in route_names))
        )
    if depart_date:
        day_start = datetime.combine(depart_date, time.min)
        query = query.where(
            Flight.depart_time >= day_start,
            Flight.depart_time < day_start + timedelta(days=1),
        )
    if flight_class:
        query = query.where(Flight.flight_class == flight_class)
    if max_price is not None:
        query = query.where(Flight.price <= max_price)

    query = query.order_by(Flight.price.asc()).limit(limit)
    flights = db.execute(query).scalars().all()

    return FlightListResponse(total=len(flights), items=flights)
