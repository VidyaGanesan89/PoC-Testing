@echo off
echo Stopping all ParcelPro servers...
echo.

REM Kill all node processes
echo Stopping Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

REM Wait a moment
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo All servers stopped!
echo ========================================
echo.
echo To restart, run: start-all-servers.bat
echo.
pause
