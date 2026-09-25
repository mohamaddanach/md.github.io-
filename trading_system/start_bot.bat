@echo off
REM Starts the trading bot and restarts it automatically if it stops.
REM Put a shortcut to this file in the Windows Startup folder (Win+R -> shell:startup).
cd /d "%~dp0"
echo Waiting 60 seconds for MetaTrader 5 and the internet connection...
timeout /t 60 /nobreak
:loop
.venv\Scripts\python.exe main.py
echo Bot stopped. Restarting in 30 seconds (close this window to stop for good)...
timeout /t 30 /nobreak
goto loop
