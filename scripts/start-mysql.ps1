$service = Get-Service -Name MYSQL80 -ErrorAction SilentlyContinue

if (-not $service) {
    Write-Error "MYSQL80 service not found. Install MySQL or rename the service in scripts/start-mysql.ps1"
    exit 1
}

if ($service.Status -ne 'Running') {
    Start-Service MYSQL80
    Write-Host "MySQL80 service started."
} else {
    Write-Host "MySQL80 is already running."
}
