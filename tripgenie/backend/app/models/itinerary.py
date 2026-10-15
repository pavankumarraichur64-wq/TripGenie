"""
TripGenie — Itinerary Day & Item Models
An itinerary is broken into days; each day contains multiple timed activities.
"""
from typing import List
from sqlalchemy import ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class ItineraryDay(Base):
    __tablename__ = "itinerary_days"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    day_number: Mapped[int] = mapped_column(nullable=False)  # 1-indexed
    title: Mapped[str] = mapped_column(String(200), nullable=True)
    summary: Mapped[str] = mapped_column(Text, nullable=True)

    items: Mapped[List["ItineraryItem"]] = relationship("ItineraryItem", backref="day", cascade="all, delete-orphan", lazy="selectin", order_by="ItineraryItem.position")

    def __repr__(self) -> str:
        return f"<ItineraryDay trip={self.trip_id} day={self.day_number}>"


class ItineraryItem(Base):
    __tablename__ = "itinerary_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    day_id: Mapped[int] = mapped_column(ForeignKey("itinerary_days.id", ondelete="CASCADE"), nullable=False, index=True)
    # Morning | Afternoon | Evening | Night
    time_slot: Mapped[str] = mapped_column(String(20), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    # Food | Activity | Transport | Accommodation | Shopping
    category: Mapped[str] = mapped_column(String(30), nullable=True)
    estimated_cost: Mapped[float] = mapped_column(Numeric(10, 2), nullable=True, default=0.0)
    # Display order within the day
    position: Mapped[int] = mapped_column(nullable=False, default=0)

    def __repr__(self) -> str:
        return f"<ItineraryItem day={self.day_id} slot={self.time_slot} title={self.title}>"
