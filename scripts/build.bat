@echo off
echo ========================================
echo    СБОРКА ПРОЕКТА ДЛЯ PRODUCTION
echo ========================================

echo Сборка бэкенда...
cd ..\backend
call npm run build
if %errorlevel% neq 0 (
    echo ОШИБКА СБОРКИ БЭКЕНДА!
    pause
    exit /b 1
)

echo Сборка фронтенда...
cd ..\frontend
call npm run build
if %errorlevel% neq 0 (
    echo ОШИБКА СБОРКИ ФРОНТЕНДА!
    pause
    exit /b 1
)

echo ========================================
echo    СБОРКА УСПЕШНО ЗАВЕРШЕНА!
echo ========================================
echo Файлы собраны в папках dist/ (бэкенд) и .next/ (фронтенд)
echo.
echo Для запуска в продакшене:
echo   Бэкенд:  cd backend && npm run start:prod
echo   Фронтенд: cd frontend && npm run start
echo.
pause