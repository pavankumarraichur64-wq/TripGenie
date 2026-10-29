@echo off
setlocal
cd /d "%~dp0"

if not exist ".venv\Scripts\activate.bat" (
    echo [ERROR] Python virtual environment is missing. Run the repository run.bat first.
    exit /b 1
)

call ".venv\Scripts\activate.bat"
if errorlevel 1 (
    echo [ERROR] Could not activate backend\.venv.
    exit /b 1
)

echo ============================================================
echo TripGenie Backend - Python virtual environment active
echo ============================================================
python --version
python check_ai.py
if errorlevel 1 (
    echo [WARN] AI check failed. The backend will still start; AI features may use fallback responses.
)
echo.
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
