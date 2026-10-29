"""Check Groq API authentication and configured-model availability."""
import sys

from groq import APIConnectionError, APIStatusError, AuthenticationError, Groq, RateLimitError

from app.core.config import settings


def main() -> int:
    provider = settings.LLM_PROVIDER.strip().casefold()
    if provider != "groq":
        print(f"[AI CHECK] Unsupported provider configured: {settings.LLM_PROVIDER}.")
        print("[AI CHECK] This backend currently supports the Groq provider.")
        return 1

    api_key = settings.GROQ_API_KEY.strip()
    if not api_key:
        print("[AI CHECK] GROQ_API_KEY is missing from backend\\.env.")
        print("[AI CHECK] Backend will start; AI features will use their fallback behavior.")
        return 1

    print("[AI CHECK] Contacting Groq and checking configured model access...")
    try:
        client = Groq(api_key=api_key, timeout=8.0, max_retries=0)
        models = client.models.list()
    except AuthenticationError:
        print("[AI CHECK] Groq rejected the API key (401). Check or replace GROQ_API_KEY.")
        return 1
    except RateLimitError:
        print("[AI CHECK] Groq is reachable, but the account is rate-limited (429).")
        return 1
    except APIConnectionError:
        print("[AI CHECK] Could not connect to Groq. Check the network and try again.")
        return 1
    except APIStatusError as error:
        print(f"[AI CHECK] Groq returned HTTP {error.status_code}; AI is not ready.")
        return 1

    available_models = {model.id for model in models.data}
    if settings.GROQ_MODEL not in available_models:
        print("[AI CHECK] API key is accepted, but the configured model was not returned by Groq.")
        print(f"[AI CHECK] Configured model: {settings.GROQ_MODEL}")
        return 1

    print("[AI CHECK] Groq API key is responsive; configured model is available.")
    print(f"[AI CHECK] Model: {settings.GROQ_MODEL}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
