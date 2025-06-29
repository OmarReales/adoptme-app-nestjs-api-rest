# 🐳 Docker Deployment Guide

Esta guía te ayudará a hacer deploy de la aplicación AdoptMe usando Docker.

## 📋 Prerrequisitos

- Docker (versión 20.10 o superior)
- Docker Compose (versión 2.0 o superior)

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita el archivo .env con tus configuraciones
# IMPORTANTE: Cambia los secretos en producción
```

### 2. Construir y Ejecutar

```bash
# Construir y ejecutar todos los servicios
docker-compose up --build

# Ejecutar en segundo plano
docker-compose up -d --build
```

### 3. Verificar que todo funciona

- **Aplicación**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/docs
- **MongoDB**: puerto 27017

## 🔧 Comandos Útiles

### Gestión de Contenedores

```bash
# Ver logs de la aplicación
docker-compose logs -f adoptme-app

# Ver logs de MongoDB
docker-compose logs -f mongodb

# Entrar al contenedor de la aplicación
docker-compose exec adoptme-app sh

# Entrar a MongoDB shell
docker-compose exec mongodb mongosh -u admin -p password123

# Parar todos los servicios
docker-compose down

# Parar y eliminar volúmenes (¡CUIDADO! Borra la base de datos)
docker-compose down -v
```

### Base de Datos

```bash
# Backup de la base de datos
docker-compose exec mongodb mongodump --uri="mongodb://admin:password123@localhost:27017/adoptme-db?authSource=admin" --out=/data/backup

# Restaurar backup
docker-compose exec mongodb mongorestore --uri="mongodb://admin:password123@localhost:27017/adoptme-db?authSource=admin" /data/backup/adoptme-db
```

## 🏗️ Arquitectura Docker

### Multi-stage Build

El `Dockerfile` utiliza un build multi-etapa para optimizar el tamaño final de la imagen:

1. **Builder Stage**: Instala dependencias y compila TypeScript
2. **Production Stage**: Solo incluye dependencias de producción y código compilado

### Servicios

- **adoptme-app**: Aplicación NestJS
- **mongodb**: Base de datos MongoDB 7.0

### Volúmenes

- **mongodb_data**: Persistencia de datos de MongoDB
- **uploads_data**: Archivos subidos por usuarios
- **logs**: Logs de la aplicación

## 🔒 Seguridad

### Variables de Entorno Críticas

```bash
# Cambiar en producción
JWT_SECRET=tu-clave-jwt-super-secreta-min-32-caracteres
SESSION_SECRET=tu-clave-sesion-super-secreta-min-32-caracteres
MONGODB_URI=mongodb://usuario:password@host:puerto/database
```

### Usuario No-Root

La aplicación ejecuta con un usuario no-root (`nextjs:nodejs`) por seguridad.

## 🌍 Despliegue en Producción

### 1. Variables de Entorno de Producción

```bash
NODE_ENV=production
MONGODB_URI=mongodb://usuario:password@tu-mongo-host:27017/adoptme-db
JWT_SECRET=clave-jwt-produccion-muy-segura-min-32-chars
SESSION_SECRET=clave-sesion-produccion-muy-segura-min-32-chars
FRONTEND_URL=https://tu-dominio.com
```

### 2. Docker Compose para Producción

Crea un `docker-compose.prod.yml`:

```yaml
version: '3.8'
services:
  adoptme-app:
    image: adoptme-app:latest
    environment:
      - NODE_ENV=production
      # ... otras variables de producción
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.adoptme.rule=Host(\`tu-dominio.com\`)"
```

### 3. Health Check

La imagen incluye un health check que verifica que la aplicación responda correctamente.

## 🐛 Troubleshooting

### Problemas Comunes

1. **Puerto ocupado**: Cambiar puerto en `docker-compose.yml`
2. **Permisos de archivos**: Verificar que el directorio `uploads` tenga permisos correctos
3. **Conexión MongoDB**: Verificar que MongoDB esté ejecutándose correctamente

### Logs de Debug

```bash
# Ver todos los logs
docker-compose logs

# Logs específicos con más detalle
docker-compose logs -f --tail=100 adoptme-app
```

## 📊 Monitoreo

### Health Check

```bash
# Verificar estado de salud
curl http://localhost:3000/api/health
```

### Métricas de Contenedor

```bash
# Uso de recursos
docker stats

# Información detallada
docker-compose exec adoptme-app top
```
