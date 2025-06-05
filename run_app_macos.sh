#!/bin/bash

# macOS-specific SizePredict Application Launcher
# Optimized for macOS systems with Homebrew integration

set -e  # Exit on any error

echo "🍎 Starting SizePredict Application (macOS Optimized)..."
echo

# Color output for better macOS terminal experience
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed for macOS systems only."
    exit 1
fi

print_success "Detected macOS system"

# Check if Homebrew is installed (recommended for macOS)
if command -v brew &> /dev/null; then
    print_success "Homebrew detected"
    BREW_AVAILABLE=true
else
    print_warning "Homebrew not found. Consider installing it for better dependency management."
    BREW_AVAILABLE=false
fi

# Check Python installation (prefer Homebrew Python on macOS)
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_success "Python $PYTHON_VERSION detected"
    
    # Check if it's Homebrew Python (recommended for macOS)
    PYTHON_PATH=$(which python3)
    if [[ "$PYTHON_PATH" == *"/opt/homebrew/"* ]] || [[ "$PYTHON_PATH" == *"/usr/local/"* ]]; then
        print_success "Using Homebrew Python (recommended)"
    else
        print_warning "Using system Python. Consider installing Python via Homebrew for better compatibility."
    fi
else
    print_error "Python 3 is not installed."
    if [[ "$BREW_AVAILABLE" == true ]]; then
        echo "Install with: brew install python"
    else
        echo "Please install Python 3.8+ from python.org or install Homebrew first."
    fi
    exit 1
fi

# Check Node.js installation (prefer Homebrew Node on macOS)
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js $NODE_VERSION detected"
    
    # Check if it's Homebrew Node
    NODE_PATH=$(which node)
    if [[ "$NODE_PATH" == *"/opt/homebrew/"* ]] || [[ "$NODE_PATH" == *"/usr/local/"* ]]; then
        print_success "Using Homebrew Node.js (recommended)"
    fi
else
    print_error "Node.js is not installed."
    if [[ "$BREW_AVAILABLE" == true ]]; then
        echo "Install with: brew install node"
    else
        echo "Please install Node.js 14+ from nodejs.org or install Homebrew first."
    fi
    exit 1
fi

# Check if we're in the correct directory
if [[ ! -d "backend" ]] || [[ ! -d "frontend" ]]; then
    print_error "Please run this script from the FitFrame project root directory."
    exit 1
fi

print_status "Installing backend dependencies..."
cd backend

# Use pip3 explicitly on macOS
if command -v pip3 &> /dev/null; then
    pip3 install -r requirements.txt
else
    python3 -m pip install -r requirements.txt
fi

# Check if OpenPose models exist
if [[ ! -f "models/openpose/pose/coco/pose_deploy_linevec.prototxt" ]]; then
    print_status "Downloading OpenPose models..."
    python3 download_models.py
fi

print_status "Starting Backend Server..."
python3 -m uvicorn main:app --reload &
BACKEND_PID=$!

print_status "Waiting for backend to initialize..."
sleep 5

print_status "Installing frontend dependencies and starting server..."
cd ../frontend

# Check if node_modules exists, if not run npm install
if [[ ! -d "node_modules" ]]; then
    print_status "Installing frontend dependencies..."
    npm install
fi

npm run dev &
FRONTEND_PID=$!

echo
print_success "🚀 SizePredict servers are starting..."
echo
echo -e "${BLUE}Backend API:${NC} http://localhost:8000"
echo -e "${BLUE}Frontend App:${NC} http://localhost:5173"
echo
echo -e "${YELLOW}Press Ctrl+C to stop the servers...${NC}"
echo

# macOS-specific: Open the app in default browser after a delay
(sleep 8 && open http://localhost:5173) &

# Enhanced cleanup function for macOS
function cleanup {
    echo
    print_status "Stopping servers..."
    
    # Kill process groups to ensure all child processes are terminated
    if [[ -n "$BACKEND_PID" ]]; then
        kill -TERM -$BACKEND_PID 2>/dev/null || true
    fi
    
    if [[ -n "$FRONTEND_PID" ]]; then
        kill -TERM -$FRONTEND_PID 2>/dev/null || true
    fi
    
    # Wait a moment for graceful shutdown
    sleep 2
    
    # Force kill if still running
    kill -KILL -$BACKEND_PID -$FRONTEND_PID 2>/dev/null || true
    
    print_success "Servers stopped successfully"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM EXIT

# Wait for user to cancel
wait