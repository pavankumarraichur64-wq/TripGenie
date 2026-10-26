@echo off
setlocal enabledelayedexpansion

set "APP_ROOT=%~dp0"
if exist "%APP_ROOT%tripgenie\backend" (
    set "APP_ROOT=%APP_ROOT%tripgenie\"
)

echo ============================================================
echo           TripGenie - Automated Smart Launcher
echo ============================================================
echo.
echo [INFO] App root: %APP_ROOT%

:: 1. Detect Best Python Version (Prefer 3.12 or 3.11 for guaranteed binary wheels)
set "PY_CMD="

py -3.12 --version >nul 2>&1
if not errorlevel 1 (
    set "PY_CMD=py -3.12"
    goto :python_found
)

py -3.11 --version >nul 2>&1
if not errorlevel 1 (
    set "PY_CMD=py -3.11"
    goto :python_found
)

py -3.10 --version >nul 2>&1
if not errorlevel 1 (
    set "PY_CMD=py -3.10"
    goto :python_found
)

python --version >nul 2>&1
if not errorlevel 1 (
    set "PY_CMD=python"
    goto :python_found
)

py --version >nul 2>&1
if not errorlevel 1 (
    set "PY_CMD=py"
    goto :python_found
)

echo [ERROR] Python is not installed or not in your PATH!
echo Please install Python 3.11 or 3.12 from https://www.python.org/downloads/
echo (Make sure to check 'Add python.exe to PATH' during installation)
echo.
pause
exit /b 1

:python_found
echo [OK] Using Python: %PY_CMD%

:: 2. Ensure .env exists
if not exist "%APP_ROOT%backend\.env" (
    if exist "%APP_ROOT%.env.example" (
        echo [INFO] Creating backend\.env from .env.example...
        copy "%APP_ROOT%.env.example" "%APP_ROOT%backend\.env" >nul
    ) else if exist "%APP_ROOT%backend\.env.example" (
        echo [INFO] Creating backend\.env from backend\.env.example...
        copy "%APP_ROOT%backend\.env.example" "%APP_ROOT%backend\.env" >nul
    )
)

:: 3. Setup Virtual Environment if not exists
if not exist "%APP_ROOT%backend\venv\Scripts\python.exe" (
    echo [INFO] Creating virtual environment for first-time setup...
    pushd "%APP_ROOT%backend"
    %PY_CMD% -m venv venv
    echo [INFO] Installing backend dependencies...
    venv\Scripts\pip install --upgrade pip
    venv\Scripts\pip install -r requirements.txt
    popd
)

:: 4. Seed database if not already seeded
if not exist "%APP_ROOT%backend\tripgenie.db" (
    echo [INFO] Seeding database with initial travel data...
    pushd "%APP_ROOT%backend"
    venv\Scripts\python seed.py --no-scrape
    popd
)

:: 5. Launch Backend
echo [1/2] Starting FastAPI backend on http://127.0.0.1:8000...
pushd "%APP_ROOT%backend"
start "TripGenie Backend" cmd /k "venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"
popd

:: 6. Launch Frontend
echo [2/2] Starting Frontend...
pushd "%APP_ROOT%frontend"
if not exist "node_modules" (
    echo [INFO] Installing frontend npm packages for first-time setup...
    call npm install
)
start "TripGenie Frontend" cmd /k "npm run dev"
popd

echo.
echo ============================================================
echo   TripGenie is launching!
echo   Frontend  : http://localhost:5173
echo   API Docs  : http://localhost:8000/docs
echo   Admin     : admin@tripgenie.com / Admin@123
echo   Demo User : demo@tripgenie.com  / Demo@123
echo ============================================================
echo.
pause
