"""Map and transport details attached to itinerary API responses."""
from typing import Optional

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

INDIA_TRANSPORT_OPTIONS = [
    LocalTransportOption(
        mode="Auto-rickshaw",
        description="Sample fare for a short city trip; agree on the fare before departure.",
        estimated_fare=180,
        estimated_minutes=20,
        is_mock=True,
    ),
    LocalTransportOption(
        mode="App-based taxi",
        description="Illustrative short-trip estimate; actual fares vary by time and demand.",
        estimated_fare=450,
        estimated_minutes=25,
        is_mock=True,
    ),
    LocalTransportOption(
        mode="Local bus",
        description="Indicative local bus fare and travel time; check the current route.",
        estimated_fare=60,
        estimated_minutes=40,
        is_mock=True,
    ),
]

DESTINATION_TRANSPORT_OPTIONS: dict[str, list[LocalTransportOption]] = {
    "dubai": [
        LocalTransportOption(
            mode="Metro",
            description="Illustrative short urban trip; check zones and current fares.",
            estimated_fare=5,
            estimated_minutes=25,
            currency="AED",
        ),
        LocalTransportOption(
            mode="Taxi",
            description="Sample city fare only; actual meter fares may vary.",
            estimated_fare=25,
            estimated_minutes=20,
            currency="AED",
        ),
        LocalTransportOption(
            mode="Public bus",
            description="Indicative fare; confirm the route and Nol card requirements.",
            estimated_fare=3,
            estimated_minutes=40,
            currency="AED",
        ),
    ],
    "bangkok": [
        LocalTransportOption(
            mode="BTS / MRT",
            description="Illustrative short urban trip; check the current route fare.",
            estimated_fare=40,
            estimated_minutes=20,
            currency="THB",
        ),
        LocalTransportOption(
            mode="Taxi",
            description="Sample short-trip estimate; traffic and meter fare vary.",
            estimated_fare=120,
            estimated_minutes=30,
            currency="THB",
        ),
        LocalTransportOption(
            mode="Tuk-tuk",
            description="Indicative short-trip fare; agree on the price before departure.",
            estimated_fare=150,
            estimated_minutes=20,
            currency="THB",
        ),
    ],
}


def _transport_options_for(destination: Optional[Destination]) -> list[LocalTransportOption]:
    if destination is None:
        return [option.model_copy() for option in INDIA_TRANSPORT_OPTIONS]

    options = DESTINATION_TRANSPORT_OPTIONS.get(
        destination.name.casefold(),
        INDIA_TRANSPORT_OPTIONS,
    )
    return [option.model_copy() for option in options]


def enrich_trip(trip: Trip, destination: Optional[Destination]) -> TripResponse:
    """Add destination map fallback and local transport estimates."""
    response = TripResponse.model_validate(trip)
    response.destination_name = (
        trip.destination_name
        or (destination.name if destination is not None else trip.title)
    )
    center = (
        DESTINATION_CENTERS.get(response.destination_name.casefold())
    )
    if center is not None:
        response.latitude, response.longitude = center
        response.map_location_source = "Approximate destination center"

    for day in response.itinerary_days:
        day.local_transport = _transport_options_for(destination)
        for item in day.items:
            item.place_name = item.title

    return response
