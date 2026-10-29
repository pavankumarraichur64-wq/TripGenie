"""
TripGenie — API Router Registry
Registers all sub-routers under the /api/v1 prefix.
"""
from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.destinations import router as destinations_router
from app.api.trips import router as trips_router
from app.api.hotels import router as hotels_router
from app.api.flights import router as flights_router
from app.api.bookings import router as bookings_router
from app.api.chat import router as chat_router
from app.api.admin import router as admin_router
from app.api.export import router as export_router
from app.api.places import router as places_router

# Main versioned router — all routes under /api/v1/...
api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(destinations_router)
api_router.include_router(trips_router)
api_router.include_router(hotels_router)
api_router.include_router(flights_router)
api_router.include_router(bookings_router)
api_router.include_router(chat_router)
api_router.include_router(admin_router)
api_router.include_router(export_router)
api_router.include_router(places_router)
