"""
TripGenie — Destination Scraper
Scrapes Wikipedia for real destination descriptions and travel info.
Falls back to static data if scraping fails.
"""
import asyncio
import time
import json
from pathlib import Path
from typing import Optional

import httpx
from bs4 import BeautifulSoup


# Path to fallback static data
FALLBACK_PATH = Path(__file__).parent.parent.parent / "data" / "seed_fallback.json"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}


def _load_fallback() -> dict:
    """Load the static fallback seed data."""
    with open(FALLBACK_PATH, encoding="utf-8") as f:
        return json.load(f)


async def scrape_destination(name: str, country: str) -> Optional[dict]:
    """
    Attempt to scrape a destination's description from Wikipedia.
    Returns a dict matching the Destination model, or None on failure.
    """
    try:
        # Use Wikipedia API for clean text extraction
        url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{name.replace(' ', '_')}"
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url, headers=HEADERS)
            resp.raise_for_status()
            data = resp.json()

        description = data.get("extract", "")[:800]  # Limit to 800 chars
        image_url = (
            data.get("thumbnail", {}).get("source", "")
            or data.get("originalimage", {}).get("source", "")
        )

        await asyncio.sleep(1.5)  # Polite delay between requests
        return {
            "name": name,
            "country": country,
            "description": description,
            "image_url": image_url,
        }
    except Exception as e:
        print(f"  [scraper] Wikipedia scrape failed for '{name}': {e}")
        return None


def get_destinations_data(scrape: bool = True) -> list[dict]:
    """
    Return destination data. Tries scraping if scrape=True,
    then merges with static fallback for any missing fields.
    """
    fallback = _load_fallback()
    static_destinations = {d["name"]: d for d in fallback["destinations"]}

    destinations_to_fetch = list(static_destinations.values())

    if not scrape:
        print("  [seed] Using static fallback destinations (SCRAPE_ON_SEED=False)")
        return destinations_to_fetch

    print("  [seed] Scraping destination descriptions from Wikipedia…")
    results = []
    for dest in destinations_to_fetch:
        scraped = asyncio.run(scrape_destination(dest["name"], dest["country"]))
        if scraped:
            # Merge: keep static fields (avg_daily_cost, best_season) but use scraped description/image
            merged = {**dest, **{k: v for k, v in scraped.items() if v}}
            results.append(merged)
            print(f"  [seed] ✓ Scraped: {dest['name']}")
        else:
            results.append(dest)
            print(f"  [seed] ✗ Fallback: {dest['name']}")

    return results
