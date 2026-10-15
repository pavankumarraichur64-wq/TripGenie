"""
TripGenie — LLM Service (Groq with LLaMA 3.1)
Provider-agnostic interface with Groq implementation using JSON mode.
"""
import json
import logging
from typing import Optional, Dict, Any, List

from groq import Groq
from app.core.config import settings

logger = logging.getLogger(__name__)


class LLMService:
    """Service wrapper for calling LLM models (default: Groq LLaMA 3.1)."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.GROQ_API_KEY
        self.model = model or settings.GROQ_MODEL
        if not self.api_key:
            logger.warning("GROQ_API_KEY is not set. Real AI generation will fail without an API key.")
        self.client = Groq(api_key=self.api_key) if self.api_key else None

    async def generate_json(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        """Calls Groq with forced JSON mode and parses the result."""
        if not self.client:
            raise ValueError("GROQ_API_KEY is not configured in .env. Please add GROQ_API_KEY to test AI generation.")

        completion = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            response_format={"type": "json_object"},
        )
        raw_content = completion.choices[0].message.content
        return json.loads(raw_content)

    async def chat(self, system_prompt: str, messages: List[dict]) -> Dict[str, Any]:
        """Multi-turn conversational response with JSON format."""
        if not self.client:
            raise ValueError("GROQ_API_KEY is not configured in .env")

        full_messages = [{"role": "system", "content": system_prompt}] + messages
        completion = self.client.chat.completions.create(
            model=self.model,
            messages=full_messages,
            temperature=0.7,
            response_format={"type": "json_object"},
        )
        raw_content = completion.choices[0].message.content
        return json.loads(raw_content)


llm_service = LLMService()
