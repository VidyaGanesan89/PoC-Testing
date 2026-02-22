param(
    [string]$ReportName = "Test_Report_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Web   # needed for HtmlEncode

# Paths
$projectRoot = Split-Path -Parent $PSScriptRoot
$testNgResultsPath = Join-Path $projectRoot "target\surefire-reports\testng-results.xml"
$reportsBasePath  = Join-Path $projectRoot "reports"
$reportOutputPath = Join-Path $projectRoot "functional test report\$ReportName.html"
$templatePath     = Join-Path $PSScriptRoot "report-template.html"

Write-Host "Generating Test Report..." -ForegroundColor Cyan
Write-Host "  TestNG Results: $testNgResultsPath" -ForegroundColor Gray
Write-Host "  Output:         $reportOutputPath" -ForegroundColor Gray

# Check if TestNG results exist
if (-not (Test-Path $testNgResultsPath)) {
    Write-Host "ERROR: testng-results.xml not found" -ForegroundColor Red
    exit 1
}

# ── Parse TestNG Results ─────────────────────────────────────────────────────
[xml]$testNgXml = Get-Content $testNgResultsPath
$testSuite  = $testNgXml."testng-results"
$totalTests = 0; $passedTests = 0; $failedTests = 0

foreach ($suite in $testSuite.suite) {
    foreach ($test in $suite.test) {
        foreach ($class in $test.class) {
            foreach ($method in $class."test-method") {
                if ($method.status -eq "PASS")  { $totalTests++; $passedTests++ }
                elseif ($method.status -eq "FAIL") { $totalTests++; $failedTests++ }
            }
        }
    }
}

# Test class / method / date
$testClass     = "Unknown"
$testMethod    = "Unknown"
$executionDate = Get-Date -Format "MMMM dd, yyyy"

if ($testSuite.suite.test.class) {
    $classElement = $testSuite.suite.test.class
    $testClass    = if ($classElement.name) { ($classElement.name -split '\.')[-1] } else { "Unknown" }
    if ($classElement."test-method") { $testMethod = $classElement."test-method".name }
}

# Execution time from TestNG duration-ms
$executionTime = "~0s"
$durationProp  = $testSuite.suite | Select-Object -ExpandProperty "duration-ms" -ErrorAction SilentlyContinue
if ($durationProp) {
    $executionTime = "~" + [math]::Round(([int]$durationProp / 1000), 0).ToString() + "s"
}

$testStatus = if ($failedTests -gt 0) { "FAILED" } else { "PASSED" }

# ── Find the latest ExtentReports Run folder ─────────────────────────────────
# Reporter.java saves screenshots to reports/Run_<timestamp>/ named after the step message.
$latestRunDir = $null
if (Test-Path $reportsBasePath) {
    $latestRunDir = Get-ChildItem -Path $reportsBasePath -Directory -Filter "Run_*" |
        Sort-Object Name -Descending |
        Select-Object -First 1
}

# ── Build steps from screenshots in the Run folder ──────────────────────────
# Screenshot filenames: "<step description>_YYYY_MM_DD_hh_mm_ss_AM.png"
$steps = @()
if ($latestRunDir) {
    Write-Host "  ExtentReports Run: $($latestRunDir.Name)" -ForegroundColor Gray

    $pngFiles = Get-ChildItem -Path $latestRunDir.FullName -Filter "*.png" |
        Sort-Object Name   # alphabetical order preserves time-stamped order

    $stepNum = 1
    foreach ($png in $pngFiles) {
        # Strip the trailing timestamp  _YYYY_MM_DD_hh_mm_ss_AM/PM  from the filename
        $rawName    = [System.IO.Path]::GetFileNameWithoutExtension($png.Name)
        $stepDesc   = $rawName -replace '_\d{4}_\d{2}_\d{2}_\d{2}_\d{2}_\d{2}_(AM|PM)$', ''
        $stepDesc   = $stepDesc -replace '_', ' '

        # Embed screenshot as base64 so the HTML is fully self-contained
        $bytes      = [System.IO.File]::ReadAllBytes($png.FullName)
        $b64        = [Convert]::ToBase64String($bytes)
        $dataUri    = "data:image/png;base64,$b64"

        $steps += [PSCustomObject]@{
            Number      = $stepNum
            Description = $stepDesc
            ImageUri    = $dataUri
            FileName    = $png.Name
        }
        $stepNum++
    }
}

$totalSteps = $steps.Count
Write-Host "  Statistics: Tests=$totalTests | Passed=$passedTests | Failed=$failedTests | Steps=$totalSteps" -ForegroundColor Gray

# ── Build Step HTML blocks ───────────────────────────────────────────────────
$stepBlocks = ""
foreach ($step in $steps) {
    $n    = $step.Number
    $desc = [System.Web.HttpUtility]::HtmlEncode($step.Description)
    $imgBlock = ""
    if ($step.ImageUri) {
        $imgBlock = @"

                            <div class="screenshot">
                                <img src="$($step.ImageUri)" alt="Step $n Screenshot">
                                <p class="screenshot-caption">Screenshot: $($step.FileName)</p>
                            </div>
"@
    }

    $stepBlocks += @"

                    <!-- Step $n -->
                    <div class="step">
                        <div class="step-number">$n</div>
                        <div class="step-content">
                            <h4>$desc</h4>
                            <div class="step-result">
                                &#10003; PASSED &ndash; $desc
                            </div>$imgBlock
                        </div>
                    </div>
"@
}

if ($stepBlocks -eq "") {
    $stepBlocks = @"

                    <div class="step">
                        <div class="step-content">
                            <p style="color:#999;">No step screenshots found. Ensure common.Reporter is used with takeScreenshot=true.</p>
                        </div>
                    </div>
"@
}

# ── Read template, substitute values, write output ──────────────────────────
$html = Get-Content $templatePath -Raw -Encoding UTF8

# Header title and date
$html = $html -replace 'ParcelPro Language Selection Test Report', "ParcelPro $testClass Test Report"
$html = $html -replace 'January 25, 2026', $executionDate

# Summary cards
$html = $html -replace '(<div class="summary-card passed">[\s\S]*?<div class="value">)\d+(</div>)', "`${1}$passedTests`$2"
$html = $html -replace '(<div class="summary-card failed">[\s\S]*?<div class="value">)\d+(</div>)',  "`${1}$failedTests`$2"
$html = $html -replace '(<h3>[^<]*Total Steps[^<]*</h3>\s*<div class="value">)\d+(</div>)',           "`${1}$totalSteps`$2"
$html = $html -replace '~12s', $executionTime

# Test case header name
$html = $html -replace 'Verify ParcelPro Language Selection - Europe › Italy – English', "ParcelPro $testClass Automated Test"

# Test-case header colour: red when failed
if ($failedTests -gt 0) {
    $html = $html -replace 'class="test-case-header"', 'class="test-case-header" style="background:#dc3545;"'
    $html = $html -replace 'color: #28a745;">', 'color: #dc3545;">'
    $html = $html -replace '&#10003; PASSED', '&#10007; FAILED'
    $html = $html -replace '✓ PASSED', '✗ FAILED'
}

# Details table
$html = $html -replace 'ParcelProLanguageSelectTest', $testClass
$html = $html -replace 'verifyLanguageSelection\(\)', "$testMethod()"

# Inject the real steps using [regex]::Replace + scriptblock to safely handle
# large base64 image payloads and avoid $ backreference issues in -replace.
$localStepBlocks = $stepBlocks   # capture for scriptblock scope
$html = [regex]::Replace($html, '(?s)(<div class="test-steps">).*?(</div>\s*<!--\s*Test Information\s*-->)', {
    param($m)
    return $m.Groups[1].Value + "`n" + $localStepBlocks + "`n                " + $m.Groups[2].Value
})

# Save
$html | Out-File -FilePath $reportOutputPath -Encoding UTF8

Write-Host "Report Generated Successfully!" -ForegroundColor Green
Write-Host "  $reportOutputPath" -ForegroundColor Cyan
