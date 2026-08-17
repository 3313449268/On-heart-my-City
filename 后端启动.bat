@echo off
chcp 65001 >nul
echo ======================================
echo 访问地址：http://localhost:5173/admin/login
echo ======================================
echo.
cd server
npm run dev
pause