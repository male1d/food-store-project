@echo off
echo ========================================
echo    ЗАПУСК РЕЖИМА РАЗРАБОТКИ
echo ========================================

echo Запуск бэкенд сервера (Nest.js)...
start "Food Store Backend" cmd /k "cd /d %~dp0..\backend && npm run start:dev"

echo Ждем 5 секунд для запуска бэкенда...
timeout /t 5 /nobreak

echo Запуск фронтен сервер (Next.js)...
start "Food Store Frontend" cmd /k "cd /d %~dp0..\frontend && npm run dev"

echo ========================================
echo        СЕРВЕРЫ ЗАПУЩЕНЫ!
echo ========================================
echo Фронтенд: http://localhost:4000
echo Бэкенд:   http://localhost:3000
echo.
echo Чтобы остановить: закройте оба окна терминала
echo.
pause