@echo off
echo Starting SizePredict Application...
echo.

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH. Please install Python 3.8+.
    goto :error
)

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed or not in PATH. Please install Node.js 14+.
    goto :error
)

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
pip install -r requirements.txt
cd ..

REM Check if OpenPose models exist
if not exist "backend\models\openpose\pose\coco\pose_deploy_linevec.prototxt" (
    echo Downloading OpenPose models...
    cd backend
    python download_models.py
    cd ..
)

echo Starting Backend Server...
start cmd /k "cd backend && python -m uvicorn main:app --reload"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo Starting Frontend Server...
start cmd /k "cd frontend && npm run dev"

echo.
echo SizePredict servers are starting...
echo.
echo Backend API: http://localhost:8000
echo Frontend App: http://localhost:8080
echo.
echo Press any key to stop the servers...
pause >nul

echo Stopping servers...
taskkill /f /im node.exe >nul 2>nul
taskkill /f /im python.exe >nul 2>nul
goto :eof

:error
echo.
echo Setup failed. Please check the requirements in the README.md file.
pause
exit /b 1