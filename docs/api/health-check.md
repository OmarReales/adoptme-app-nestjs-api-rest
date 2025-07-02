# 🏥 Health Check Endpoints - AdoptMe API

## 📋 Overview

The AdoptMe API provides health check endpoints to monitor the service status. These endpoints are essential for:

- **Load balancers** to determine if the service is ready to receive traffic
- **Monitoring systems** to track service availability
- **Container orchestration** (Docker, Kubernetes) for health checks
- **CI/CD pipelines** to verify deployment success

## 🎯 Endpoints

### 1. Basic Health Check

**Endpoint:** `GET /health`

**Description:** Returns basic health status without external dependency checks.

**Response Example:**

```json
{
  "status": "healthy",
  "timestamp": "2025-07-02T10:30:00.000Z",
  "service": "AdoptMe API",
  "version": "1.0.0",
  "uptime": 3600,
  "environment": "production"
}
```

**Use Cases:**

- Load balancer health checks
- Container readiness probes
- Quick status verification

### 2. Detailed Health Check

**Endpoint:** `GET /health/detailed`

**Description:** Returns comprehensive health status including database connectivity.

**Response Example (Healthy):**

```json
{
  "status": "healthy",
  "timestamp": "2025-07-02T10:30:00.000Z",
  "service": "AdoptMe API",
  "version": "1.0.0",
  "uptime": 3600,
  "environment": "production",
  "database": {
    "status": "connected",
    "message": "Connected"
  }
}
```

**Response Example (Unhealthy):**

```json
{
  "status": "unhealthy",
  "timestamp": "2025-07-02T10:30:00.000Z",
  "service": "AdoptMe API",
  "version": "1.0.0",
  "uptime": 3600,
  "environment": "production",
  "database": {
    "status": "error",
    "message": "Database connection check failed"
  }
}
```

**Use Cases:**

- Comprehensive monitoring
- Dependency verification
- Troubleshooting connectivity issues

## 🔧 Configuration

### Environment Variables

| Variable      | Description               | Default                                |
| ------------- | ------------------------- | -------------------------------------- |
| `NODE_ENV`    | Application environment   | `development`                          |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/adoptme-db` |

### Response Status Codes

| Endpoint           | Success  | Error                       |
| ------------------ | -------- | --------------------------- |
| `/health`          | `200 OK` | `500 Internal Server Error` |
| `/health/detailed` | `200 OK` | `503 Service Unavailable`   |

## 🐳 Docker Health Check

Update your `Dockerfile` to use the health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

## 🎯 Monitoring Integration

### Prometheus

```yaml
- job_name: 'adoptme-api'
  static_configs:
    - targets: ['localhost:3000']
  metrics_path: '/health'
  scrape_interval: 30s
```

### Kubernetes

```yaml
apiVersion: v1
kind: Pod
spec:
  containers:
    - name: adoptme-api
      readinessProbe:
        httpGet:
          path: /health
          port: 3000
        initialDelaySeconds: 5
        periodSeconds: 10
      livenessProbe:
        httpGet:
          path: /health/detailed
          port: 3000
        initialDelaySeconds: 30
        periodSeconds: 30
```

## 🚀 Best Practices

1. **Use `/health` for load balancers** - Fast and lightweight
2. **Use `/health/detailed` for monitoring** - Comprehensive status
3. **Set appropriate timeouts** - Health checks should respond quickly
4. **Monitor both endpoints** - Different use cases require different information
5. **Log health check failures** - Important for debugging

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB connection string
   - Verify network connectivity
   - Check database server status

2. **High Response Times**
   - Monitor database performance
   - Check network latency
   - Review application logs

3. **Intermittent Failures**
   - Check connection pool settings
   - Monitor resource usage
   - Review error logs

### Example Test Commands

```bash
# Basic health check
curl -X GET http://localhost:3000/health

# Detailed health check
curl -X GET http://localhost:3000/health/detailed

# Health check with timing
curl -w "Time: %{time_total}s\n" -X GET http://localhost:3000/health
```

## 📊 Metrics Information

### Response Fields

| Field              | Type   | Description                                   |
| ------------------ | ------ | --------------------------------------------- |
| `status`           | string | Overall health status (`healthy`/`unhealthy`) |
| `timestamp`        | string | ISO timestamp of the check                    |
| `service`          | string | Service name                                  |
| `version`          | string | API version                                   |
| `uptime`           | number | Process uptime in seconds                     |
| `environment`      | string | Current environment                           |
| `database.status`  | string | Database connection status                    |
| `database.message` | string | Detailed database status message              |

---

**Note:** The health check endpoints are excluded from authentication requirements and request logging to ensure they remain lightweight and fast.
