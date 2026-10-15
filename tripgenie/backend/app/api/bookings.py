"""
TripGenie — Bookings Router
"""
import random
import string
from datetime import date
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.booking import Booking
from app.schemas.booking import BookingCreate, BookingResponse

router = APIRouter(prefix="/bookings", tags=["Bookings"])


def _generate_booking_ref() -> str:
    today_str = date.today().strftime("%Y%m%d")
    random_str = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"TG-{today_str}-{random_str}"


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    req: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a simulated booking with confirmed status and ref."""
    booking_ref = _generate_booking_ref()
    booking = Booking(
        user_id=current_user.id,
        trip_id=req.trip_id,
        type=req.type,
        item_id=req.item_id,
        booking_ref=booking_ref,
        amount=req.amount,
        status="confirmed",
        details=req.details or {},
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("", response_model=List[BookingResponse])
def get_user_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all bookings for current user."""
    bookings = db.execute(
        select(Booking)
        .where(Booking.user_id == current_user.id)
        .order_by(Booking.created_at.desc())
    ).scalars().all()
    return bookings


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve booking by ID."""
    booking = db.execute(
        select(Booking).where(Booking.id == booking_id, Booking.user_id == current_user.id)
    ).scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking
