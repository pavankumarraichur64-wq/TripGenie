"""
TripGenie — Hotels Search Router
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.db.database import get_db
from app.models.hotel import Hotel
from app.models.destination import Destination
from app.schemas.hotel import HotelListResponse, HotelResponse

router = APIRouter(prefix="/hotels", tags=["Hotels"])


@router.get("", response_model=HotelListResponse)
def search_hotels(
    destination: Optional[str] = Query(None, description="City or destination name"),
    destination_id: Optional[int] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    stars: Optional[int] = Query(None),
    sort: Optional[str] = Query("price_asc", regex="^(price_asc|price_desc|rating_desc)$"),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Search and filter hotels by destination, price, stars, and rating."""
    query = select(Hotel)

    if destination_id:
        query = query.where(Hotel.destination_id == destination_id)
    elif destination:
        dest = db.execute(
            select(Destination).where(Destination.name.ilike(f"%{destination}%"))
        ).scalar_one_or_none()
        if dest:
            query = query.where(Hotel.destination_id == dest.id)
        else:
            query = query.where(Hotel.name.ilike(f"%{destination}%"))

    if min_price is not None:
        query = query.where(Hotel.price_per_night >= min_price)
    if max_price is not None:
        query = query.where(Hotel.price_per_night <= max_price)
    if stars is not None:
        query = query.where(Hotel.stars >= stars)

    # Sorting
    if sort == "price_asc":
        query = query.order_by(Hotel.price_per_night.asc())
    elif sort == "price_desc":
        query = query.order_by(Hotel.price_per_night.desc())
    elif sort == "rating_desc":
        query = query.order_by(Hotel.rating.desc())

    # Total count
    count_query = select(func.count()).select_from(query.subquery())
    total = db.execute(count_query).scalar_one()

    # Pagination
    items = db.execute(
        query.offset((page - 1) * per_page).limit(per_page)
    ).scalars().all()

    return HotelListResponse(
        total=total,
        page=page,
        per_page=per_page,
        items=items,
    )


@router.get("/{hotel_id}", response_model=HotelResponse)
def get_hotel(hotel_id: int, db: Session = Depends(get_db)):
    """Get single hotel details."""
    hotel = db.execute(select(Hotel).where(Hotel.id == hotel_id)).scalar_one_or_none()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return hotel
