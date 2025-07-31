#!/bin/bash

# DevClock Monitoring Development Server Script

# Function to cleanup background processes
cleanup() {
    echo "Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "Starting DevClock Monitoring in development mode..."

# Ensure Maven wrapper is executable
chmod +x mvnw

# Start backend
echo "Starting Java backend..."
./mvnw spring-boot:run &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 5

# Start frontend
echo "Starting React frontend..."
cd frontend
npm install
npm start &
FRONTEND_PID=$!

echo "Backend running on http://localhost:8080"
echo "Frontend running on http://localhost:3000"
echo "Press Ctrl+C to stop both servers"

# Wait for background processes
wait
