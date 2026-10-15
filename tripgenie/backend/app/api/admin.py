"""
TripGenie — Admin Panel Router
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.db.database import get_db
from app.core.deps import require_admin
from app.models.user import User
from app.models.trip import Trip
from app.models.booking import Booking
from app.models.destination import Destination
from app.models.hotel import Hotel
from app.models.flight import Flight
from app.schemas.admin import AdminStatsResponse
from app.schemas.booking import BookingResponse

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """System-wide summary metrics for admin dashboard."""
    total_users = db.execute(select(func.count(User.id))).scalar_one()
    total_trips = db.execute(select(func.count(Trip.id))).scalar_one()
    total_bookings = db.execute(select(func.count(Booking.id))).scalar_one()
    total_destinations = db.execute(select(func.count(Destination.id))).scalar_one()
    total_hotels = db.execute(select(func.count(Hotel.id))).scalar_one()
    total_flights = db.execute(select(func.count(Flight.id))).scalar_one()
    revenue = db.execute(select(func.coalesce(func.sum(Booking.amount), 0.0))).scalar_one()

    return AdminStatsResponse(
        total_users=total_users,
        total_trips=total_trips,
        total_bookings=total_bookings,
        total_destinations=total_destinations,
        total_hotels=total_hotels,
        total_flights=total_flights,
        revenue=float(revenue),
    )


@router.get("/bookings", response_model=List[BookingResponse])
def get_all_bookings(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """List all user bookings across the entire platform."""
    bookings = db.execute(select(Booking).order_by(Booking.created_at.desc())).scalars().all()
    return bookings
