"""
TripGenie — FastAPI Application Entry Point
Configures CORS, mounts all API routes, and provides startup/shutdown hooks.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings

app = FastAPI(
    title="TripGenie API",
    description="AI-powered trip planner — backend REST API",
    version="1.0.0",
    docs_url="/docs",       # Swagger UI at /docs
    redoc_url="/redoc",     # ReDoc at /redoc
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow only the configured frontend origin (default: http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount API router ──────────────────────────────────────────────────────────
app.include_router(api_router)


@app.get("/", tags=["Health"])
def health_check():
    """Simple health-check endpoint. Returns 200 OK if the server is running."""
    return {"status": "ok", "app": "TripGenie API", "version": "1.0.0"}
