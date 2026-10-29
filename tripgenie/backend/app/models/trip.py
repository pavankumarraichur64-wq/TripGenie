"""
TripGenie — Trip Model
A trip is the central entity: created from an AI-generated itinerary,
linked to a user and a destination.
"""
from typing import List, Optional
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, JSON, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    destination_id: Mapped[int] = mapped_column(ForeignKey("destinations.id"), nullable=True)
    destination_name: Mapped[str] = mapped_column(String(150), nullable=False, default="")
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=True)
    days: Mapped[int] = mapped_column(nullable=False, default=3)
    travellers: Mapped[int] = mapped_column(nullable=False, default=1)
    budget: Mapped[float] = mapped_column(Numeric(12, 2), nullable=True)
    # solo | couple | family | friends
    trip_type: Mapped[str] = mapped_column(String(20), nullable=True)
    # e.g. ["beaches", "nightlife", "history"]
    interests: Mapped[dict] = mapped_column(JSON, nullable=True)
    total_estimated_cost: Mapped[float] = mapped_column(Numeric(12, 2), nullable=True)
    # pending | confirmed | completed | cancelled
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="confirmed")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    itinerary_days: Mapped[List["ItineraryDay"]] = relationship("ItineraryDay", backref="trip", cascade="all, delete-orphan", lazy="selectin", order_by="ItineraryDay.day_number")

    def __repr__(self) -> str:
        return f"<Trip id={self.id} title={self.title}>"
