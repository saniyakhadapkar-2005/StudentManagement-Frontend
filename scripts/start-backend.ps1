$backendPath = Join-Path $PSScriptRoot "..\..\demo"

if (-not (Test-Path $backendPath)) {
    Write-Error "Backend not found at: $backendPath"
    exit 1
}

Set-Location $backendPath
& .\mvnw.cmd spring-boot:run
