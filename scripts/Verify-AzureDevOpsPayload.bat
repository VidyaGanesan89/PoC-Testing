@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%Verify-AzureDevOpsPayload.ps1" %*
set "EXITCODE=%ERRORLEVEL%"

if not "%EXITCODE%"=="0" (
  echo.
  echo Azure DevOps payload verification failed with exit code %EXITCODE%.
) else (
  echo.
  echo Azure DevOps payload verification passed.
)

exit /b %EXITCODE%
