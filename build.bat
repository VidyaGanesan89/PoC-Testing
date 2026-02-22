@echo off
REM ========================================
REM Maven Build Script with SSL Certificate Configuration
REM ========================================

echo.
echo ========================================
echo ParcelPro Automation - Maven Build
echo ========================================
echo.

REM Set project directory
cd /d "%~dp0"

REM Set Java options to use custom truststore
set MAVEN_OPTS=-Djavax.net.ssl.trustStore="%CD%\truststore.jks" -Djavax.net.ssl.trustStorePassword=changeit -Djavax.net.ssl.trustStoreType=JKS

echo Using custom truststore: %CD%\truststore.jks
echo.

REM Run Maven with custom settings
echo Running: mvn clean install -DskipTests
echo.
mvn clean install -DskipTests

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESS
    echo ========================================
    echo.
) else (
    echo.
    echo ========================================
    echo BUILD FAILED - Error Code: %ERRORLEVEL%
    echo ========================================
    echo.
    echo Trying alternative approach with SSL disabled...
    echo.
    set MAVEN_OPTS=-Dmaven.wagon.http.ssl.insecure=true -Dmaven.wagon.http.ssl.allowall=true -Dmaven.wagon.http.ssl.ignore.validity.dates=true
    mvn clean install -DskipTests
)

pause
