"""
TripGenie — Application Configuration
Loads all settings from the .env file via pydantic-settings.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./tripgenie.db"

    # ── Security ──────────────────────────────────────────────────────────────
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # ── AI / LLM ──────────────────────────────────────────────────────────────
    LLM_PROVIDER: str = "groq"                       # "groq" | "openai" | "gemini"
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-120b"

    # ── CORS ──────────────────────────────────────────────────────────────────
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # ── Rate limiting ─────────────────────────────────────────────────────────
    AI_RATE_LIMIT: str = "10/minute"

    # ── Seeding ───────────────────────────────────────────────────────────────
    SCRAPE_ON_SEED: bool = True   # Set False to use static fallback only

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


# Singleton — import this everywhere
settings = Settings()
