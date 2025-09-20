#!/bin/bash

# House Price Prediction Engine Deployment Script

echo "🏠 House Price Prediction Engine - Deployment Script"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p models
mkdir -p ssl
mkdir -p app/static/css
mkdir -p app/static/js
mkdir -p app/templates

# Check if model exists
if [ ! -f "models/lgb_model.pkl" ]; then
    echo "⚠️  Model file not found. Training model..."
    python train.py --mode train --data data/sample_properties.csv --model_output models/lgb_model.pkl
    if [ $? -eq 0 ]; then
        echo "✅ Model trained successfully"
    else
        echo "❌ Model training failed"
        exit 1
    fi
else
    echo "✅ Model file found"
fi

# Build and start services
echo "🚀 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running successfully!"
    echo ""
    echo "🌐 Your House Price Prediction Engine is now available at:"
    echo "   - Local: http://localhost"
    echo "   - Direct: http://localhost:5000"
    echo ""
    echo "📊 Health Check: http://localhost/health"
    echo ""
    echo "🛠️  To stop the services, run: docker-compose down"
    echo "📝 To view logs, run: docker-compose logs -f"
else
    echo "❌ Services failed to start. Check logs with: docker-compose logs"
    exit 1
fi
