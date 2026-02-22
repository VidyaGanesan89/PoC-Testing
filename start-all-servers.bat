@echo off
echo Starting ParcelPro Test Automation Platform...
echo.

REM Start Backend Server (Port 8080)
echo [1/3] Starting Backend Server...
start "Backend Server - Port 8080" /MIN cmd /k "cd /d "%~dp0backend" && npm run dev"
timeout /t 3 /nobreak >nul

REM Start RAG Server (Port 8081)
echo [2/3] Starting RAG Server...
start "RAG Server - Port 8081" /MIN cmd /k "cd /d "%~dp0RAG_ViewHistory\backend" && node server.js"
timeout /t 3 /nobreak >nul

REM Start Frontend (Port 3000)
echo [3/3] Starting Frontend...
start "Frontend - Port 3000" /MIN cmd /k "cd /d "%~dp0frontend" && npm start"

echo.
echo ========================================
echo All servers are starting...
echo.
echo Backend:  http://localhost:8080
echo RAG:      http://localhost:8081  
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo Wait 15-20 seconds for frontend to compile, then open:
echo http://localhost:3000
echo.
echo Press any key to exit (servers will keep running)...
pause >nul
