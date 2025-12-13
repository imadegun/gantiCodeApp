#!/bin/bash

# Production Server Setup Script for ClientCode Management System

set -e

echo "🔧 Setting up production environment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_warning "Some operations may require sudo privileges"
fi

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    print_status "Docker installed successfully"
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed successfully"
fi

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Create app directory if it doesn't exist
APP_DIR="/opt/clientcode-management"
if [ ! -d "$APP_DIR" ]; then
    sudo mkdir -p "$APP_DIR"
    sudo chown $USER:$USER "$APP_DIR"
    print_status "Created application directory: $APP_DIR"
fi

print_status "Production setup completed! 🎉"
print_status "Next steps:"
echo "1. Copy your application files to: $APP_DIR"
echo "2. Navigate to: cd $APP_DIR"
echo "3. Run: ./deploy.sh"
echo ""
echo "🌐 Application will be available at: http://$(hostname -I | awk '{print $1}'):3000"