"""
TripGenie — Auth Pydantic Schemas
Request bodies and response models for the authentication endpoints.
"""
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ── Register ──────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, examples=["Ranjit Kumar"])
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100, examples=["MyPass@123"])


# ── Login ─────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Token response ────────────────────────────────────────────────────────────
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


# ── User output (safe — no password_hash) ─────────────────────────────────────
class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


# Resolve forward reference
TokenResponse.model_rebuild()
