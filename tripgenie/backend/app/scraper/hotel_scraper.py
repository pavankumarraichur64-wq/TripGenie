"""
TripGenie — Hotel Scraper
Returns hotel data for each destination.
In a college project context, we use a curated static dataset enriched
with realistic hotel names, ratings, and prices scraped/researched from
public travel sites. Falls back to seed_fallback.json.

Note: Major travel sites (MakeMyTrip, Booking.com) use heavy JS rendering
that httpx cannot access without a headless browser. This scraper therefore
uses the static fallback as primary data (which was manually researched),
making the seed reliable on demo day.
"""
import json
from pathlib import Path

FALLBACK_PATH = Path(__file__).parent.parent.parent / "data" / "seed_fallback.json"


def get_hotels_data() -> list[dict]:
    """
    Return realistic hotel seed data.
    Falls back to curated static dataset from seed_fallback.json.
    """
    with open(FALLBACK_PATH, encoding="utf-8") as f:
        data = json.load(f)
    hotels = data.get("hotels", [])
    print(f"  [seed] Loaded {len(hotels)} hotels from static dataset.")
    return hotels
