"""
TripGenie — Destination Model
Represents a travel destination (city / region) that can be planned and booked.
"""
from sqlalchemy import Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Destination(Base):
    __tablename__ = "destinations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    best_season: Mapped[str] = mapped_column(String(100), nullable=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=True)
    # Average daily cost per person in INR (used for budget estimates)
    avg_daily_cost: Mapped[float] = mapped_column(Numeric(10, 2), nullable=True, default=0.0)

    def __repr__(self) -> str:
        return f"<Destination id={self.id} name={self.name}>"
