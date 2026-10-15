# TripGenie — Viva & Demonstration Checklist

Use this checklist to run a complete, flawless viva demonstration for college project evaluation.

- [ ] **1. One-Click Launch**: Double-click `run.bat` and verify both backend (port 8000) and frontend (port 5173) start up cleanly.
- [ ] **2. Landing Page**: Open `http://localhost:5173` and observe modern responsive design, feature grid, and destination showcase.
- [ ] **3. Authentication**:
  - Test registration with a new account.
  - Test quick one-click demo login buttons (`Demo Traveler` or `Admin User`).
- [ ] **4. AI Trip Generation**:
  - Go to `Plan Trip`.
  - Enter Destination: `Jaipur`, Budget: `₹20,000`, Days: `3`, Interests: `Sightseeing, Local Food`.
  - Click `Generate Itinerary` and observe loading indicator transition to day-by-day itinerary.
- [ ] **5. Dynamic Day Regeneration**:
  - On the Itinerary page, click `Regenerate` on Day 2.
  - Verify that Day 2 updates with fresh activities and updated estimated costs.
- [ ] **6. In-Trip AI Assistant Chat**:
  - Click `AI Assistant` in the top banner.
  - Ask: *"Suggest a popular sweet shop near our afternoon spot"* or *"Make Day 3 more relaxed"*.
  - Verify AI assistant answers with trip context.
- [ ] **7. PDF Export**:
  - Click `Download PDF` on the Itinerary page.
  - Verify a branded, formatted PDF itinerary opens/downloads with tables and budget summary.
- [ ] **8. Hotel Search & Booking**:
  - Go to `Hotels`, filter by destination and star rating.
  - Click `Reserve`, fill the test guest form, and confirm booking.
  - Verify the unique reference format: `TG-YYYYMMDD-XXXX`.
- [ ] **9. Flight Search & Booking**:
  - Go to `Flights`, filter by origin and destination.
  - Book a flight and verify receipt.
- [ ] **10. My Trips Dashboard**:
  - Navigate to `My Trips`.
  - Verify both the planned itinerary and confirmed bookings appear in the dashboard.
- [ ] **11. Admin Panel**:
  - Sign in as `admin@tripgenie.com` / `Admin@123`.
  - Visit `/admin` and demonstrate the system statistics cards (Total Users, Trips, Revenue, Bookings) and real-time transaction table.
