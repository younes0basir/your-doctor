@echo off
REM Doctor Appointment System - Production Deployment Script (Windows)
REM This script helps deploy the application using Docker

echo.
echo =========================================
echo Doctor Appointment System - Production Deployment
echo =========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed.
    pause
    exit /b 1
)

echo [OK] Docker and Docker Compose found
echo.

REM Check if .env file exists
if not exist .env (
    echo [WARNING] .env file not found!
    
    if exist .env.example (
        echo Creating from .env.example...
        copy .env.example .env
        echo.
        echo [OK] Created .env file from template
        echo.
        echo [IMPORTANT] Edit .env file with your production values before continuing!
        echo Press any key to continue after editing, or close this window to cancel...
        pause >nul
    ) else (
        echo [ERROR] .env.example not found. Please create .env file manually.
        pause
        exit /b 1
    )
)

echo [INFO] Building Docker images...
docker-compose build
if %errorlevel% neq 0 (
    echo [ERROR] Docker build failed!
    pause
    exit /b 1
)

echo.
echo [INFO] Starting services...
docker-compose up -d

echo.
echo [INFO] Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo [INFO] Checking service health...
docker-compose ps

echo.
echo [SUCCESS] Deployment complete!
echo.
echo Service Status:
docker-compose ps
echo.
echo Access your application:
echo    Frontend: http://localhost
echo    Backend API: http://localhost:5000
echo.
echo Useful Commands:
echo    View logs: docker-compose logs -f
echo    Stop services: docker-compose down
echo    Restart services: docker-compose restart
echo.
echo Your Doctor Appointment System is now running in production!
echo.
pause
