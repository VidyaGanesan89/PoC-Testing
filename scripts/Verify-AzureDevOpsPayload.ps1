param(
    [string]$ApiBaseUrl = "http://localhost:8080/api",
    [string]$Prompt = "Smoke test: verify Azure DevOps payload contract",
    [string]$TestType = "performance",
    [string]$Llm = "GPT-4o"
)

$ErrorActionPreference = "Stop"

Write-Host "[1/3] Checking backend health at $ApiBaseUrl/health ..."
$health = Invoke-RestMethod -Uri "$ApiBaseUrl/health" -Method Get
if (-not $health -or $health.status -ne "ok") {
    throw "Backend health check failed."
}
Write-Host "Backend health: OK"

Write-Host "[2/3] Posting generate-ai-test request with Azure DevOps metadata ..."
$payload = @{
    prompt = $Prompt
    testType = $TestType
    llm = $Llm
    forceNew = $true
    azureDevOps = @{
        relatedWorkItemIds = @("12345", "67890")
        assignedTo = "user@ups.com"
        priority = 2
        state = "Active"
        workItemType = "Task"
    }
} | ConvertTo-Json -Depth 8

$response = Invoke-RestMethod -Uri "$ApiBaseUrl/generate-ai-test" -Method Post -ContentType "application/json" -Body $payload

Write-Host "[3/3] Validating response contract ..."
$checks = @(
    @{ Name = "success"; Passed = ($null -ne $response.success) },
    @{ Name = "testId"; Passed = (-not [string]::IsNullOrWhiteSpace($response.testId)) },
    @{ Name = "artifacts[]"; Passed = ($response.artifacts -is [System.Array] -and $response.artifacts.Count -ge 1) },
    @{ Name = "azureDevOps"; Passed = ($null -ne $response.azureDevOps) }
)

$failed = $checks | Where-Object { -not $_.Passed }
if ($failed.Count -gt 0) {
    Write-Host "Contract validation failed:" -ForegroundColor Red
    $failed | ForEach-Object { Write-Host " - $($_.Name)" -ForegroundColor Red }
    exit 1
}

Write-Host "Contract validation passed." -ForegroundColor Green
Write-Host "testId: $($response.testId)"
if ($response.azureDevOps.enabled -eq $false -and $response.azureDevOps.error) {
    Write-Host "Azure DevOps integration note: $($response.azureDevOps.error)" -ForegroundColor Yellow
}

exit 0
