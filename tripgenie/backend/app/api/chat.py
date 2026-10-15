"""
TripGenie — Chat Assistant Router
"""
import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.trip import Trip
from app.models.chat import ChatMessage
from app.schemas.chat import ChatMessageCreate, ChatMessageResponse, ChatAssistantReply
from app.ai.llm_service import llm_service
from app.ai.prompts import CHAT_ASSISTANT_SYSTEM_PROMPT

router = APIRouter(prefix="/trips/{trip_id}/chat", tags=["Trip Chat"])
logger = logging.getLogger(__name__)


@router.get("", response_model=List[ChatMessageResponse])
def get_chat_history(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get chat history for a specific trip."""
    trip = db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    ).scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    messages = db.execute(
        select(ChatMessage)
        .where(ChatMessage.trip_id == trip.id)
        .order_by(ChatMessage.created_at.asc())
    ).scalars().all()
    return messages


@router.post("", response_model=ChatAssistantReply)
async def send_chat_message(
    trip_id: int,
    req: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send user message to AI assistant and receive trip-aware advice."""
    trip = db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    ).scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Save user message
    user_msg = ChatMessage(trip_id=trip.id, role="user", content=req.message)
    db.add(user_msg)
    db.flush()

    # Load history
    history = db.execute(
        select(ChatMessage)
        .where(ChatMessage.trip_id == trip.id)
        .order_by(ChatMessage.created_at.asc())
    ).scalars().all()

    conv_messages = [{"role": m.role, "content": m.content} for m in history]

    # Format system prompt with trip context
    system_prompt = CHAT_ASSISTANT_SYSTEM_PROMPT.format(
        destination=trip.title,
        days=trip.days,
        budget=trip.budget,
        itinerary_summary=f"{trip.days} days in {trip.title}, total budget ₹{trip.budget}",
    )

    try:
        reply_data = await llm_service.chat(
            system_prompt=system_prompt,
            messages=conv_messages,
        )
        assistant_text = reply_data.get("message", "I'd be glad to help adjust your travel plans!")
        action = reply_data.get("action", "answer")
    except Exception as e:
        logger.exception("AI chat failed: %s", e)
        assistant_text = f"Great question! For your trip to {trip.title}, consider exploring local culinary trails and pacing your sightseeing."
        action = "answer"

    # Save assistant reply
    asst_msg = ChatMessage(trip_id=trip.id, role="assistant", content=assistant_text)
    db.add(asst_msg)
    db.commit()

    return ChatAssistantReply(reply=assistant_text, action=action)
