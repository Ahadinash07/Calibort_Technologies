#!/bin/bash

echo "🚀 User Management System - Setup Script"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before continuing!"
    echo "   Required: DB_PASSWORD, JWT_SECRET"
    exit 1
fi

echo "📦 Installing backend dependencies..."
cd server
npm install

echo ""
echo "📦 Installing frontend dependencies..."
cd ../client
npm install

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your MySQL credentials"
echo "2. Create MySQL database: CREATE DATABASE user_management;"
echo "3. Start backend: cd server && npm run dev"
echo "4. Start frontend: cd client && npm start"
echo ""
echo "🌐 Application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
