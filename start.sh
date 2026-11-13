#!/bin/bash

# Markdown Reader - Start Script
# This script installs dependencies and starts the Electron app

set -e  # Exit on error

echo "🚀 Starting Markdown Reader..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
else
    echo "✅ Dependencies already installed"
    echo ""
fi

# Start the app
echo "🎨 Starting Electron app..."
echo ""
npm run electron:dev

