# TripGenie

AI-assisted trip planning with a React frontend and FastAPI backend. TripGenie creates itineraries, shows map and place-photo lookups, and includes sample flight and hotel listings with a simulated checkout. It is a local development/demo project, not a live travel booking service.

## Features

- Generate and manage day-by-day trip itineraries; Groq can provide AI responses when configured and reachable.
- Check Groq API authentication and configured-model availability in the backend terminal at startup. The check lists available models; it does not generate a response or print the API key.
- Display an OpenStreetMap centered on the selected destination. Look up itinerary activities individually for map coordinates and possible Wikimedia Commons photos, with available license/artist details.
- Browse seeded demo destinations, hotels, and flights. Prices, schedules, and availability are illustrative, not live.
- View approximate local-transport fare estimates, trip budgets, and itinerary photos; export a trip to PDF.
- Register, sign in, manage trips, and use the admin dashboard.
- Use SQLite locally by default, or configure MySQL in `tripgenie\backend\.env`.

## Requirements

- Windows 10/11
- Python 3.13 and the Python Launcher (`py`)
- Node.js LTS and npm
- Internet access for package installation and optional Groq, Photon, Wikimedia Commons, and map-tile requests
- A Groq API key for live AI itinerary and chat responses; the rest of the app can run without it

## Quick start (Windows)

1. Open this repository in VS Code.
2. To enable live AI, copy `tripgenie\.env.example` to `tripgenie\backend\.env` if needed and add your Groq key as described below. Without a key, continue; the launcher creates the configuration file and the app uses AI fallback behavior.
3. Run `run.bat` from the repository root (or `tripgenie\run.bat`).
4. Open [http://localhost:5173](http://localhost:5173). The API docs are at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

The launcher creates and activates `tripgenie\backend\.venv` with Python 3.13, installs backend dependencies, creates missing environment configuration, prepares the database/sample data, and installs frontend dependencies when `node_modules` is absent. It starts the backend and frontend in separate terminal windows. It checks Groq before starting the API and reports whether the key and configured model are accepted. An AI check failure does not prevent the backend from starting.

The launcher will not delete or replace an existing virtual environment. If `backend\.venv` was made with a different Python version, rename or remove that environment yourself, then run `run.bat` again. If port 8000 or 5173 is already in use, the launcher keeps the existing process instead of starting a duplicate; stop the old server and rerun to start the current code.

Stop each server with **Ctrl+C** in its own terminal window.

## Configure the backend

The launcher copies `tripgenie\.env.example` to `tripgenie\backend\.env` if no backend `.env` exists. The example uses SQLite, which requires no separate database installation.

To enable live AI, set your own key in `tripgenie\backend\.env`:

```dotenv
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b
```

Never paste API keys into source code, commit them, or share them in logs. Restart the backend after changing `.env`. The startup check reports common authentication, network, rate-limit, and model-availability issues without printing the key. If the key is rejected, the rest of the application still starts; AI features may return fallback content.

For MySQL, change `DATABASE_URL` to a connection URL for a database you control and ensure the database is running. Keep all credentials in the ignored backend `.env` file.

## Manual setup

From the repository root, open two PowerShell terminals.

### Backend

```powershell
cd tripgenie\backend
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
if (-not (Test-Path .env)) { Copy-Item ..\.env.example .env }
python seed.py --no-scrape
python check_ai.py
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

`python check_ai.py` is safe to run on its own. It validates Groq access using the model-list endpoint; it does not make an AI completion.

### Frontend

```powershell
cd tripgenie\frontend
npm ci
npm run dev -- --host 127.0.0.1
```

## Demo accounts

The seed script creates local demonstration accounts:

| Role | Email | Password |
| --- | --- | --- |
| Traveler | `demo@tripgenie.com` | `Demo@123` |
| Admin | `admin@tripgenie.com` | `Admin@123` |

These are public demo credentials. Do not use them in a deployed environment.

## Maps, places, photos, and travel data

- The itinerary map uses Leaflet and OpenStreetMap tiles with attribution. A destination is centered on its place lookup; supported known destinations have approximate fallback centers.
- Use **Find real place & photo** on an itinerary activity to look up its coordinates and search Wikimedia Commons. Results are best-effort matches; verify them. Photo links show available license and artist information.
- Photon lookups are user-triggered, cached in memory for 24 hours, and rate-limited to one request per second. Photon and public map services are community services with no availability guarantee.
- Browser GPS is requested only when **Show my GPS location** is selected and permission is granted.
- Seeded hotel and flight listings, transport estimates, and checkout are for demonstration. No live travel inventory, reservations, payments, traffic, or turn-by-turn directions are connected.

See the [OpenStreetMap tile policy](https://operations.osmfoundation.org/policies/tiles/), [Photon project](https://github.com/komoot/photon), and [Wikimedia Commons API](https://www.mediawiki.org/wiki/API:Search).

## Troubleshooting

- **Groq 401 / invalid key:** replace `GROQ_API_KEY` with a valid key in `tripgenie\backend\.env`, then restart the backend.
- **AI check says model unavailable:** verify `GROQ_MODEL` against the models available to that key.
- **Backend database error:** check `DATABASE_URL`, then run `python seed.py --no-scrape` from `tripgenie\backend`.
- **Port already in use:** stop the old backend/frontend terminal with Ctrl+C, then rerun the launcher.
- **Python version error:** use Python 3.13 for `backend\.venv`; the launcher intentionally will not destroy an existing environment.
- **No map/photo result:** verify the place spelling and internet connection; third-party coverage and availability vary.

## Repository layout

```text
run.bat                         Windows development launcher
tripgenie/
  backend/                      FastAPI application and seed script
    app/                        API, models, schemas, and services
    data/seed_fallback.json     Sample destination, hotel, and route data
    .env.example                Local configuration template
    check_ai.py                 Groq connectivity/model check
    start_backend.bat           Activates the venv and starts the API
  frontend/                     React, TypeScript, and Vite application
  docs/                         API, database, and demo documentation
```

More project documentation is in [tripgenie/README.md](tripgenie/README.md). Local `.env` files, virtual environments, databases, and dependency folders should not be committed.
