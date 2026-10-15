"""
TripGenie — Flight Scraper
Returns realistic flight data for Indian and international routes.
Uses a curated static dataset (manually researched from public flight info).

Note: Google Flights and similar sites require JS rendering / login.
The static dataset includes real airline names, realistic pricing, and
routes covering all 10 destinations — sufficient for demo and viva.
"""
import json
from datetime import datetime, timedelta
from pathlib import Path
import random

FALLBACK_PATH = Path(__file__).parent.parent.parent / "data" / "seed_fallback.json"


def get_flights_data() -> list[dict]:
    """
    Return realistic flight data covering the next 90 days.
    Expands the static route templates into actual dated flight records.
    """
    with open(FALLBACK_PATH, encoding="utf-8") as f:
        data = json.load(f)
    
    routes = data.get("flight_routes", [])
    flights = []
    today = datetime.now()

    for route in routes:
        # Generate flights for the next 90 days (every day or every 2-3 days)
        for day_offset in range(0, 90, route.get("frequency_days", 1)):
            depart_date = today + timedelta(days=day_offset)
            depart_hour = route["depart_hour"]
            depart_time = depart_date.replace(
                hour=depart_hour, minute=route.get("depart_minute", 0), second=0, microsecond=0
            )
            arrive_time = depart_time + timedelta(minutes=route["duration_min"])
            
            # Add slight price variation (±10%) for realism
            base_price = route["base_price"]
            price = round(base_price * random.uniform(0.90, 1.10), 2)

            flights.append({
                "airline": route["airline"],
                "flight_no": f"{route['flight_no_prefix']}{random.randint(100, 999)}",
                "origin": route["origin"],
                "destination": route["destination"],
                "depart_time": depart_time.strftime("%Y-%m-%d %H:%M:%S"),
                "arrive_time": arrive_time.strftime("%Y-%m-%d %H:%M:%S"),
                "duration_min": route["duration_min"],
                "price": price,
                "seat_class": route.get("seat_class", "economy"),
                "seats_available": random.randint(10, 80),
            })

    print(f"  [seed] Generated {len(flights)} flight records across {len(routes)} routes.")
    return flights
