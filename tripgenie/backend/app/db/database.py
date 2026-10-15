"""
TripGenie — Database Engine & Session Factory
Supports both SQLite (for zero-config instant portability) and MySQL 8.0.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

# Determine database dialect
is_sqlite = settings.DATABASE_URL.startswith("sqlite")

engine_kwargs = {
    "echo": False,
}

if is_sqlite:
    # SQLite requires check_same_thread=False for multi-threaded FastAPI workers
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # MySQL / Postgres connection pooling
    engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_size": 5,
        "max_overflow": 10,
    })

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """All ORM models inherit from this base class."""
    pass


def get_db():
    """Dependency for obtaining a SQLAlchemy session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
