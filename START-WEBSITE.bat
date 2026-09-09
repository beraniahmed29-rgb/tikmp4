@echo off
REM TikMP4 - Double-click to put your site online. Just leave this window open.
cd /d "%~dp0"
echo Starting TikMP4 website...
start /min python -m http.server 8901 --directory "%~dp0"
timeout /t 4 /nobreak >nul
start "" "http://localhost:8901/index.html"
echo.
echo Your PUBLIC link will appear below. Share it, and add it to Adsterra:
echo.
npx --yes localtunnel --port 8901
pause
