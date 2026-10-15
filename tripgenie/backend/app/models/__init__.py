"""
TripGenie — Models Package
Import all models here so Alembic can discover them automatically.
"""
from app.models.user import User
from app.models.destination import Destination
from app.models.hotel import Hotel
from app.models.flight import Flight
from app.models.trip import Trip
from app.models.itinerary import ItineraryDay, ItineraryItem
from app.models.booking import Booking
from app.models.chat import ChatMessage
from app.models.ai_cache import AICache

__all__ = [
    "User",
    "Destination",
    "Hotel",
    "Flight",
    "Trip",
    "ItineraryDay",
    "ItineraryItem",
    "Booking",
    "ChatMessage",
    "AICache",
]
