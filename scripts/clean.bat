@echo off
echo ========================================
echo    ОЧИСТКА ПРОЕКТА
echo ========================================

echo Удаление node_modules бэкенда...
cd ..\backend
if exist node_modules rmdir node_modules /s /q

echo Удаление node_modules фронтенда...
cd ..\frontend
if exist node_modules rmdir node_modules /s /q

echo Удаление dist папки...
cd ..\backend
if exist dist rmdir dist /s /q

cd ..\frontend
if exist .next rmdir .next /s /q
if exist dist rmdir dist /s /q

echo ========================================
echo    ОЧИСТКА ЗАВЕРШЕНА!
echo ========================================
echo Запустите setup.bat для переустановки зависимостей
echo.
pause