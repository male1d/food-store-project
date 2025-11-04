@echo off
echo ========================================
echo    FOOD STORE PROJECT SETUP
echo ========================================

echo Шаг 1: Устанавка зависимостей бэкенда...
cd ..\backend
call npm install
if %errorlevel% neq 0 (
    echo ОШИБКА: Не удалось установить зависимости бэкенда
    pause
    exit /b 1
)

echo Шаг 2: Устанавка зависимостей фронтенда...
cd ..\frontend  
call npm install
if %errorlevel% neq 0 (
    echo ОШИБКА: Не удалось установить зависимости фронтенда
    pause
    exit /b 1
)

echo ========================================
echo    ВСЕ ЗАВИСИМОСТИ УСПЕШНО УСТАНОВЛЕНЫ!
echo ========================================
echo Команды для запуска:
echo   Бэкенд:  cd backend && npm run start:dev
echo   Фронтенд: cd frontend && npm run dev
echo.
pause