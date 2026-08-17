@echo off
chcp 65001 >nul
:: 执行启动命令
npm run dev
:: 防止窗口闪退，按任意键关闭
pause