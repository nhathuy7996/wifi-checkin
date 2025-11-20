#!/bin/bash

echo "🚀 Starting WiFi Checker Backend..."
echo ""

cd BE

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env not found, copying from .env.example..."
    cp .env.example .env
    echo "✅ Please edit BE/.env with your configuration"
    echo ""
fi

echo "✅ Starting server..."
echo "📡 API will be available at http://localhost:3000"
echo ""

npm start
