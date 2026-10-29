@echo off
setlocal

set "REPO_ROOT=%~dp0"
if exist "%REPO_ROOT%tripgenie\backend\main.py" (
    set "APP_ROOT=%REPO_ROOT%tripgenie"
) else if exist "%REPO_ROOT%backend\main.py" (
    set "APP_ROOT=%REPO_ROOT%"
) else (
    echo [ERROR] Could not find the TripGenie backend.
    echo Run this file from the repository root or the tripgenie application folder.
    pause
    exit /b 1
)

set "BACKEND_DIR=%APP_ROOT%\backend"
set "FRONTEND_DIR=%APP_ROOT%\frontend"
set "BACKEND_PYTHON=%BACKEND_DIR%\.venv\Scripts\python.exe"

echo ============================================================
echo              TripGenie - Development Launcher
echo ============================================================
echo App folder: "%APP_ROOT%"
echo.

if not exist "%BACKEND_DIR%\.env" (
    if exist "%APP_ROOT%\.env.example" (
        echo [INFO] Creating backend\.env from .env.example.
        copy "%APP_ROOT%\.env.example" "%BACKEND_DIR%\.env" >nul
        if errorlevel 1 goto :failed
        echo [INFO] Add your Groq key to backend\.env to enable live AI.
    ) else (
        echo [ERROR] backend\.env and .env.example are both missing.
        goto :failed
    )
)

where py >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python Launcher was not found. Install Python 3.13 and enable the py launcher.
    goto :failed
)

if not exist "%BACKEND_PYTHON%" (
    echo [INFO] Creating backend Python 3.13 virtual environment.
    pushd "%BACKEND_DIR%"
    py -3.13 -m venv .venv
    if errorlevel 1 (
        popd
        echo [ERROR] Could not create the Python 3.13 virtual environment.
        goto :failed
    )
    popd
)

"%BACKEND_PYTHON%" -c "import sys; raise SystemExit(0 if sys.version_info[:2] == (3, 13) else 1)" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] backend\.venv is not using Python 3.13.
    echo This launcher will not delete or replace an existing environment.
    echo Rename or remove backend\.venv yourself, then run this launcher again.
    goto :failed
)

echo [INFO] Installing/verifying backend dependencies in backend\.venv.
pushd "%BACKEND_DIR%"
"%BACKEND_PYTHON%" -m pip install -r requirements.txt
if errorlevel 1 (
    popd
    echo [ERROR] Backend dependency installation failed.
    goto :failed
)

echo.
echo [INFO] Preparing database tables and sample data.
"%BACKEND_PYTHON%" seed.py --no-scrape
if errorlevel 1 (
    popd
    echo [ERROR] Database setup failed. Check DATABASE_URL in backend\.env.
    goto :failed
)
popd

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js was not found. Install the current Node.js LTS release.
    goto :failed
)
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm was not found. Repair or reinstall Node.js.
    goto :failed
)

if not exist "%FRONTEND_DIR%\package.json" (
    echo [ERROR] Frontend package.json was not found.
    goto :failed
)
if not exist "%FRONTEND_DIR%\node_modules" (
    echo [INFO] Installing frontend dependencies with npm ci.
    pushd "%FRONTEND_DIR%"
    call npm ci
    if errorlevel 1 (
        popd
        echo [ERROR] Frontend dependency installation failed.
        goto :failed
    )
    popd
)

call :port_in_use 8000
if errorlevel 1 (
    echo [INFO] Backend port 8000 is already in use; running the AI check here.
    pushd "%BACKEND_DIR%"
    "%BACKEND_PYTHON%" check_ai.py
    popd
    echo [INFO] Keeping the existing backend process. Stop it and rerun to launch the updated backend.
) else (
    echo [INFO] Starting backend in its Python 3.13 virtual environment.
    start "TripGenie Backend" /D "%BACKEND_DIR%" "%ComSpec%" /k "call ""%BACKEND_DIR%\start_backend.bat"""
)

call :port_in_use 5173
if errorlevel 1 (
    echo [INFO] Frontend port 5173 is already in use; keeping the existing frontend process.
) else (
    echo [INFO] Starting Vite frontend.
    start "TripGenie Frontend" /D "%FRONTEND_DIR%" "%ComSpec%" /k "npm run dev -- --host 127.0.0.1"
)

echo.
echo ============================================================
echo Frontend : http://localhost:5173
echo API      : http://127.0.0.1:8000
echo API docs : http://127.0.0.1:8000/docs
echo.
echo Demo traveler : demo@tripgenie.com / Demo@123
echo Demo admin    : admin@tripgenie.com / Admin@123
echo Use these demo credentials only for local development.
echo ============================================================
echo.
pause
exit /b 0

:port_in_use
powershell -NoProfile -Command "if (Get-NetTCPConnection -State Listen -LocalPort %~1 -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }" >nul 2>&1
exit /b %errorlevel%

:failed
echo.
pause
exit /b 1
