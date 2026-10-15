"""
TripGenie — Hotel Model
Hotels are linked to a destination and used in the simulated booking flow.
"""
from sqlalchemy import ForeignKey, Index, JSON, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Hotel(Base):
    __tablename__ = "hotels"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    destination_id: Mapped[int] = mapped_column(ForeignKey("destinations.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    stars: Mapped[int] = mapped_column(nullable=False, default=3)
    rating: Mapped[float] = mapped_column(Numeric(3, 1), nullable=True, default=0.0)
    price_per_night: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    # amenities stored as JSON list, e.g. ["Pool", "WiFi", "Breakfast"]
    amenities: Mapped[dict] = mapped_column(JSON, nullable=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=True)
    address: Mapped[str] = mapped_column(String(300), nullable=True)

    # Composite index for common filter: find hotels in a destination sorted by price
    __table_args__ = (
        Index("ix_hotels_dest_price", "destination_id", "price_per_night"),
    )

    def __repr__(self) -> str:
        return f"<Hotel id={self.id} name={self.name} stars={self.stars}>"
