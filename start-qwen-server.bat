@echo off
echo =======================================
echo     ToolSlap Qwen AI Server Startup
echo =======================================
echo.

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

echo.
echo Checking if requirements are installed...
python -c "import fastapi, uvicorn, torch, transformers" 2>nul
if errorlevel 1 (
    echo Installing required packages...
    pip install -r qwen-requirements.txt
    if errorlevel 1 (
        echo ERROR: Failed to install requirements
        pause
        exit /b 1
    )
) else (
    echo All requirements are already installed!
)

echo.
echo Starting Qwen API Server...
echo Server will be available at: http://localhost:8001
echo API Documentation: http://localhost:8001/docs
echo.
echo Press Ctrl+C to stop the server
echo =======================================
echo.

python qwen-api-server.py

echo.
echo Server stopped.
pause
