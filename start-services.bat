@echo off
echo Starting XItools services...

:: Start browser tools service
start cmd /c "npx @agentdeskai/browser-tools-server@latest"

:: Start backend service
start cmd /c "cd backend && npm run dev"

:: Start frontend service
start cmd /c "cd frontend && npm run dev"

echo All services started!
echo Browser tools service: Started in new window
echo Backend service: Started in new window
echo Frontend service: Started in new window 