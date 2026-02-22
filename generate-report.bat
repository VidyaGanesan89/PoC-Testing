@echo off
REM Generate HTML Test Report from TestNG Results
REM Configuration: See test-config.properties for report settings
REM Default Report Path: functional test report\
REM Report Format: Test_Report_YYYY-MM-DD_HH-MM-SS.html

echo ========================================
echo Generating Test Report
echo ========================================
echo Report Location: %CD%\functional test report
echo.

REM Check if surefire-reports directory exists
if not exist "target\surefire-reports" (
    echo ERROR: No test results found. Run tests first with 'mvn test'
    pause
    exit /b 1
)

REM Set report name with timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set REPORT_NAME=Test_Report_%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%-%datetime:~10,2%-%datetime:~12,2%

REM Create functional test report directory if it doesn't exist
if not exist "functional test report" mkdir "functional test report"

REM Generate HTML report using TestNG
echo Generating custom HTML report from TestNG results...

REM Always create custom HTML report with modern UI
call :GenerateCustomReport

REM Also copy the emailable report (simpler version)
if exist "target\surefire-reports\emailable-report.html" (
    copy "target\surefire-reports\emailable-report.html" "functional test report\%REPORT_NAME%_email.html" >nul
    echo ✓ Email report: functional test report\%REPORT_NAME%_email.html
)

echo.
echo ========================================
echo Report generation completed
echo ========================================
echo.
echo Opening report in browser...
if exist "functional test report\%REPORT_NAME%.html" (
    start "" "functional test report\%REPORT_NAME%.html"
) else (
    echo Warning: Report file not found
)

exit /b 0

:GenerateCustomReport
REM Generate modern custom HTML report from TestNG XML results
powershell -ExecutionPolicy Bypass -File "scripts\Generate-CustomReport.ps1" -ReportName "%REPORT_NAME%"
exit /b 0

