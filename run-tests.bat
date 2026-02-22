@echo off
REM ========================================
REM Maven Test Execution Script with SSL Certificate Configuration
REM ========================================

echo.
echo ========================================
echo ParcelPro Automation - Test Execution
echo ========================================
echo.

REM Set project directory
cd /d "%~dp0"

REM Set Java options to use custom truststore
set MAVEN_OPTS=-Djavax.net.ssl.trustStore="%CD%\truststore.jks" -Djavax.net.ssl.trustStorePassword=changeit -Djavax.net.ssl.trustStoreType=JKS

echo Using custom truststore: %CD%\truststore.jks
echo.

REM Run Maven tests
echo Running: mvn clean test
echo.
mvn clean test

REM Capture test result status
set TEST_RESULT=%ERRORLEVEL%

if %TEST_RESULT% EQU 0 (
    echo.
    echo ========================================
    echo TESTS COMPLETED SUCCESSFULLY
    echo ========================================
    echo.
) else (
    echo.
    echo ========================================
    echo TESTS COMPLETED WITH FAILURES - Error Code: %TEST_RESULT%
    echo ========================================
    echo.
)

REM Generate HTML report
echo Generating HTML test report...
call generate-report.bat

pause
