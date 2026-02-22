@echo off
REM Open the latest test report in Chrome browser

set "REPORT_FILE=functional test report\Test_Report_2026-01-24.html"

REM Open in Chrome with full path
start chrome.exe "%CD%\%REPORT_FILE%"

echo Report opened in Chrome browser
pause
