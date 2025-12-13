#!/bin/bash

# ClientCode Management System - Docker Deployment Script
# For Linux Server Deployment

set -e

echo "🚀 Starting ClientCode Management System Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env.production exists
if [ ! -f .env.production ]; then
    print_error ".env.production file not found. Please create it first."
    exit 1
fi

print_status "Stopping any existing containers..."
docker-compose down

print_status "Building Docker image..."
docker-compose build --no-cache

print_status "Starting application container..."
docker-compose up -d

print_status "Waiting for application to start..."
sleep 10

# Check if container is running
if docker-compose ps | grep -q "Up"; then
    print_status "✅ Application is running successfully!"
    echo ""
    echo "🌐 Application URL: http://your-server-ip:3000"
    echo "📊 Health Check: http://your-server-ip:3000/api/health"
    echo ""
    echo "🔧 Useful Commands:"
    echo "  View logs: docker-compose logs -f"
    echo "  Stop app: docker-compose down"
    echo "  Restart app: docker-compose restart"
    echo "  View status: docker-compose ps"
    echo ""
    echo "📝 To check logs: docker-compose logs -f clientcode-app"
else
    print_error "❌ Application failed to start. Check logs with: docker-compose logs"
    exit 1
fi

print_status "Deployment completed successfully! 🎉"