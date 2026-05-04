@echo off
cd /d "%~dp0"
echo ==============================================
echo    Starting Smart Road Safety System
echo ==============================================

echo [1/3] Starting Backend API...
start "Backend API" cmd /k "cd backend && python app.py"

echo Waiting for backend to initialize (5 seconds)...
timeout /t 5 /nobreak >nul

echo [2/3] Starting Camera Simulator...
start "Camera Simulator" cmd /k "cd backend && python simulate_camera.py"

echo [3/3] Starting Frontend Dashboard...
start "Frontend UI" cmd /k "cd frontend && npm run dev"

echo.
echo ==============================================
echo    All services have been started!
echo    Vite will provide the local URL (usually http://localhost:5173).
echo    Close the terminal windows to stop the services.
echo ==============================================
pause
