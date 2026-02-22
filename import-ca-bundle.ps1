# PowerShell script to import CA bundle certificates into Java cacerts
# Run this script as Administrator

$ErrorActionPreference = "Continue"

# Find Java installation
$javaHome = $env:JAVA_HOME
if (-not $javaHome) {
    Write-Host "JAVA_HOME not set. Detecting Java installation..." -ForegroundColor Yellow
    $javaPath = (Get-Command java -ErrorAction SilentlyContinue).Source
    if ($javaPath) {
        $javaHome = Split-Path (Split-Path $javaPath -Parent) -Parent
    }
}

if (-not $javaHome) {
    Write-Host "ERROR: Cannot find Java installation!" -ForegroundColor Red
    exit 1
}

Write-Host "Java Home: $javaHome" -ForegroundColor Green

$cacertsPath = Join-Path $javaHome "lib\security\cacerts"
$keytoolPath = Join-Path $javaHome "bin\keytool.exe"

if (-not (Test-Path $cacertsPath)) {
    Write-Host "ERROR: cacerts file not found at: $cacertsPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $keytoolPath)) {
    Write-Host "ERROR: keytool not found at: $keytoolPath" -ForegroundColor Red
    exit 1
}

Write-Host "Cacerts: $cacertsPath" -ForegroundColor Green
Write-Host "Keytool: $keytoolPath" -ForegroundColor Green
Write-Host ""

# Backup cacerts
$backupPath = "$cacertsPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "Creating backup: $backupPath" -ForegroundColor Yellow
Copy-Item $cacertsPath $backupPath -Force

# Read the PEM bundle
$pemFile = Join-Path $PSScriptRoot "ca-bundle.pem"
if (-not (Test-Path $pemFile)) {
    Write-Host "ERROR: ca-bundle.pem not found!" -ForegroundColor Red
    exit 1
}

$pemContent = Get-Content $pemFile -Raw
$certificates = $pemContent -split '(?=-----BEGIN CERTIFICATE-----)'
$certificates = $certificates | Where-Object { $_ -match '-----BEGIN CERTIFICATE-----' }

Write-Host "Found $($certificates.Count) certificates in bundle" -ForegroundColor Cyan
Write-Host ""

$imported = 0
$failed = 0

foreach ($cert in $certificates) {
    if ($cert -match '# Label: "([^"]+)"') {
        $alias = "ca-bundle-" + $matches[1].Replace(" ", "-").Replace("(", "").Replace(")", "")
    } else {
        $alias = "ca-bundle-cert-$($imported + $failed + 1)"
    }
    
    # Save individual cert to temp file
    $tempCertFile = Join-Path $env:TEMP "temp-cert-$($imported + $failed).pem"
    $cert | Set-Content $tempCertFile -Force
    
    # Import certificate
    Write-Host "Importing: $alias" -ForegroundColor Gray
    
    $result = & $keytoolPath -importcert -noprompt -trustcacerts -alias $alias -file $tempCertFile -keystore $cacertsPath -storepass changeit 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $imported++
        Write-Host "  Success" -ForegroundColor Green
    } else {
        $failed++
        Write-Host "  Failed: $result" -ForegroundColor Red
    }
    
    # Clean up temp file
    Remove-Item $tempCertFile -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Import Summary:" -ForegroundColor Cyan
Write-Host "  Imported: $imported" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor Red
Write-Host "  Backup: $backupPath" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Done! You can now run Maven build." -ForegroundColor Green
