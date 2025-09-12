@echo off
title ToolSlap Production Server

echo ====================================
echo     ToolSlap Production Startup
echo ====================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if PM2 is installed globally
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing PM2 globally...
    npm install -g pm2
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install PM2
        pause
        exit /b 1
    )
)

REM Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Install additional production dependencies
echo Installing production dependencies...
npm install winston node-fetch --save
if %errorlevel% neq 0 (
    echo WARNING: Some production dependencies may not have installed correctly
)

REM Create logs directory
if not exist logs mkdir logs

REM Stop any existing PM2 processes
echo Stopping existing processes...
pm2 delete all >nul 2>&1

REM Start the production server
echo Starting ToolSlap Production Server...
pm2 start ecosystem.config.js --env production

REM Show process status
echo.
echo Current process status:
pm2 status

REM Enable PM2 startup on system boot (Windows)
echo.
echo Setting up automatic startup...
pm2 startup
pm2 save

echo.
echo ====================================
echo  ToolSlap Production Server Started
echo ====================================
echo.
echo Server URL: http://localhost:8001
echo Health Check: http://localhost:8001/health
echo PM2 Monitoring: http://localhost:9615
echo.
echo Commands:
echo   pm2 status          - View process status
echo   pm2 logs            - View logs
echo   pm2 restart all     - Restart all processes
echo   pm2 stop all        - Stop all processes
echo   pm2 delete all      - Delete all processes
echo.
echo The server is now running 24/7!
echo Close this window safely - the server will continue running.
echo.
pause