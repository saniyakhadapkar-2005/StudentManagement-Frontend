Write-Host "Stopping Angular (4200) and Spring Boot backend (8080)..."

foreach ($port in @(4200, 8080)) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

    if (-not $connections) {
        Write-Host "No process listening on port $port"
        continue
    }

    $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $pids) {
        if ($pid -and $pid -ne 0) {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped port $port (PID $pid)"
        }
    }
}

Write-Host "Stop complete. MySQL service was left running."
