@echo off
title Ville CV AI - Startup

echo.
echo ========================================
echo       Ville CV AI - Kaynnistys
echo ========================================
echo.

if "%PROXY_API_KEY%"=="" (
    echo [ERROR] PROXY_API_KEY puuttuu.
    echo.
    pause
    exit /b 1
)

echo [1/3] Tarkistetaan Ollama...
curl.exe -s http://127.0.0.1:11434/api/tags >nul 2>&1

if errorlevel 1 (
    echo [ERROR] Ollama ei ole kaynnissa.
    echo Kaynnista Ollama ja yrita uudelleen.
    echo.
    pause
    exit /b 1
)

echo [OK] Ollama toimii.
echo.

echo [2/3] Kaynnistetaan Ollama-proxy...
start "Ville CV AI - Proxy" cmd /k "cd /d C:\Users\durak\repos\ville-cv-ai\ollama-proxy && node server.js"

timeout /t 2 /nobreak >nul

echo.
echo [3/3] Kaynnistetaan Tailscale Funnel...
"C:\Program Files\Tailscale\tailscale.exe" funnel --bg 3000

echo.
echo ========================================
echo       Ville CV AI on kaynnistetty
echo ========================================
echo.
echo Proxy:  http://127.0.0.1:3000
echo Funnel: https://lahnae-cp.tail86cb63.ts.net/
echo.
echo AI-chat on nyt kaytettavissa.
echo.
pause
