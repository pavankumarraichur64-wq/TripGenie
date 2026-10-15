# TripGenie

**AI-assisted travel itinerary planner and booking simulator**

TripGenie turns trip preferences into a day-by-day itinerary, lets travelers browse seeded hotel and flight data, and supports simulated reservations. It is a full-stack academic project, not a live travel-booking service.

## Features

- AI itinerary generation, day regeneration, and trip-aware chat through Groq; a fallback itinerary is available when AI is not configured or unavailable.
- Daily activity schedules with estimated INR costs and a budget breakdown.
- Destination, hotel, and flight browsing backed by seeded data.
- Simulated hotel/flight reservations and booking references; no real payment or booking provider is connected.
- Authenticated PDF itinerary export.
- Traveler trip management and an admin dashboard.
- SQLite and MySQL are supported. The provided `.env.example` uses MySQL; change `DATABASE_URL` to `sqlite:///./tripgenie.db` if you prefer SQLite.

## Technology

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Python, FastAPI, SQLAlchemy, Alembic
- **AI:** Groq API (configure the model with `GROQ_MODEL`)
- **PDF:** ReportLab
- **Database:** SQLite or MySQL

## Requirements

- Python 3.11 or 3.12 recommended
- Node.js LTS and npm
- A running MySQL server if you keep the MySQL URL in `.env.example`; SQLite needs no separate server
- For AI-generated itineraries and chat: a Groq API key

## Quick start on Windows

Run or double-click `run.bat` from this folder. The launcher prepares the backend virtual environment and dependencies when needed, seeds the database if it does not exist, and starts the API and Vite development server.

The launcher copies `.env.example` to `backend\.env` when that file is missing. The example is configured for MySQL, so start MySQL and update its connection details in `backend\.env`, or change `DATABASE_URL` to `sqlite:///./tripgenie.db` to use SQLite. Set `GROQ_API_KEY` before using live AI features. Keep credentials in `.env` files only; never commit them.

The default local URLs are:

- Frontend: <http://localhost:5173>
- API: <http://127.0.0.1:8000>
- Interactive API docs: <http://127.0.0.1:8000/docs>

## Manual setup

Open two terminals from this folder.

### Backend (Terminal 1)

```powershell
cd backend
py -3.12 -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
if (-not (Test-Path .env)) { Copy-Item ..\.env.example .env }
```

Edit `backend\.env` to set up MySQL or switch `DATABASE_URL` to `sqlite:///./tripgenie.db`. Add `GROQ_API_KEY` to enable live AI features. Then seed the demo data and start the API:

```powershell
python seed.py --no-scrape
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

If using Command Prompt rather than PowerShell, activate with `venv\Scripts\activate.bat`.

### Frontend (Terminal 2)

```powershell
cd frontend
npm ci
npm run dev
```

Open <http://localhost:5173>.

## Demo accounts

The seed script creates the following local demo accounts:

| Role | Email | Password |
| --- | --- | --- |
| Traveler | `demo@tripgenie.com` | `Demo@123` |
| Admin | `admin@tripgenie.com` | `Admin@123` |

These fixed credentials are for local demonstration only. Do not use them in a deployed environment.

## Project layout

```text
backend/       FastAPI application, seed script, and migrations
frontend/      React and TypeScript application
docs/          API, database, and demonstration documentation
run.bat        Windows development launcher
run_demo.bat   Optional launcher for a built frontend
```

## Documentation

- [API specification](docs/api_list.md)
- [Database ER diagram](docs/er_diagram.md)
- [Demonstration checklist](docs/test_checklist.md)

## Notes

- Hotel and flight listings are seeded sample data. Reservations and payments are simulated.
- `run_demo.bat` is an optional production-style launcher; run the main setup first and build the frontend with `npm run build`.
- SQLite database files, virtual environments, dependency directories, build outputs, caches, and secrets are local-only and excluded by `.gitignore`.
