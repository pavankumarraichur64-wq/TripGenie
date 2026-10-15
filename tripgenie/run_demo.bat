@echo off
echo ============================================================
echo   TripGenie — Demo Launcher
echo ============================================================
echo.

:: Start the FastAPI backend
echo [1/2] Starting backend (FastAPI on port 8000)...
cd backend
start "TripGenie Backend" cmd /k "venv\Scripts\activate && uvicorn main:app --host 0.0.0.0 --port 8000"
cd ..

:: Wait 3 seconds for the backend to initialize
timeout /t 3 /nobreak > nul

:: Serve the pre-built frontend (production build)
echo [2/2] Serving frontend (port 5173)...
cd frontend
if not exist dist (
    echo [!] Frontend not built yet. Building now (this may take a few minutes)...
    call npm install
    call npm run build
)
start "TripGenie Frontend" cmd /k "npx serve dist -p 5173"
cd ..

echo.
echo ============================================================
echo   TripGenie is running!
echo   Frontend : http://localhost:5173
echo   API Docs : http://localhost:8000/docs
echo ============================================================
echo   Admin login: admin@tripgenie.com / Admin@123
echo   Demo login : demo@tripgenie.com  / Demo@123
echo ============================================================
pause
