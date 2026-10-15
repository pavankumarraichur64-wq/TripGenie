"""
TripGenie — AI Cache Model
Caches LLM responses keyed by SHA-256 hash of the prompt + inputs.
Prevents duplicate API calls for identical requests.
"""
from datetime import datetime

from sqlalchemy import DateTime, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class AICache(Base):
    __tablename__ = "ai_cache"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    # SHA-256 hex digest of (provider + model + system_prompt + user_prompt)
    prompt_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    # Full LLM response stored as JSON
    response: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"<AICache hash={self.prompt_hash[:8]}…>"
