#!/bin/bash

# Uplook Wellness API - Local Development Setup Script

set -e

echo "🚀 Setting up Uplook Wellness API for local development..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Start PostgreSQL and Redis with Docker Compose
echo "🐳 Starting PostgreSQL and Redis with Docker Compose..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ Failed to start services. Check Docker Compose logs:"
    docker-compose logs
    exit 1
fi

echo "✅ Services started successfully"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "🐍 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Install additional dependencies that might be missing
echo "📦 Installing additional dependencies..."
pip install email-validator

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://uplook_user:uplook_password@localhost:5432/uplook_db

# Clerk Configuration (get these from your Clerk dashboard)
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379/0

# Application Configuration
SECRET_KEY=your_local_secret_key_here
ENVIRONMENT=development
DEBUG=true

# AWS Configuration (optional for local development)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=uplook-storage
EOF
    echo "⚠️  Please update the .env file with your actual Clerk credentials"
fi

# Run database migrations
echo "🗄️  Running database migrations..."
alembic upgrade head

echo ""
echo "🎉 Setup complete! Your local development environment is ready."
echo ""
echo "Next steps:"
echo "1. Update the .env file with your Clerk credentials"
echo "2. Activate the virtual environment: source venv/bin/activate"
echo "3. Start the server: python main.py"
echo "4. Visit http://localhost:8000/docs for API documentation"
echo ""
echo "To stop the services: docker-compose down"
echo "To view logs: docker-compose logs -f" 