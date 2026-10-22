# TripGenie --- AI-Powered Trip Planner

TripGenie is a web application that helps users plan trips by generating
travel itineraries with AI. It combines a React frontend with a FastAPI
backend and a database to manage user accounts, trips, destinations,
sample hotels and flights, and simulated reservations.

> **Project note:** TripGenie is a planning and booking-simulation
> project. Unless you integrate and verify real travel providers, it
> does not make live hotel or flight bookings and should not be
> presented as a real booking service.

## Table of Contents

-   [1. Project Overview](#1-project-overview)
-   [2. Main Features](#2-main-features)
-   [3. Technology Stack](#3-technology-stack)
-   [4. Project Structure](#4-project-structure)
-   [5. Requirements](#5-requirements)
-   [6. Installation and Setup](#6-installation-and-setup)
-   [7. Configure Environment
    Variables](#7-configure-environment-variables)
-   [8. Database Setup and Sample
    Data](#8-database-setup-and-sample-data)
-   [9. Start the Application](#9-start-the-application)
-   [10. Demo Accounts](#10-demo-accounts)
-   [11. Using TripGenie](#11-using-tripgenie)
-   [12. AI Itinerary Generation](#12-ai-itinerary-generation)
-   [13. API Documentation](#13-api-documentation)
-   [14. Troubleshooting](#14-troubleshooting)
-   [15. Security Notes](#15-security-notes)
-   [16. Testing](#16-testing)
-   [17. Future Enhancements](#17-future-enhancements)
-   [18. License and Disclaimer](#18-license-and-disclaimer)

## 1. Project Overview

Planning a trip can require researching destinations, arranging
activities, estimating costs, and organizing each day. TripGenie aims to
simplify this work by creating an itinerary from a traveler's
preferences.

A typical workflow is:

1.  The traveler creates an account and signs in.
2.  The traveler enters destination, dates or trip duration, budget,
    interests, and other preferences supported by the interface.
3.  The backend validates the request and asks the configured AI
    provider to generate an itinerary.
4.  If AI generation is unavailable, the application may use its
    configured fallback itinerary logic.
5.  The traveler reviews the daily schedule and estimated costs, and can
    use supported trip-management features.
6.  The application can simulate reservations and provide authenticated
    PDF itinerary export when those features are configured.

## 2. Main Features

Feature availability depends on the version of the source code and the
configuration in your local checkout.

-   **Account registration and login:** User accounts with password
    hashing and token-based authentication.
-   **AI itinerary generation:** Creates a trip plan using the
    configured Groq language model.
-   **Daily itinerary management:** View activities by day and
    regenerate a day when supported by the interface.
-   **Trip chat:** Ask follow-up questions about a trip when the chat
    feature is enabled.
-   **Budget estimates:** Displays estimated trip costs, including
    activity or travel-related amounts provided by the application.
-   **Seeded sample data:** Local sample destinations, hotels, flights,
    or other travel records, depending on the seed script.
-   **Simulated reservations:** Demonstrates booking flows without
    claiming to complete a real-world reservation.
-   **PDF export:** Export trip information when the authenticated PDF
    endpoint and frontend control are available.
-   **Traveler trip management:** View and manage trips belonging to the
    signed-in account.
-   **Admin functionality:** Administrative screens and actions, if the
    frontend routes and backend authorization checks are implemented.

## 3. Technology Stack

  Layer                         Technology
  ----------------------------- -----------------------------------------------------
  Frontend                      React 18, TypeScript, Vite
  Styling                       Tailwind CSS
  Backend API                   Python, FastAPI
  Database access               SQLAlchemy
  Database migrations           Alembic
  AI provider                   Groq API (configured through environment variables)
  PDF generation                ReportLab
  Local database option         SQLite
  Alternative database option   MySQL

## 4. Project Structure

The exact files can differ by version. The following is the expected
high-level layout:

``` text
tripgenie/
├── backend/
│   ├── app/
│   │   ├── api/              # API routers and endpoints
│   │   ├── core/             # Settings, security, authentication
│   │   ├── db/               # Database setup and session
│   │   ├── models/           # SQLAlchemy database models
│   │   ├── schemas/          # Request and response schemas
│   │   └── ai/               # AI itinerary/chat logic
│   ├── main.py               # FastAPI application entry point
│   ├── seed.py               # Sample-data setup script
│   ├── requirements.txt      # Python dependencies
│   ├── .env                  # Local secrets and configuration (do not commit)
│   └── .venv/                # Python virtual environment (generated)
├── frontend/
│   ├── src/                  # React application source
│   ├── public/               # Static assets
│   ├── package.json          # Frontend scripts and dependencies
│   └── vite.config.ts        # Vite configuration, if present
├── docs/
│   ├── api_list.md           # API notes, if included
│   ├── er_diagram.md         # Database diagram, if included
│   └── test_checklist.md     # Test checklist, if included
├── .env.example              # Example configuration, if included
├── run.bat                   # Optional Windows setup launcher, if included
├── run_demo.bat              # Optional demo launcher, if included
└── README.md
```

## 5. Requirements

Install the following before starting:

-   **Windows 10/11** or another supported operating system.
-   **Python 3.12** recommended for a predictable dependency setup. Use
    the Python version supported by the project's `requirements.txt`;
    Python 3.15 may not yet be supported by every dependency.
-   **Node.js LTS** and npm.
-   **Git**, if cloning the project from a repository.
-   A **Groq API key** for live AI responses. Without a valid key, only
    the application's fallback behavior may be available.
-   A database: SQLite is simplest for local development; MySQL can be
    used if the project settings and database server are configured for
    it.

Check your installations:

``` powershell
py --version
node --version
npm --version
git --version
```

If the project requires Python 3.12, verify it with:

``` powershell
py -3.12 --version
```

## 6. Installation and Setup

### Option A --- Use the supplied Windows launcher

If the project root contains `run.bat`, you may use it after reviewing
its contents:

1.  Open the project folder in VS Code.
2.  Inspect `run.bat` to understand what it installs and starts.
3.  Configure `backend\.env` or the environment file as instructed by
    the launcher.
4.  Double-click `run.bat`, or run it from Command Prompt.

The launcher may create a virtual environment, install dependencies,
copy `.env.example`, seed data, and start the API and frontend. Exact
behavior depends on the version of the script. If the launcher uses
MySQL settings by default, configure MySQL or switch to SQLite before
starting.

### Option B --- Manual setup (recommended for learning and debugging)

Open the project root in VS Code. Open **Terminal → New Terminal**.

#### 6.1 Set up the backend

From the project root:

``` powershell
cd backend
```

Create a virtual environment. If Python 3.12 is installed:

``` powershell
py -3.12 -m venv .venv
```

If you have already created `.venv`, do not create it again unless you
intend to rebuild the environment.

Activate it in PowerShell:

``` powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

``` powershell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

If PowerShell reports that scripts are disabled, the user-scoped setting
below is a common development solution:

``` powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Read the prompt and confirm if you are permitted to change this setting
on your computer. Then open a new terminal and activate the environment
again. On a managed school or work computer, follow the administrator's
policy instead. An alternative is to activate from Command Prompt:

``` cmd
.venv\Scripts\activate.bat
```

#### 6.2 Create the environment file

If `.env` does not exist and the project includes `.env.example`, run
this from the `backend` directory:

``` powershell
if (-not (Test-Path .env)) {
    Copy-Item ..\.env.example .env
}
```

If the example file is in a different location, adjust the source path.
Open `backend\.env` in VS Code and review every setting before launching
the application.

#### 6.3 Set up the frontend dependencies

Open a **second terminal** in VS Code. From the project root:

``` powershell
cd frontend
npm ci
```

Use `npm ci` when the repository has a compatible `package-lock.json`.
If there is no lock file, use:

``` powershell
npm install
```

Do not run frontend commands from the `backend` folder.

## 7. Configure Environment Variables

Open `backend\.env`. The names available in your project may vary; use
`.env.example` and the backend settings module as the source of truth.

Example for a local SQLite database:

``` dotenv
DATABASE_URL=sqlite:///./tripgenie.db
LLM_PROVIDER=groq
GROQ_API_KEY=replace_with_your_new_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b
SECRET_KEY=replace_with_a_long_random_secret
```

Important configuration notes:

-   Replace the example Groq key with your own valid key. Do not include
    quotation marks unless your settings parser specifically requires
    them.
-   Use a long, randomly generated `SECRET_KEY`; do not use a sample
    value in a deployed environment.
-   Keep `.env` private and out of Git.
-   Confirm that the model name is available to your Groq account and
    compatible with the code.
-   If the project uses additional settings, keep those in the file as
    required by `.env.example`.
-   The SQLite URL above creates/uses a database relative to the backend
    process's working directory in typical SQLAlchemy configurations.
    Run commands from `backend` for consistent local behavior.
-   If using MySQL, create the database and configure the full
    connection URL, including the correct username, password, host,
    port, and database name. Install the driver required by the project.

If a key was accidentally pasted into a chat, public repository,
screenshot, or commit, revoke it at the provider and create a new one.
Changing the local `.env` alone does not invalidate an exposed key.

## 8. Database Setup and Sample Data

From the backend directory, with the virtual environment activated, run
the seed script if it is part of your project:

``` powershell
python seed.py --no-scrape
```

This command is intended to load local sample data without scraping.
Check `python seed.py --help` or inspect the script if its options
differ.

If your project uses Alembic migrations, review its instructions and
apply migrations using the project's configured workflow. A common
Alembic command is:

``` powershell
alembic upgrade head
```

Run it only if Alembic is configured in this checkout and the database
URL is correct. Some projects create tables at application startup or in
the seed script instead.

**Caution:** Seeding may add sample records and may not reset an
existing user's password or role. Back up valuable local data before
database maintenance.

## 9. Start the Application

Run the backend and frontend in separate terminals.

### Terminal 1 --- Backend API

``` powershell
cd C:\Tripgenie\tripgenie\backend
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Expected local addresses:

-   API base: `http://127.0.0.1:8000`
-   Interactive API documentation: `http://127.0.0.1:8000/docs`
-   Alternative API documentation, if enabled:
    `http://127.0.0.1:8000/redoc`

Keep this terminal open while using the app.

### Terminal 2 --- Frontend

``` powershell
cd C:\Tripgenie\tripgenie\frontend
npm run dev
```

Vite normally prints the local development URL, often:

-   Frontend: `http://localhost:5173/`

Open the exact URL printed by Vite in your browser. If it chooses
another port because 5173 is occupied, use the URL shown in the
terminal.

### Stop the servers

Click the relevant terminal and press `Ctrl+C`. Stop the frontend and
backend separately.

## 10. Demo Accounts

The project documentation may define these local demo accounts:

  Role       Email                   Password
  ---------- ----------------------- -------------
  Traveler   `demo@tripgenie.com`    `Demo@123`
  Admin      `admin@tripgenie.com`   `Admin@123`

These credentials work only if the current database has been seeded with
those users and their passwords match. If your database contains
different users, the demo credentials may not work.

For your local development setup, an administrator account may also be
created using the project's existing password-hashing function and then
assigned the `admin` role. Never store a plain-text password in the
database. For a real deployment, create a unique strong password and
remove demo accounts.

## 11. Using TripGenie

1.  Start the backend and frontend.
2.  Open the frontend URL in your browser.
3.  Register a new traveler account or sign in.
4.  Enter the trip details requested by the form, such as destination,
    duration, budget, and interests.
5.  Submit the form to generate the itinerary.
6.  Review the suggested activities, schedule, and estimated costs.
7.  Use available trip actions to view or update the plan.
8.  Try PDF export or reservation simulation if those controls are
    present.
9.  Sign in with an authorized admin account to access administrative
    features, if implemented.

AI-generated suggestions can be inaccurate or outdated. Verify travel
rules, opening hours, transport details, prices, safety information, and
availability from reliable sources before travelling.

## 12. AI Itinerary Generation

The backend's AI service calls the configured Groq API when
`LLM_PROVIDER` and API credentials are set up correctly. The exact model
and request options must match the installed Groq SDK and the model
supported by your account.

Common reasons AI generation can fail include:

-   Missing, invalid, or revoked API key.
-   Model name not available to the account.
-   Rate limits or network connectivity problems.
-   Incompatible SDK request parameters.
-   A response that is too long or is not valid JSON when JSON is
    required.
-   An exception in the backend's response parsing or itinerary
    validation.

If the application has fallback logic, it may still create a trip after
the AI call fails. A successful HTTP response does not necessarily prove
that a live AI response was generated; inspect the backend logs and the
saved itinerary.

For troubleshooting, first try a short trip with fewer days and simple
preferences. Check the backend terminal for the full exception. Avoid
printing API keys or other secrets in logs.

## 13. API Documentation

When the backend is running, open:

`http://127.0.0.1:8000/docs`

The Swagger UI lists the API routes registered by the current code.
Select an endpoint to inspect its request schema, response schema, and
authentication requirements.

Typical route groups in a project of this kind may include:

-   Authentication: register, login, and current-user profile.
-   Trips: create/generate, list, view, update, or delete trips.
-   AI itinerary: day regeneration or trip chat.
-   Reservations: simulated booking operations.
-   PDF export: authenticated itinerary download.
-   Admin: administrative data and management operations, if
    implemented.

These are conceptual groups, not a guarantee that every route exists.
The live `/docs` page and router code are authoritative.

## 14. Troubleshooting

### PowerShell says scripts are disabled

For a permitted user-level configuration, run:

``` powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Alternatively, use Command Prompt and run:

``` cmd
.venv\Scripts\activate.bat
```

### `uvicorn` is not recognized

Make sure the virtual environment is active and install backend
dependencies:

``` powershell
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Port 8000 or 5173 is already in use

Stop the previous server with `Ctrl+C`, or configure a different port.
Use the URL printed by Vite for the frontend.

### `401 Unauthorized` during login

-   Check the email and password carefully.
-   Verify that the account exists in the same database used by the
    running backend.
-   Check that the frontend sends the fields required by `LoginRequest`.
-   Confirm the password was stored with the application's
    `hash_password()` function.
-   If a request is made to a protected route before logging in, a 401
    may be expected.
-   Do not fix login by disabling authentication checks.

### `422 Unprocessable Entity`

Inspect the endpoint's request schema in `/docs`. The JSON or form data
sent by the frontend may not match the required fields or data types.

### `500 Internal Server Error`

Read the backend terminal traceback. The HTTP status alone does not
identify the cause. Check database connectivity, missing environment
variables, migrations, and dependency versions.

### AI generation fails, but a trip is still created

Check the AI service logs and fallback code. Reduce the trip duration
for a test and confirm the API key and model configuration. A successful
trip endpoint response may indicate fallback behavior rather than a
successful AI call.

### Database or table errors

-   Confirm `DATABASE_URL` points to the intended database.
-   Run commands from the expected working directory.
-   Apply configured migrations or the project's table-creation
    workflow.
-   Run the seed script if sample data is needed.
-   Back up the database before deleting or rebuilding it.

### Python package installation errors

Use the Python version supported by the project. If using an unsupported
preview version, install a stable compatible Python release (Python 3.12
is recommended here), recreate the virtual environment, and reinstall
`requirements.txt`.

Example of rebuilding the virtual environment **only if you are willing
to reinstall its packages**:

``` powershell
deactivate
Remove-Item -Recurse -Force .venv
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Do not delete `.venv` while a server is running from it.

### `PSReadLine` cursor-position error in the terminal

This can be a PowerShell terminal rendering issue separate from the
Python app. Open a new terminal or restart VS Code. If it continues,
check for an available `PSReadLine` update.

## 15. Security Notes

-   Never commit `.env`, API keys, access tokens, database passwords, or
    production secrets.
-   If a secret is exposed, revoke or rotate it.
-   Use a unique, strong `SECRET_KEY` outside local development.
-   Use HTTPS and secure cookie/token handling for deployed
    applications.
-   Keep dependencies updated and review security advisories.
-   Enforce authorization on the backend for admin endpoints. Hiding an
    admin button in the frontend is not security.
-   Never store plain-text passwords; use the application's
    password-hashing utilities.
-   Do not deploy with demo credentials or development settings.
-   Validate and authorize every operation that reads or modifies a
    user's trips.
-   The application is a learning project unless it has been
    independently reviewed and hardened for production.

## 16. Testing

A basic manual test checklist:

-   [ ] Backend starts without an exception.
-   [ ] Frontend starts and loads in the browser.
-   [ ] Registration works with valid input.
-   [ ] Duplicate registration is rejected appropriately.
-   [ ] Login succeeds with a valid account.
-   [ ] Incorrect credentials are rejected.
-   [ ] The current-user endpoint requires authentication.
-   [ ] A trip can be generated or the configured fallback is shown
    clearly.
-   [ ] Trip details load for the signed-in owner.
-   [ ] Users cannot access another user's private trips without
    authorization.
-   [ ] AI failures are logged and handled safely.
-   [ ] PDF export works for an authorized user, if implemented.
-   [ ] Simulated reservation actions behave as documented.
-   [ ] Admin endpoints reject non-admin users.
-   [ ] Environment secrets are excluded from version control.

See `docs/test_checklist.md` if that file exists in your checkout.

## 17. Future Enhancements

Possible future improvements include:

-   Live weather and map integration.
-   Real-time travel information from trusted APIs.
-   Better itinerary personalization based on traveler preferences.
-   Cost breakdowns and budget alerts.
-   Multi-language support.
-   Accessibility-aware itinerary recommendations.
-   Automated backend and frontend tests.
-   Improved error messages and monitoring.
-   Secure production deployment and CI/CD.
-   Real booking integration only through authorized providers, with
    clear confirmation and payment handling.

## 18. License and Disclaimer

Add the license that applies to your project before publishing or
distributing it. Do not assume the project is open-source unless a
license is included.

TripGenie is intended for trip planning and demonstration. It is not a
guarantee of travel availability, prices, safety, or booking
confirmation. Verify important details independently before making
travel decisions.
