@echo off
REM TikMP4 auto-start: server + stable public link https://tikmp4dz.loca.lt
cd /d "%~dp0"
start /min python -m http.server 8901 --directory "%~dp0"
timeout /t 4 /nobreak >nul
npx --yes localtunnel --port 8901 --subdomain tikmp4dz
