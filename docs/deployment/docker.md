# 🐳 Docker Deployment Guide

This guide will help you deploy the AdoptMe application using Docker.

## 📋 Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## 🚀 Quick Start

### 1. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file with your configurations
# IMPORTANT: Change secrets in production
```

### 2. Build and Run

```bash
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

### 3. Verify Everything Works

- **Application**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/docs
- **MongoDB**: port 27017

## 🔧 Useful Commands

### Container Management

```bash
# View application logs
docker-compose logs -f adoptme-app

# View MongoDB logs
docker-compose logs -f mongodb

# Enter application container
docker-compose exec adoptme-app sh

# Enter MongoDB shell
docker-compose exec mongodb mongosh -u admin -p password123

# Stop all services
docker-compose down

# Stop and remove volumes (CAREFUL! This deletes the database)
docker-compose down -v
```

### Database Operations

```bash
# Database backup
docker-compose exec mongodb mongodump --uri="mongodb://admin:password123@localhost:27017/adoptme-db?authSource=admin" --out=/data/backup

# Restore backup
docker-compose exec mongodb mongorestore --uri="mongodb://admin:password123@localhost:27017/adoptme-db?authSource=admin" /data/backup/adoptme-db
```

## 🏗️ Docker Architecture

### Multi-stage Build

The `Dockerfile` uses a multi-stage build to optimize the final image size:

1. **Builder Stage**: Installs dependencies and compiles TypeScript
2. **Production Stage**: Only includes production dependencies and compiled code

### Services

- **adoptme-app**: NestJS application
- **mongodb**: MongoDB 7.0 database

### Volumes

- **mongodb_data**: MongoDB data persistence
- **uploads_data**: User uploaded files
- **logs**: Application logs

## 🔒 Security

### Critical Environment Variables

```bash
# Change in production
JWT_SECRET=your-super-secure-jwt-key-min-32-characters
SESSION_SECRET=your-super-secure-session-key-min-32-characters
MONGODB_URI=mongodb://user:password@host:port/database
```

### Non-Root User

The application runs with a non-root user (`nextjs:nodejs`) for security.

## 🌍 Production Deployment

### 1. Production Environment Variables

```bash
NODE_ENV=production
MONGODB_URI=mongodb://user:password@your-mongo-host:27017/adoptme-db
JWT_SECRET=production-jwt-secret-very-secure-min-32-chars
SESSION_SECRET=production-session-secret-very-secure-min-32-chars
FRONTEND_URL=https://your-domain.com
```

### 2. Docker Compose for Production

Create a `docker-compose.prod.yml`:

```yaml
version: '3.8'
services:
  adoptme-app:
    image: adoptme-app:latest
    environment:
      - NODE_ENV=production
      # ... other production variables
    restart: unless-stopped
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.adoptme.rule=Host(`your-domain.com`)'
```

### 3. Health Check

The image includes a health check that verifies the application responds correctly.

## 🐛 Troubleshooting

### Common Issues

1. **Port occupied**: Change port in `docker-compose.yml`
2. **File permissions**: Verify that the `uploads` directory has correct permissions
3. **MongoDB connection**: Verify that MongoDB is running correctly

### Debug Logs

```bash
# View all logs
docker-compose logs

# Specific logs with more detail
docker-compose logs -f --tail=100 adoptme-app
```

## 📊 Monitoring

### Health Check

```bash
# Verify health status
curl http://localhost:3000/api/health
```

### Container Metrics

```bash
# Resource usage
docker stats

# Detailed information
docker-compose exec adoptme-app top
```

## 🚀 Docker Hub

The application is available on Docker Hub for easy deployment:

**Docker Hub Repository**: [tukisito/adoptme-app](https://hub.docker.com/r/tukisito/adoptme-app)

### Available Tags

- `latest` - Most recent stable version
- `v1.0` - Version 1.0 release

### Pull and Run

```bash
# Pull from Docker Hub
docker pull tukisito/adoptme-app:latest

# Run standalone (requires separate MongoDB)
docker run -d \
  --name adoptme-app \
  -p 3000:3000 \
  -e MONGODB_URI="mongodb://your-mongo-host:27017/adoptme-db" \
  -e JWT_SECRET="your-jwt-secret" \
  -e SESSION_SECRET="your-session-secret" \
  tukisito/adoptme-app:latest
```
