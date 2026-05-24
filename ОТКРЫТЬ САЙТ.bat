@echo off
chcp 65001 >nul
cd /d "%~dp0"
title swiftcrime
if not exist node_modules (
  echo Устанавливаю зависимости...
  call npm install
)
echo.
echo  Запуск swiftcrime...
echo  Браузер откроется через 3 сек
echo.
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"
npm start
pause
