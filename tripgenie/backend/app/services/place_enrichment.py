"""Mock map and transport details attached to itinerary API responses."""
from typing import Optional
from urllib.parse import urlparse

from app.models.destination import Destination
from app.models.trip import Trip
from app.schemas.trip import LocalTransportOption, TripResponse


DESTINATION_CENTERS: dict[str, tuple[float, float]] = {
    "goa": (15.4909, 73.8278),
    "jaipur": (26.9124, 75.7873),
    "manali": (32.2432, 77.1892),
    "kerala": (9.9312, 76.2673),
    "udaipur": (24.5854, 73.7125),
    "varanasi": (25.3176, 82.9739),
    "ladakh": (34.1526, 77.5771),
    "andaman": (11.6234, 92.7265),
    "dubai": (25.2048, 55.2708),
    "bangkok": (13.7563, 100.5018),
}

MOCK_TRANSPORT_OPTIONS = [
    LocalTransportOption(
        mode="Auto-rickshaw",
        description="Short city trips; confirm the fare before departure.",
        estimated_fare=180,
        estimated_minutes=20,
        is_mock=True,
    ),
    LocalTransportOption(
        mode="Taxi",
        description="Convenient point-to-point travel; sample fare only.",
        estimated_fare=450,
        estimated_minutes=25,
        is_mock=True,
    ),
    LocalTransportOption(
        mode="Public transport",
        description="Budget-friendly local bus or metro where available.",
        estimated_fare=60,
        estimated_minutes=40,
        is_mock=True,
    ),
]


def enrich_trip(trip: Trip, destination: Optional[Destination]) -> TripResponse:
    """Add explicitly approximate demo locations and local transport choices."""
    response = TripResponse.model_validate(trip)
    center = (
        DESTINATION_CENTERS.get(destination.name.casefold())
        if destination is not None
        else None
    )
    photo_url = destination.image_url if destination is not None else None
    photo_host = urlparse(photo_url).hostname if photo_url else None
    photo_credit = (
        "Illustrative destination photo from Wikimedia Commons; not venue-specific."
        if photo_host == "upload.wikimedia.org"
        else "Illustrative destination photo; not venue-specific."
        if photo_url
        else None
    )
    stop_number = 0

    for day in response.itinerary_days:
        day.local_transport = [option.model_copy() for option in MOCK_TRANSPORT_OPTIONS]
        for item in day.items:
            item.photo_url = photo_url
            item.photo_credit = photo_credit
            if center is None:
                continue

            row, column = divmod(stop_number, 3)
            item.latitude = center[0] + (row - 1) * 0.006
            item.longitude = center[1] + (column - 1) * 0.006
            item.place_name = item.title
            stop_number += 1

    return response
