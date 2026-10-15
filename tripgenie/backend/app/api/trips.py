"""
TripGenie — Trips & AI Itinerary Generation Router
"""
import hashlib
import json
import logging
from datetime import datetime, date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select

from app.db.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.trip import Trip
from app.models.destination import Destination
from app.models.itinerary import ItineraryDay, ItineraryItem
from app.models.ai_cache import AICache
from app.schemas.trip import TripGenerateRequest, TripResponse, DayRegenerateRequest, ItineraryDayResponse
from app.ai.llm_service import llm_service
from app.ai.prompts import ITINERARY_SYSTEM_PROMPT, REGENERATE_DAY_PROMPT

router = APIRouter(prefix="/trips", tags=["Trips"])
logger = logging.getLogger(__name__)


def _compute_prompt_hash(payload: dict) -> str:
    serialized = json.dumps(payload, sort_keys=True, default=str)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


@router.post("/generate", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def generate_trip(
    req: TripGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate an AI itinerary for given travel parameters.
    Checks ai_cache first; calls Groq LLaMA 3.1 if cache miss, then saves to MySQL.
    """
    cache_key = _compute_prompt_hash(req.dict())
    cached = db.execute(select(AICache).where(AICache.prompt_hash == cache_key)).scalar_one_or_none()

    itinerary_data = None
    if cached:
        itinerary_data = cached.response
    else:
        user_prompt = f"""
Plan a {req.days}-day {req.trip_type} trip to {req.destination} for {req.travellers} traveler(s).
Total Budget: ₹{req.budget} INR.
Start Date: {req.start_date.isoformat() if req.start_date else 'Flexible'}
Interests: {', '.join(req.interests) if req.interests else 'General sightseeing, local food, culture'}
Additional preferences: {req.custom_prompt or 'None'}
"""
        try:
            itinerary_data = await llm_service.generate_json(
                system_prompt=ITINERARY_SYSTEM_PROMPT,
                user_prompt=user_prompt,
            )
            # Save to ai_cache
            db_cache = AICache(prompt_hash=cache_key, response=itinerary_data)
            db.add(db_cache)
            db.commit()
        except Exception as e:
            logger.exception("AI generation failed: %s", e)
            # Fallback mock itinerary if AI fails or Groq key not set
            itinerary_data = {
                "title": f"Memorable {req.days}-Day Getaway to {req.destination}",
                "summary": f"A delightful exploration of {req.destination} tailored for {req.trip_type} travel.",
                "days": [
                    {
                        "day_number": d,
                        "title": f"Exploring {req.destination} - Day {d}",
                        "summary": f"Exciting experiences, landmarks and local tastes on Day {d}.",
                        "items": [
                            {"time_slot": "Morning", "title": f"Arrival & Landmark Tour", "description": "Visit iconic monuments and scenic spots.", "category": "Sightseeing", "estimated_cost": 500.0},
                            {"time_slot": "Afternoon", "title": "Authentic Cuisine & Markets", "description": "Savor authentic regional flavors and browse local crafts.", "category": "Food", "estimated_cost": 600.0},
                            {"time_slot": "Evening", "title": "Cultural Stroll & Sunset View", "description": "Relax and take in the panoramic sunset vistas.", "category": "Activity", "estimated_cost": 300.0},
                        ]
                    } for d in range(1, req.days + 1)
                ],
                "budget_breakdown": {
                    "stay": req.budget * 0.35,
                    "food": req.budget * 0.25,
                    "activities": req.budget * 0.20,
                    "local_travel": req.budget * 0.10,
                    "flights": req.budget * 0.10,
                    "total": req.budget
                }
            }

    # Match destination in DB if present
    dest_record = db.execute(
        select(Destination).where(Destination.name.ilike(f"%{req.destination}%"))
    ).scalar_one_or_none()

    # Create Trip
    new_trip = Trip(
        user_id=current_user.id,
        destination_id=dest_record.id if dest_record else None,
        title=itinerary_data.get("title", f"Trip to {req.destination}"),
        start_date=req.start_date or date.today(),
        days=req.days,
        travellers=req.travellers,
        budget=req.budget,
        trip_type=req.trip_type,
        interests=req.interests,
        total_estimated_cost=itinerary_data.get("budget_breakdown", {}).get("total", req.budget),
        status="planned",
    )
    db.add(new_trip)
    db.flush()

    # Save Days and Items
    for day_info in itinerary_data.get("days", []):
        day_record = ItineraryDay(
            trip_id=new_trip.id,
            day_number=day_info.get("day_number", 1),
            title=day_info.get("title", f"Day {day_info.get('day_number', 1)}"),
            summary=day_info.get("summary", ""),
        )
        db.add(day_record)
        db.flush()

        for idx, item_info in enumerate(day_info.get("items", [])):
            item_record = ItineraryItem(
                day_id=day_record.id,
                time_slot=item_info.get("time_slot", "Morning"),
                title=item_info.get("title", "Activity"),
                description=item_info.get("description", ""),
                category=item_info.get("category", "Activity"),
                estimated_cost=float(item_info.get("estimated_cost", 0.0)),
                position=idx,
            )
            db.add(item_record)

    db.commit()
    db.refresh(new_trip)
    return new_trip


@router.get("", response_model=List[TripResponse])
def get_user_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all trips belonging to current user."""
    trips = db.execute(
        select(Trip)
        .where(Trip.user_id == current_user.id)
        .order_by(Trip.created_at.desc())
    ).scalars().all()
    return trips


@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve a single trip by ID."""
    trip = db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    ).scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a user trip."""
    trip = db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    ).scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    db.delete(trip)
    db.commit()
    return None


@router.post("/{trip_id}/regenerate-day/{day_number}", response_model=ItineraryDayResponse)
async def regenerate_day(
    trip_id: int,
    day_number: int,
    req: DayRegenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Regenerate a specific day of an itinerary with AI."""
    trip = db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    ).scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    day = db.execute(
        select(ItineraryDay).where(ItineraryDay.trip_id == trip.id, ItineraryDay.day_number == day_number)
    ).scalar_one_or_none()
    if not day:
        raise HTTPException(status_code=404, detail="Day not found")

    # Call AI
    prompt = REGENERATE_DAY_PROMPT.format(
        day_number=day_number,
        destination=trip.title,
        trip_title=trip.title,
        budget=trip.budget,
        interests=", ".join(req.interests or trip.interests or ["Sightseeing"]),
    )
    try:
        new_day_data = await llm_service.generate_json(
            system_prompt="You are TripGenie. Regenerate a single day with fresh activities in JSON format.",
            user_prompt=prompt,
        )
    except Exception as e:
        logger.exception("AI day regeneration failed: %s", e)
        new_day_data = {
            "day_number": day_number,
            "title": f"Fresh Adventure in {trip.title} - Day {day_number}",
            "summary": "Alternative highlights and hidden gems.",
            "items": [
                {"time_slot": "Morning", "title": "Hidden Gem Exploration", "description": "Peaceful early morning stroll off the beaten path.", "category": "Sightseeing", "estimated_cost": 400.0},
                {"time_slot": "Afternoon", "title": "Artisan Craft & Culinary Tour", "description": "Hands-on experience and local treats.", "category": "Food", "estimated_cost": 500.0},
                {"time_slot": "Evening", "title": "Twilight Skyline Experience", "description": "Breathtaking twilight city or nature views.", "category": "Activity", "estimated_cost": 300.0},
            ]
        }

    # Update day title and summary
    day.title = new_day_data.get("title", day.title)
    day.summary = new_day_data.get("summary", day.summary)

    # Delete old items
    for item in list(day.items):
        db.delete(item)
    db.flush()

    # Insert new items
    for idx, item_info in enumerate(new_day_data.get("items", [])):
        item_record = ItineraryItem(
            day_id=day.id,
            time_slot=item_info.get("time_slot", "Morning"),
            title=item_info.get("title", "Activity"),
            description=item_info.get("description", ""),
            category=item_info.get("category", "Activity"),
            estimated_cost=float(item_info.get("estimated_cost", 0.0)),
            position=idx,
        )
        db.add(item_record)

    db.commit()
    db.refresh(day)
    return day
