@echo off
echo Starting XItools services...

echo Starting browser tools service...
start "XItools-Browser" cmd /k "npx @agentdeskai/browser-tools-server@latest"

echo Starting backend service...
start "XItools-Backend" cmd /k "cd backend && npm run dev"

echo Starting frontend service...
start "XItools-Frontend" cmd /k "cd frontend && npm run dev"

echo All services started successfully.
echo 要停止服务，请在任务管理器中手动关闭相关的命令窗口 