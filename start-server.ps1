# Melange '26 - Full-Stack Event Management Portal Launcher
$port = 8080
$folder = $PSScriptRoot
if (-not $folder) { $folder = (Get-Location).Path }

$env:PATH = "$env:APPDATA\Antigravity\bin;" + $env:PATH

# Get local LAN IP for Android mobile testing
$lanIp = "localhost"
try {
    $ipObj = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { 
        $_.InterfaceAlias -notmatch 'Loopback' -and 
        $_.IPAddress -notmatch '^169\.254\.' -and 
        $_.IPAddress -match '^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)' 
    } | Select-Object -First 1
    if ($ipObj) { $lanIp = $ipObj.IPAddress }
} catch {}

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "    MELANGE '26 - EVENT MANAGEMENT PORTAL              " -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Directory        : $folder" -ForegroundColor Gray
Write-Host "Desktop URL      : http://localhost:$port" -ForegroundColor Green
Write-Host "Android Wi-Fi URL: http://$($lanIp):$port" -ForegroundColor Magenta
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Admin Login      : admin / admin123 (or Code: ADMIN-MELANGE / PIN: 9999)" -ForegroundColor White
Write-Host "College GS Login : AEC04-GS / password123" -ForegroundColor White
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Tip: In browser, press F12 and toggle Device Toolbar for Android Phone view." -ForegroundColor Gray
Write-Host ""

# Launch Browser
try {
    Start-Process "http://localhost:$port"
} catch {}

# Determine Node command
$nodeCmd = "agy-node"
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeCmd = "node"
} elseif (Test-Path "$env:APPDATA\Antigravity\bin\agy-node.cmd") {
    $nodeCmd = "$env:APPDATA\Antigravity\bin\agy-node.cmd"
}

Write-Host "Starting Node.js + Express backend server ($nodeCmd server.js)..." -ForegroundColor Cyan
Set-Location $folder
& $nodeCmd "$folder\server.js"
