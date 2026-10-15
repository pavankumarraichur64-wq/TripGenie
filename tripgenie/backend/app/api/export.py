"""
TripGenie — PDF Export Router
Generates a downloadable PDF itinerary using ReportLab.
"""
import io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import select

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from app.db.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.trip import Trip

router = APIRouter(prefix="/trips", tags=["Export"])


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
    story.append(Paragraph(f"TripGenie — {trip.title}", title_style))
    story.append(Spacer(1, 10))

    meta_text = f"<b>Days:</b> {trip.days} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Travellers:</b> {trip.travellers} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Budget:</b> ₹{trip.budget:,.2f} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Type:</b> {trip.trip_type.capitalize()}"
    story.append(Paragraph(meta_text, body_style))
    story.append(Spacer(1, 15))

    # Day-by-Day Plan
    for day in trip.itinerary_days:
        story.append(Paragraph(f"Day {day.day_number}: {day.title}", h2_style))
        if day.summary:
            story.append(Paragraph(f"<i>{day.summary}</i>", body_style))
        story.append(Spacer(1, 8))

        # Activities Table
        table_data = [["Time Slot", "Activity", "Category", "Est. Cost"]]
        for item in day.items:
            table_data.append([
                item.time_slot,
                item.title,
                item.category,
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
