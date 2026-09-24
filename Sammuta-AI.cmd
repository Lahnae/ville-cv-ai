@echo off
title Ville CV AI - Shutdown

echo.
echo ========================================
echo       Ville CV AI - Sammutus
echo ========================================
echo.

echo [1/2] Sammutetaan Tailscale Funnel...
"C:\Program Files\Tailscale\tailscale.exe" funnel --https=443 off

echo.
echo [2/2] Sammutetaan Ollama-proxy...
taskkill /FI "WINDOWTITLE eq Ville CV AI - Proxy*" /T /F >nul 2>&1

echo.
echo ========================================
echo       Ville CV AI on sammutettu
echo ========================================
echo.
echo Ollama jatkaa edelleen taustalla.
echo.
pause
