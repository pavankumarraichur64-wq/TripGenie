"""Chat schemas."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class ChatMessageCreate(BaseModel):
    message: str


class ChatMessageResponse(BaseModel):
    id: int
    trip_id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatAssistantReply(BaseModel):
    reply: str
    action: str = "answer"
