"""
TripGenie - Database Seed Script
Run once to populate MySQL with:
  - 10 destinations (scraped from Wikipedia + static fallback)
  - 50 hotels (curated realistic dataset)
  - 120+ flights (generated across 90 days from route templates)
  - 1 admin user  (admin@tripgenie.com / Admin@123)
  - 1 demo user   (demo@tripgenie.com  / Demo@123)

Usage:
  cd backend
  python seed.py

Flags:
  --no-scrape    Skip Wikipedia scraping, use static fallback only
"""
import argparse
import sys
from pathlib import Path

# Ensure the backend/ directory is on the path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db.database import Base, engine, SessionLocal
from app.models import (  # noqa: F401 - imports needed for Base.metadata
    User, Destination, Hotel, Flight, Trip, ItineraryDay,
    ItineraryItem, Booking, ChatMessage, AICache,
)
from app.scraper.destination_scraper import get_destinations_data
from app.scraper.hotel_scraper import get_hotels_data
from app.scraper.flight_scraper import get_flights_data


def create_tables() -> None:
    """Create all tables using SQLAlchemy metadata (mirrors Alembic for quick seeding)."""
    print("[seed] Creating database tables…")
    Base.metadata.create_all(bind=engine)
    print("[seed] [OK] Tables ready.")


def seed_destinations(db: Session, scrape: bool) -> dict[str, int]:
    """Seed destinations and return a name→id mapping."""
    print("\n[seed] Seeding destinations…")
    data = get_destinations_data(scrape=scrape)
    name_to_id: dict[str, int] = {}

    for d in data:
        existing = db.query(Destination).filter(Destination.name == d["name"]).first()
        if existing:
            name_to_id[d["name"]] = existing.id
            print(f"  [skip] Destination already exists: {d['name']}")
            continue

        dest = Destination(
            name=d["name"],
            country=d["country"],
            description=d.get("description", ""),
            best_season=d.get("best_season", ""),
            image_url=d.get("image_url", ""),
            avg_daily_cost=d.get("avg_daily_cost", 2000.0),
        )
        db.add(dest)
        db.flush()  # Get the id before commit
        name_to_id[d["name"]] = dest.id
        print(f"  [[OK]] Seeded destination: {d['name']}")

    db.commit()
    print(f"[seed] [OK] {len(name_to_id)} destinations ready.")
    return name_to_id


def seed_hotels(db: Session, dest_map: dict[str, int]) -> None:
    """Seed hotels linked to their destination by name."""
    print("\n[seed] Seeding hotels…")
    data = get_hotels_data()
    count = 0

    for h in data:
        dest_name = h.get("destination_name", "")
        dest_id = dest_map.get(dest_name)
        if not dest_id:
            print(f"  [skip] Unknown destination for hotel: {h['name']} ({dest_name})")
            continue

        existing = db.query(Hotel).filter(
            Hotel.name == h["name"], Hotel.destination_id == dest_id
        ).first()
        if existing:
            continue

        hotel = Hotel(
            destination_id=dest_id,
            name=h["name"],
            stars=h.get("stars", 3),
            rating=h.get("rating", 4.0),
            price_per_night=h.get("price_per_night", 3000),
            amenities=h.get("amenities", []),
            image_url=h.get("image_url", ""),
            address=h.get("address", ""),
        )
        db.add(hotel)
        count += 1

    db.commit()
    print(f"[seed] [OK] {count} hotels seeded.")


def seed_flights(db: Session) -> None:
    """Seed flights across next 90 days from route templates."""
    print("\n[seed] Seeding flights…")
    # Clear existing flights to avoid duplicates on re-seed
    existing_count = db.query(Flight).count()
    if existing_count > 0:
        print(f"  [skip] {existing_count} flights already exist. Delete them to re-seed.")
        return

    data = get_flights_data()
    for f in data:
        from datetime import datetime
        flight = Flight(
            airline=f["airline"],
            flight_no=f["flight_no"],
            origin=f["origin"],
            destination=f["destination"],
            depart_time=datetime.strptime(f["depart_time"], "%Y-%m-%d %H:%M:%S"),
            arrive_time=datetime.strptime(f["arrive_time"], "%Y-%m-%d %H:%M:%S"),
            duration_min=f["duration_min"],
            price=f["price"],
            seat_class=f["seat_class"],
            seats_available=f["seats_available"],
        )
        db.add(flight)

    db.commit()
    print(f"[seed] [OK] {len(data)} flights seeded.")


def seed_users(db: Session) -> None:
    """Seed admin and demo users."""
    print("\n[seed] Seeding users…")
    users_to_create = [
        {
            "name": "TripGenie Admin",
            "email": "admin@tripgenie.com",
            "password": "Admin@123",
            "role": "admin",
        },
        {
            "name": "Demo User",
            "email": "demo@tripgenie.com",
            "password": "Demo@123",
            "role": "user",
        },
    ]

    for u in users_to_create:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if existing:
            print(f"  [skip] User already exists: {u['email']}")
            continue
        user = User(
            name=u["name"],
            email=u["email"],
            password_hash=hash_password(u["password"]),
            role=u["role"],
        )
        db.add(user)
        print(f"  [[OK]] Created user: {u['email']} (role={u['role']})")

    db.commit()
    print("[seed] [OK] Users ready.")


def main() -> None:
    parser = argparse.ArgumentParser(description="TripGenie database seeder")
    parser.add_argument(
        "--no-scrape",
        action="store_true",
        help="Skip Wikipedia scraping; use static fallback data only.",
    )
    args = parser.parse_args()

    scrape = settings.SCRAPE_ON_SEED and not args.no_scrape
    print("=" * 60)
    print("  TripGenie - Database Seeder")
    print(f"  Database : {settings.DATABASE_URL.split('@')[-1]}")
    print(f"  Scraping : {'Yes (Wikipedia)' if scrape else 'No (static fallback)'}")
    print("=" * 60)

    create_tables()

    db: Session = SessionLocal()
    try:
        dest_map = seed_destinations(db, scrape=scrape)
        seed_hotels(db, dest_map)
        seed_flights(db)
        seed_users(db)

        print("\n" + "=" * 60)
        print("  [SUCCESS] Seeding complete!")
        print("  Admin login : admin@tripgenie.com / Admin@123")
        print("  Demo login  : demo@tripgenie.com  / Demo@123")
        print("=" * 60)
    finally:
        db.close()


if __name__ == "__main__":
    main()
