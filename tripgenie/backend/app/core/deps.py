"""
TripGenie — FastAPI Dependencies
Re-usable dependency-injection helpers (DB session, current user, admin guard).
"""
from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.database import SessionLocal
from app.models.user import User

bearer_scheme = HTTPBearer()


# ── Database session ──────────────────────────────────────────────────────────
def get_db() -> Generator[Session, None, None]:
    """Yield a SQLAlchemy session and guarantee it closes after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Current authenticated user ────────────────────────────────────────────────
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Decode the Bearer JWT from the Authorization header.
    Raises 401 if the token is missing, invalid, or the user does not exist.
    """
    token = credentials.credentials
    email = decode_access_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


# ── Admin guard ───────────────────────────────────────────────────────────────
def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Raise 403 if the authenticated user is not an admin."""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user
