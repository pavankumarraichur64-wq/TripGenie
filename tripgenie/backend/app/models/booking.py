"""
TripGenie — Booking Model
Records a simulated hotel or flight booking with a unique reference code.
"""
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, JSON, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), nullable=True)
    # "hotel" | "flight"
    booking_type: Mapped[str] = mapped_column(String(10), nullable=False)
    # FK to hotels.id or flights.id depending on booking_type
    item_id: Mapped[int] = mapped_column(nullable=False)
    # Unique booking reference, e.g. TG-20261015-AB3X
    booking_ref: Mapped[str] = mapped_column(String(30), unique=True, nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    # "confirmed" | "cancelled"
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="confirmed")
    # Extra details: traveller names, check-in dates, seat numbers, etc.
    details: Mapped[dict] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"<Booking ref={self.booking_ref} type={self.booking_type}>"
