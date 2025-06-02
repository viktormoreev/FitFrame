#!/bin/bash

echo "Starting SizePredict Application..."
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python is not installed. Please install Python 3.8+."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 14+."
    exit 1
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt

# Check if OpenPose models exist
if [ ! -f "models/openpose/pose/coco/pose_deploy_linevec.prototxt" ]; then
    echo "Downloading OpenPose models..."
    python3 download_models.py
fi

echo "Starting Backend Server..."
python3 -m uvicorn main:app --reload &
BACKEND_PID=$!

echo "Waiting for backend to initialize..."
sleep 5

echo "Starting Frontend Server..."
cd ../frontend && npm start &
FRONTEND_PID=$!

echo
echo "SizePredict servers are starting..."
echo
echo "Backend API: http://localhost:8000"
echo "Frontend App: http://localhost:3000"
echo
echo "Press Ctrl+C to stop the servers..."

# Handle clean exit
function cleanup {
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for user to cancel
wait