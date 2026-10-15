"""
TripGenie — Flight Model
Flights are pre-seeded and used in the simulated booking flow.
Depart/arrive times are stored as full UTC datetimes.
"""
from datetime import datetime

from sqlalchemy import DateTime, Index, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, synonym

from app.db.database import Base


class Flight(Base):
    __tablename__ = "flights"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    airline: Mapped[str] = mapped_column(String(100), nullable=False)
    flight_no: Mapped[str] = mapped_column(String(20), nullable=False)
    origin: Mapped[str] = mapped_column(String(100), nullable=False)
    destination: Mapped[str] = mapped_column(String(100), nullable=False)
    depart_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    arrive_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    duration_min: Mapped[int] = mapped_column(nullable=False)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    # class stored as string: "economy" | "business"
    seat_class: Mapped[str] = mapped_column(String(20), nullable=False, default="economy")
    flight_class = synonym("seat_class")
    seats_available: Mapped[int] = mapped_column(nullable=False, default=50)

    # Composite index for common filter: origin → destination on a date
    __table_args__ = (
        Index("ix_flights_route_date", "origin", "destination", "depart_time"),
    )

    def __repr__(self) -> str:
        return f"<Flight {self.flight_no} {self.origin}→{self.destination}>"
