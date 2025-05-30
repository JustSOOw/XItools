#!/bin/bash

echo "Starting XItools services..."

# Start browser tools service in background
echo "Starting browser tools service..."
(npx @agentdeskai/browser-tools-server@latest &) &

# Wait briefly to ensure the server starts
sleep 2

# Start backend service in background
echo "Starting backend service..."
(cd backend && npm run dev &) &

# Wait briefly
sleep 2

# Start frontend service in background
echo "Starting frontend service..."
(cd frontend && npm run dev &) &

echo "All services started!"
echo "Browser tools service: Running in background"
echo "Backend service: Running in background" 
echo "Frontend service: Running in background" 