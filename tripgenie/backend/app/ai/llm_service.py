
import json
import logging
from typing import Optional, Dict, Any, List

from groq import Groq

from app.core.config import settings

logger = logging.getLogger(__name__)


class LLMService:
    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
    ):
        self.api_key = api_key or settings.GROQ_API_KEY
        self.model = model or settings.GROQ_MODEL

        if not self.api_key:
            logger.warning(
                "GROQ_API_KEY is not configured. AI features will not work."
            )
            self.client = None
        else:
            self.client = Groq(api_key=self.api_key)

    def _parse_json(self, raw_content: Optional[str]) -> Dict[str, Any]:
        """Parse and validate JSON returned by the AI."""
        if not raw_content:
            raise ValueError("The AI returned an empty response.")

        try:
            data = json.loads(raw_content)
        except json.JSONDecodeError as exc:
            logger.error("Failed to parse AI JSON response: %s", exc)
            raise ValueError(
                "The AI returned invalid JSON. Please try generating the trip again."
            ) from exc

        if not isinstance(data, dict):
            raise ValueError("The AI response must be a JSON object.")

        return data

    
    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> Dict[str, Any]:
        """Generate and validate a JSON object using Groq."""
        if not self.client:
            raise ValueError(
                "GROQ_API_KEY is not configured. "
                "Add it to your backend .env file."
            )

        try:
            # Groq JSON mode requires an explicit JSON instruction.
            json_system_prompt = (
                system_prompt.strip()
                + "\n\nIMPORTANT OUTPUT RULES:\n"
                + "Return exactly one valid JSON object.\n"
                + "The response must use JSON format.\n"
                + "Do not include Markdown, code fences, or explanations.\n"
                + "Use double quotes for JSON keys and string values.\n"
                + "Do not include trailing commas or comments.\n"
                + "Ensure the JSON object is complete and valid."
            )

            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": json_system_prompt,
                    },
                    {
                        "role": "user",
                        "content": (
                            user_prompt.strip()
                            + "\n\nReturn the result as a valid JSON object."
                        ),
                    },
                ],
                temperature=0.2,
                max_tokens=8192,
                response_format={"type": "json_object"},
            )

            if not completion.choices:
                raise ValueError("Groq returned no completion choices.")

            choice = completion.choices[0]

            if choice.finish_reason == "length":
                raise ValueError(
                    "The AI itinerary was too long. Reduce the trip duration "
                    "or shorten the itinerary prompt and try again."
                )

            raw_content = choice.message.content

            if not raw_content:
                raise ValueError(
                    "Groq returned an empty response. Please try again."
                )

            return self._parse_json(raw_content)

        except Exception:
            logger.exception(
                "Groq JSON generation failed. Configured model: %s",
                self.model,
            )
            raise


    async def chat(
        self,
        system_prompt: str,
        messages: List[Dict[str, Any]],
    ) -> str:
        """Generate a chat response using Groq."""
        if not self.client:
            raise ValueError(
                "GROQ_API_KEY is not configured. Add it to your backend .env file."
            )

        try:
            chat_messages = [
                {
                    "role": "system",
                    "content": system_prompt,
                }
            ]

            chat_messages.extend(messages)

            completion = self.client.chat.completions.create(
                model=self.model,
                messages=chat_messages,
                temperature=0.3,
                max_tokens=4096,
            )

            choice = completion.choices[0]

            if choice.finish_reason == "length":
                logger.warning("Groq chat response reached the token limit.")

            content = choice.message.content

            if not content:
                raise ValueError("The AI returned an empty chat response.")

            return content

        except Exception:
            logger.exception("Groq chat generation failed")
            raise


llm_service = LLMService()
