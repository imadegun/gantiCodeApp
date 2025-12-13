# ClientCode Management System - Docker Deployment Guide

## 🐳 Docker Deployment on Linux Server

This guide will help you deploy your ClientCode Management System using Docker on your Linux server.

### 📋 Prerequisites

- Linux server with Docker and Docker Compose installed
- Network access to MySQL database at `gayafusion-db` or `10.16.5.6`
- MySQL user credentials:
  - Host: `gayafusion-db` or `10.16.5.6`
  - Username: `GayaIT`
  - Password: `GF-Sys@80571`
  - Database: `gayafusionall`

### 🚀 Quick Deployment

#### 1. Prepare Files
Ensure you have these files in your project directory:
- `Dockerfile`
- `docker-compose.yml`
- `.env.production`
- `deploy.sh`

#### 2. Deploy Application
```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment script
./deploy.sh
```

#### 3. Access Application
- **Application URL**: `http://your-server-ip:3000`
- **Health Check**: `http://your-server-ip:3000/api/health`

### 🔧 Configuration Files

#### `.env.production`
```env
NODE_ENV=production
MYSQL_HOST=gayafusion-db
MYSQL_USER=GayaIT
MYSQL_PASSWORD=GF-Sys@80571
MYSQL_DATABASE=gayafusionall
NEXT_PUBLIC_IMAGE_SERVER_URL=http://10.16.5.6/upload
```

#### `docker-compose.yml`
```yaml
version: '3.8'

services:
  clientcode-app:
    build: .
    container_name: clientcode-management
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MYSQL_HOST=gayafusion-db
      - MYSQL_USER=GayaIT
      - MYSQL_PASSWORD=GF-Sys@80571
      - MYSQL_DATABASE=gayafusionall
      - NEXT_PUBLIC_IMAGE_SERVER_URL=http://10.16.5.6/upload
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  app-network:
    driver: bridge
```

### 🛠️ Manual Deployment Steps

If you prefer manual deployment:

#### 1. Build Docker Image
```bash
docker build -t clientcode-management .
```

#### 2. Run Container
```bash
docker run -d \
  --name clientcode-management \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e MYSQL_HOST=gayafusion-db \
  -e MYSQL_USER=GayaIT \
  -e MYSQL_PASSWORD=GF-Sys@80571 \
  -e MYSQL_DATABASE=gayafusionall \
  -e NEXT_PUBLIC_IMAGE_SERVER_URL=http://10.16.5.6/upload \
  --restart unless-stopped \
  clientcode-management
```

### 📊 Monitoring & Management

#### View Application Logs
```bash
# View live logs
docker-compose logs -f clientcode-app

# View recent logs
docker-compose logs --tail=100 clientcode-app
```

#### Container Management
```bash
# Check container status
docker-compose ps

# Stop application
docker-compose down

# Restart application
docker-compose restart

# Update application
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### Health Check
```bash
# Check if application is responding
curl http://localhost:3000/api/health

# Check container health
docker inspect clientcode-management | grep Health -A 10
```

### 🔍 Troubleshooting

#### Database Connection Issues
```bash
# Test database connectivity from container
docker exec -it clientcode-management ping gayafusion-db

# Or test with IP
docker exec -it clientcode-management ping 10.16.5.6

# Check environment variables
docker exec -it clientcode-management env | grep MYSQL
```

#### Application Not Starting
```bash
# Check container logs
docker-compose logs clientcode-app

# Check if port is available
netstat -tlnp | grep 3000

# Check container status
docker ps -a | grep clientcode-management
```

#### Image Display Issues
1. Verify image server accessibility: `http://10.16.5.6/upload/your-image.jpg`
2. Check network connectivity between Docker container and image server
3. Verify firewall settings

### 🔒 Security Considerations

#### Firewall Configuration
```bash
# Allow port 3000 (if using ufw)
sudo ufw allow 3000

# Or using iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

#### Network Security
- Consider using Docker networks for isolation
- Limit database access to application container only
- Use HTTPS in production (add reverse proxy)

### 🔄 Updates & Maintenance

#### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### Backup Configuration
```bash
# Backup docker-compose configuration
cp docker-compose.yml docker-compose.yml.backup

# Backup environment file
cp .env.production .env.production.backup
```

### 🌐 Reverse Proxy (Optional)

For production use, consider adding a reverse proxy like Nginx:

#### Nginx Configuration Example
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 📱 Access from Network

Once deployed, users can access the application from any device on your network using:
```
http://your-server-ip:3000
```

### 🎯 Production Checklist

- [ ] Database connectivity tested
- [ ] Image server accessible
- [ ] Firewall configured for port 3000
- [ ] Application responds to health checks
- [ ] Logs are being collected
- [ ] Restart policy configured
- [ ] Backup strategy in place
- [ ] Monitoring setup (optional)

---

## 🎉 Deployment Complete!

Your ClientCode Management System is now running in Docker on your Linux server with full connectivity to your MySQL database!