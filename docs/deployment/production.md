# 🚀 Production Deployment Checklist

Complete guide for deploying AdoptMe to production environments.

## 📋 Pre-Deployment Checklist

### ✅ Environment Configuration

- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB URI
- [ ] Set strong secrets (minimum 32 characters)
- [ ] Configure CORS for production domains
- [ ] Set up SSL/TLS certificates
- [ ] Configure production logging
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy

### ✅ Security Requirements

- [ ] Change default `SESSION_SECRET`
- [ ] Change default `JWT_SECRET`
- [ ] Configure rate limiting for production
- [ ] Set up firewall rules
- [ ] Configure secure headers
- [ ] Enable HTTPS enforcement
- [ ] Set up security monitoring

### ✅ Performance Optimization

- [ ] Configure MongoDB indexes
- [ ] Set up connection pooling
- [ ] Configure caching strategy
- [ ] Optimize images and static assets
- [ ] Set up CDN for static content
- [ ] Configure gzip compression

---

## 🔐 Production Environment Variables

### Required Environment Variables

```env
# Application
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://username:password@prod-mongo-host:27017/adoptme-db?authSource=admin

# Authentication & Security
SESSION_SECRET=your-super-secure-production-session-secret-min-32-chars
JWT_SECRET=your-super-secure-production-jwt-secret-min-32-chars

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Frontend
FRONTEND_URL=https://your-production-domain.com

# Email (Optional)
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-secure-app-password
```

### Security Best Practices

```env
# Use strong, unique secrets (minimum 32 characters)
SESSION_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# Use specific database credentials
MONGODB_URI=mongodb://adoptme_user:complex_password@mongo-cluster:27017/adoptme_production?authSource=admin

# Configure specific CORS origins
FRONTEND_URL=https://adoptme.your-domain.com
```

---

## 🐳 Docker Production Deployment

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  adoptme-app:
    image: tukisito/adoptme-app:latest
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - SESSION_SECRET=${SESSION_SECRET}
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
      - THROTTLE_LIMIT=60
    ports:
      - '3000:3000'
    volumes:
      - uploads_data:/app/public/uploads
      - logs_data:/app/logs
    depends_on:
      - mongodb
    networks:
      - adoptme_network

  mongodb:
    image: mongo:7.0
    restart: unless-stopped
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USER}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASS}
      - MONGO_INITDB_DATABASE=adoptme-db
    volumes:
      - mongodb_data:/data/db
      - ./scripts/init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro
    networks:
      - adoptme_network

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - adoptme-app
    networks:
      - adoptme_network

volumes:
  mongodb_data:
  uploads_data:
  logs_data:

networks:
  adoptme_network:
    driver: bridge
```

### Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream adoptme_app {
        server adoptme-app:3000;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS Configuration
    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;

        # Security Headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Gzip Compression
        gzip on;
        gzip_vary on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        location / {
            proxy_pass http://adoptme_app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Static files caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            proxy_pass http://adoptme_app;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

---

## ☁️ Cloud Platform Deployment

### AWS Deployment

#### Using AWS ECS with Fargate

1. **Create ECS Cluster**

```bash
aws ecs create-cluster --cluster-name adoptme-cluster
```

2. **Create Task Definition**

```json
{
  "family": "adoptme-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "adoptme-app",
      "image": "tukisito/adoptme-app:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "MONGODB_URI",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:adoptme/mongodb-uri"
        },
        {
          "name": "SESSION_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:adoptme/session-secret"
        }
      ]
    }
  ]
}
```

#### Using AWS DocumentDB for MongoDB

```bash
# Create DocumentDB cluster
aws docdb create-db-cluster \
    --db-cluster-identifier adoptme-docdb \
    --engine docdb \
    --master-username adoptme_admin \
    --master-user-password "SecurePassword123"
```

### Google Cloud Platform

#### Using Cloud Run

```bash
# Build and push to Container Registry
docker build -t gcr.io/your-project/adoptme-app .
docker push gcr.io/your-project/adoptme-app

# Deploy to Cloud Run
gcloud run deploy adoptme-app \
    --image gcr.io/your-project/adoptme-app \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars NODE_ENV=production
```

### Azure Container Instances

```bash
# Create resource group
az group create --name adoptme-rg --location eastus

# Deploy container
az container create \
    --resource-group adoptme-rg \
    --name adoptme-app \
    --image tukisito/adoptme-app:latest \
    --dns-name-label adoptme-app \
    --ports 3000 \
    --environment-variables NODE_ENV=production
```

---

## 📊 Monitoring & Logging

### Application Monitoring

#### Health Check Endpoint

```bash
# Set up health check monitoring
curl https://your-domain.com/api/health
```

#### Log Aggregation

```yaml
# Add logging driver to docker-compose
services:
  adoptme-app:
    logging:
      driver: 'json-file'
      options:
        max-size: '100m'
        max-file: '5'
```

#### Monitoring with Prometheus

Create `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'adoptme'
    static_configs:
      - targets: ['adoptme-app:3000']
```

---

## 🔄 Database Management

### MongoDB Production Setup

#### Replica Set Configuration

```javascript
// Initialize replica set
rs.initiate({
  _id: 'rs0',
  members: [
    { _id: 0, host: 'mongo1:27017' },
    { _id: 1, host: 'mongo2:27017' },
    { _id: 2, host: 'mongo3:27017' },
  ],
});
```

#### Database Indexes

```javascript
// Create performance indexes
db.pets.createIndex({ species: 1, status: 1 });
db.pets.createIndex({ name: 'text', description: 'text' });
db.users.createIndex({ email: 1 }, { unique: true });
db.adoptions.createIndex({ user: 1, status: 1 });
```

#### Backup Strategy

```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="mongodb://user:pass@host:27017/adoptme-db" --out="/backups/adoptme_$DATE"
tar -czf "/backups/adoptme_$DATE.tar.gz" "/backups/adoptme_$DATE"
rm -rf "/backups/adoptme_$DATE"

# Keep only last 7 days of backups
find /backups -name "adoptme_*.tar.gz" -mtime +7 -delete
```

---

## 🔐 SSL/TLS Configuration

### Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Manual SSL Certificate

```bash
# Generate private key
openssl genrsa -out privkey.pem 2048

# Generate certificate signing request
openssl req -new -key privkey.pem -out cert.csr

# Generate self-signed certificate (for testing)
openssl x509 -req -days 365 -in cert.csr -signkey privkey.pem -out fullchain.pem
```

---

## 🚨 Disaster Recovery

### Backup Procedures

1. **Database Backups**
   - Daily automated backups
   - Point-in-time recovery capability
   - Cross-region backup storage

2. **Application Backups**
   - Configuration files
   - Upload directories
   - SSL certificates

3. **Recovery Testing**
   - Monthly recovery drills
   - Documentation of recovery procedures
   - RTO/RPO targets defined

### High Availability Setup

```yaml
# Multi-instance deployment
services:
  adoptme-app:
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
```

---

## 📈 Performance Optimization

### Application Performance

- Enable compression middleware
- Implement caching strategies
- Optimize database queries
- Use connection pooling
- Monitor memory usage

### Database Performance

- Create appropriate indexes
- Optimize query patterns
- Monitor slow queries
- Implement read replicas
- Use aggregation pipelines

### Network Performance

- Configure CDN for static assets
- Enable HTTP/2
- Implement gzip compression
- Optimize image sizes
- Use cache headers

---

## 🔍 Troubleshooting

### Common Production Issues

#### Application Won't Start

```bash
# Check logs
docker-compose logs adoptme-app

# Common issues:
# - Environment variables not set
# - Database connection failed
# - Port already in use
```

#### High Memory Usage

```bash
# Monitor memory usage
docker stats

# Optimize Node.js memory
NODE_OPTIONS="--max-old-space-size=512"
```

#### Database Connection Issues

```bash
# Test MongoDB connection
mongosh "mongodb://user:pass@host:27017/adoptme-db"

# Check network connectivity
telnet mongo-host 27017
```

### Performance Issues

```bash
# Monitor application performance
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com

# Check database performance
db.runCommand({serverStatus: 1})
```

---

## 📞 Production Support

### Monitoring Alerts

Set up alerts for:

- Application downtime
- High error rates
- Database connection failures
- High memory/CPU usage
- SSL certificate expiration

### Incident Response

1. **Immediate Response**
   - Check application health
   - Review recent deployments
   - Check system resources

2. **Investigation**
   - Analyze logs
   - Check monitoring dashboards
   - Verify database connectivity

3. **Resolution**
   - Apply fixes
   - Monitor recovery
   - Document incident

### Maintenance Windows

- Schedule regular updates
- Test in staging environment
- Communicate downtime to users
- Have rollback plan ready

---

This production checklist ensures a secure, performant, and reliable deployment of the AdoptMe application.
