"""Low-volume cached geocoding and place-photo lookup for itinerary views."""
import asyncio
from html.parser import HTMLParser
import logging
import re
import time
from typing import Any, Optional

import httpx

from app.schemas.place import PlaceLookupResponse

logger = logging.getLogger(__name__)

PHOTON_URL = "https://photon.komoot.io/api/"
COMMONS_API_URL = "https://commons.wikimedia.org/w/api.php"
CACHE_TTL_SECONDS = 24 * 60 * 60
PHOTON_MIN_INTERVAL_SECONDS = 1.0
MAX_CACHE_ENTRIES = 256

_lookup_cache: dict[str, tuple[float, PlaceLookupResponse]] = {}
_photon_lock = asyncio.Lock()
_last_photon_request = 0.0


class _TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        self.parts.append(data)


def _plain_text(value: Any) -> Optional[str]:
    if not isinstance(value, str) or not value:
        return None
    parser = _TextExtractor()
    parser.feed(value)
    return re.sub(r"\s+", " ", " ".join(parser.parts)).strip() or None


def _cached(key: str) -> Optional[PlaceLookupResponse]:
    entry = _lookup_cache.get(key)
    if entry is None:
        return None
    created_at, response = entry
    if time.monotonic() - created_at >= CACHE_TTL_SECONDS:
        _lookup_cache.pop(key, None)
        return None
    return response.model_copy()


def _store(key: str, response: PlaceLookupResponse) -> None:
    if len(_lookup_cache) >= MAX_CACHE_ENTRIES:
        oldest_key = min(_lookup_cache, key=lambda item: _lookup_cache[item][0])
        _lookup_cache.pop(oldest_key, None)
    _lookup_cache[key] = (time.monotonic(), response.model_copy())


async def _photon_lookup(query: str) -> tuple[Optional[float], Optional[float], Optional[str]]:
    global _last_photon_request
    async with _photon_lock:
        delay = PHOTON_MIN_INTERVAL_SECONDS - (time.monotonic() - _last_photon_request)
        if delay > 0:
            await asyncio.sleep(delay)

        try:
            async with httpx.AsyncClient(
                headers={"User-Agent": "TripGenie/1.0 (https://github.com/pavankumarraichur64-wq/TripGenie)"},
                timeout=8.0,
            ) as client:
                response = await client.get(
                    PHOTON_URL,
                    params={"q": query, "limit": 1, "lang": "en"},
                )
                response.raise_for_status()
                payload = response.json()
        finally:
            _last_photon_request = time.monotonic()

    features = payload.get("features", [])
    if not features:
        return None, None, None

    feature = features[0]
    coordinates = feature.get("geometry", {}).get("coordinates", [])
    properties = feature.get("properties", {})
    if len(coordinates) < 2:
        return None, None, None

    name_parts = [
        properties.get("name"),
        properties.get("street"),
        properties.get("city") or properties.get("district"),
        properties.get("state"),
        properties.get("country"),
    ]
    display_name = ", ".join(dict.fromkeys(part for part in name_parts if part))
    return float(coordinates[1]), float(coordinates[0]), display_name or None


async def _commons_photo(query: str) -> dict[str, Optional[str]]:
    async with httpx.AsyncClient(
        headers={"User-Agent": "TripGenie/1.0 (https://github.com/pavankumarraichur64-wq/TripGenie)"},
        timeout=10.0,
    ) as client:
        response = await client.get(
            COMMONS_API_URL,
            params={
                "action": "query",
                "generator": "search",
                "gsrsearch": query,
                "gsrnamespace": 6,
                "gsrlimit": 5,
                "prop": "imageinfo",
                "iiprop": "url|extmetadata",
                "iiurlwidth": 640,
                "format": "json",
                "formatversion": 2,
            },
        )
        response.raise_for_status()
        payload = response.json()

    pages = payload.get("query", {}).get("pages", [])
    for page in pages:
        image_info = (page.get("imageinfo") or [{}])[0]
        metadata = image_info.get("extmetadata", {})
        photo_url = image_info.get("thumburl") or image_info.get("url")
        page_url = image_info.get("descriptionurl")
        if not photo_url or not page_url:
            continue
        return {
            "photo_url": photo_url,
            "photo_page_url": page_url,
            "photo_artist": _plain_text(metadata.get("Artist", {}).get("value")),
            "photo_license": _plain_text(
                metadata.get("LicenseShortName", {}).get("value")
            ),
        }

    return {
        "photo_url": None,
        "photo_page_url": None,
        "photo_artist": None,
        "photo_license": None,
    }


async def lookup_place(place: str, near: Optional[str] = None) -> PlaceLookupResponse:
    normalized_place = " ".join(place.split())
    normalized_near = " ".join((near or "").split())
    query = ", ".join(part for part in (normalized_place, normalized_near) if part)
    key = query.casefold()
    cached = _cached(key)
    if cached is not None:
        return cached

    latitude, longitude, display_name = await _photon_lookup(query)
    try:
        photo = await _commons_photo(query)
    except httpx.HTTPError:
        logger.exception("Wikimedia Commons photo lookup failed for place query")
        photo = {
            "photo_url": None,
            "photo_page_url": None,
            "photo_artist": None,
            "photo_license": None,
        }

    result = PlaceLookupResponse(
        name=display_name or normalized_place,
        latitude=latitude,
        longitude=longitude,
        location_source="OpenStreetMap via Photon" if latitude is not None else None,
        **photo,
    )
    _store(key, result)
    return result
