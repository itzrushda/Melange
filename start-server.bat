@echo off
title Melange 2026 - Event Management Portal
cd /d "%~dp0"
echo ========================================================
echo     MELANGE '26 - FULL-STACK EVENT MANAGEMENT PORTAL
echo ========================================================

set "PATH=%APPDATA%\Antigravity\bin;%PATH%"

set "NODE_CMD="
where node >nul 2>&1 && set "NODE_CMD=node"
if "%NODE_CMD%"=="" where agy-node >nul 2>&1 && set "NODE_CMD=agy-node"
if "%NODE_CMD%"=="" if exist "%APPDATA%\Antigravity\bin\agy-node.cmd" set "NODE_CMD=%APPDATA%\Antigravity\bin\agy-node.cmd"

if "%NODE_CMD%"=="" (
    echo Error: Node runtime was not found.
    pause
    exit /b 1
)

echo Starting full-stack server on http://localhost:8080 ...
echo Runtime: %NODE_CMD%
echo Opening browser at http://localhost:8080 ...
echo.

start "" "http://localhost:8080"
%NODE_CMD% server.js
pause
