"""
TripGenie — PDF Export Router
Generates a downloadable PDF itinerary using ReportLab.
"""
import io
import logging
from urllib.parse import urlparse
from xml.sax.saxutils import escape

import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import select

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from app.db.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.trip import Trip
from app.models.destination import Destination
from app.services.place_enrichment import enrich_trip

router = APIRouter(prefix="/trips", tags=["Export"])
logger = logging.getLogger(__name__)


def _download_destination_photo(url: str | None) -> bytes | None:
    if not url:
        return None

    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.hostname != "upload.wikimedia.org":
        return None

    try:
        response = httpx.get(url, timeout=4.0, follow_redirects=False)
        response.raise_for_status()
        if not response.headers.get("content-type", "").startswith("image/"):
            logger.warning("Skipping non-image destination photo URL.")
            return None
        if len(response.content) > 5 * 1024 * 1024:
            logger.warning("Skipping destination photo larger than 5 MB.")
            return None
        return response.content
    except httpx.HTTPError:
        logger.warning("Could not load destination photo for PDF export.")
        return None


@router.get("/{trip_id}/export")
def export_trip_pdf(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate and return a beautifully formatted PDF itinerary."""
    trip = db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    ).scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    destination = db.get(Destination, trip.destination_id) if trip.destination_id else None
    enriched_trip = enrich_trip(trip, destination)
    photo_bytes = _download_destination_photo(destination.image_url if destination else None)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#0D7377"),
    )
    h2_style = ParagraphStyle(
        "H2",
        parent=styles["Heading2"],
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#14213D"),
    )
    body_style = styles["Normal"]

    story = []

    # Title & Subtitle
    story.append(Paragraph(f"TripGenie — {escape(trip.title)}", title_style))
    story.append(Spacer(1, 10))

    meta_text = f"<b>Days:</b> {trip.days} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Travellers:</b> {trip.travellers} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Budget:</b> ₹{trip.budget:,.2f} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Type:</b> {escape(trip.trip_type.capitalize())}"
    story.append(Paragraph(meta_text, body_style))
    story.append(Spacer(1, 15))

    # Day-by-Day Plan
    for day in enriched_trip.itinerary_days:
        story.append(Paragraph(f"Day {day.day_number}: {escape(day.title)}", h2_style))
        if day.summary:
            story.append(Paragraph(f"<i>{escape(day.summary)}</i>", body_style))
        story.append(Spacer(1, 8))

        place_rows = [["Photo", "Place / activity", "Approx. GPS"]]
        for item in day.items:
            photo = (
                Image(io.BytesIO(photo_bytes), width=54, height=38)
                if photo_bytes
                else Paragraph("Photo unavailable", body_style)
            )
            coordinates = (
                f"{item.latitude:.5f}, {item.longitude:.5f}"
                if item.latitude is not None and item.longitude is not None
                else "Not available"
            )
            place_rows.append([
                photo,
                Paragraph(escape(item.place_name or item.title), body_style),
                Paragraph(coordinates, body_style),
            ])

        places_table = Table(place_rows, colWidths=[60, 355, 125], repeatRows=1)
        places_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0D7377")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(Paragraph("Places and approximate locations", h2_style))
        story.append(places_table)
        if photo_bytes and destination:
            source_url = escape(destination.image_url or "", {'"': "&quot;"})
            story.append(Paragraph(
                f'Photo source: <link href="{source_url}" color="#0D7377">'
                "Wikimedia Commons</link>. This is a destination-level illustration, "
                "not a venue-specific photo.",
                body_style,
            ))
        story.append(Paragraph(
            "Map pins and coordinates are demo estimates, not turn-by-turn directions. "
            "Confirm place locations before travel.",
            body_style,
        ))
        story.append(Spacer(1, 10))

        # Activities Table
        table_data = [["Time Slot", "Activity", "Category", "Est. Cost"]]
        for item in day.items:
            table_data.append([
                item.time_slot,
                escape(item.title),
                escape(item.category or ""),
                f"₹{item.estimated_cost:,.2f}"
            ])

        t = Table(table_data, colWidths=[80, 260, 100, 80])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0D7377")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#F8F9FA")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(t)
        story.append(Spacer(1, 15))

    doc.build(story)
    buffer.seek(0)
    pdf_bytes = buffer.getvalue()

    filename = f"TripGenie_{trip.title.replace(' ', '_')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
