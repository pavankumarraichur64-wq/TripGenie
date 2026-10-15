"""
TripGenie — Flights Search Router
"""
from datetime import datetime, date
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.db.database import get_db
from app.models.flight import Flight
from app.schemas.flight import FlightListResponse, FlightResponse

router = APIRouter(prefix="/flights", tags=["Flights"])


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
        query = query.where(Flight.destination.ilike(f"%{destination}%"))
    if flight_class:
        query = query.where(Flight.flight_class == flight_class)
    if max_price is not None:
        query = query.where(Flight.price <= max_price)

    query = query.order_by(Flight.price.asc()).limit(limit)
    flights = db.execute(query).scalars().all()

    return FlightListResponse(total=len(flights), items=flights)
