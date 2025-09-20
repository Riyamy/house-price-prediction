@echo off
echo 🏠 House Price Prediction Engine - Deployment Script
echo ==================================================

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose are installed

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist "models" mkdir models
if not exist "ssl" mkdir ssl
if not exist "app\static\css" mkdir app\static\css
if not exist "app\static\js" mkdir app\static\js
if not exist "app\templates" mkdir app\templates

REM Check if model exists
if not exist "models\lgb_model.pkl" (
    echo ⚠️  Model file not found. Training model...
    python train.py --mode train --data data/sample_properties.csv --model_output models/lgb_model.pkl
    if %errorlevel% equ 0 (
        echo ✅ Model trained successfully
    ) else (
        echo ❌ Model training failed
        pause
        exit /b 1
    )
) else (
    echo ✅ Model file found
)

REM Build and start services
echo 🚀 Building and starting services...
docker-compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check if services are running
docker-compose ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo ✅ Services are running successfully!
    echo.
    echo 🌐 Your House Price Prediction Engine is now available at:
    echo    - Local: http://localhost
    echo    - Direct: http://localhost:5000
    echo.
    echo 📊 Health Check: http://localhost/health
    echo.
    echo 🛠️  To stop the services, run: docker-compose down
    echo 📝 To view logs, run: docker-compose logs -f
) else (
    echo ❌ Services failed to start. Check logs with: docker-compose logs
    pause
    exit /b 1
)

pause
