#!/bin/bash

# Script de construcción y despliegue para AdoptMe App
# Este script automatiza el proceso de build y deploy

set -e  # Salir si hay algún error

echo "🚀 Iniciando proceso de build y deploy de AdoptMe App..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging con colores
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    log_error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar que Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Verificar que existe el archivo .env
if [ ! -f .env ]; then
    log_warning "Archivo .env no encontrado. Copiando desde .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        log_info "Archivo .env creado. Por favor revisa y ajusta las variables de entorno."
    else
        log_error "Archivo .env.example no encontrado."
        exit 1
    fi
fi

# Limpiar contenedores e imágenes previas (opcional)
read -p "¿Deseas limpiar contenedores e imágenes previas? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Limpiando contenedores e imágenes previas..."
    docker-compose down -v || true
    docker system prune -f || true
    log_success "Limpieza completada"
fi

# Construir imágenes
log_info "Construyendo imágenes Docker..."
docker-compose build --no-cache

# Verificar que la construcción fue exitosa
if [ $? -eq 0 ]; then
    log_success "Imágenes construidas exitosamente"
else
    log_error "Error al construir las imágenes"
    exit 1
fi

# Iniciar servicios
log_info "Iniciando servicios..."
docker-compose up -d

# Esperar a que los servicios estén listos
log_info "Esperando a que los servicios estén listos..."
sleep 10

# Verificar que la aplicación responde
log_info "Verificando que la aplicación esté funcionando..."
for i in {1..30}; do
    if curl -s http://localhost:3000/api/health > /dev/null; then
        log_success "Aplicación funcionando correctamente!"
        break
    else
        if [ $i -eq 30 ]; then
            log_error "La aplicación no responde después de 30 intentos"
            log_info "Mostrando logs para diagnóstico:"
            docker-compose logs adoptme-app
            exit 1
        fi
        log_info "Esperando... intento $i/30"
        sleep 2
    fi
done

# Mostrar información de acceso
echo
log_success "🎉 ¡Deployment completado exitosamente!"
echo
echo "📋 Información de acceso:"
echo "  🌐 Aplicación: http://localhost:3000"
echo "  📚 API Docs: http://localhost:3000/api/docs"
echo "  💾 MongoDB: mongodb://admin:password123@localhost:27017/adoptme-db"
echo
echo "📊 Comandos útiles:"
echo "  📋 Ver logs: docker-compose logs -f"
echo "  🔍 Estado de servicios: docker-compose ps"
echo "  ⏹️  Parar servicios: docker-compose down"
echo
log_info "Para ver los logs en tiempo real: docker-compose logs -f adoptme-app"
