# Script de construcción y despliegue para AdoptMe App (PowerShell)
# Este script automatiza el proceso de build y deploy en Windows

param(
    [switch]$Clean = $false
)

# Configuración de colores
$Host.UI.RawUI.ForegroundColor = "White"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Log-Info($message) {
    Write-ColorOutput "Cyan" "ℹ️  $message"
}

function Log-Success($message) {
    Write-ColorOutput "Green" "✅ $message"
}

function Log-Warning($message) {
    Write-ColorOutput "Yellow" "⚠️  $message"
}

function Log-Error($message) {
    Write-ColorOutput "Red" "❌ $message"
}

Write-ColorOutput "Blue" "🚀 Iniciando proceso de build y deploy de AdoptMe App..."

# Verificar que Docker está instalado
try {
    docker --version | Out-Null
} catch {
    Log-Error "Docker no está instalado. Por favor instala Docker Desktop primero."
    exit 1
}

# Verificar que Docker Compose está disponible
try {
    docker-compose --version | Out-Null
} catch {
    Log-Error "Docker Compose no está disponible. Por favor instala Docker Desktop con Compose."
    exit 1
}

# Verificar que existe el archivo .env
if (-not (Test-Path ".env")) {
    Log-Warning "Archivo .env no encontrado. Copiando desde .env.example..."
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Log-Info "Archivo .env creado. Por favor revisa y ajusta las variables de entorno."
    } else {
        Log-Error "Archivo .env.example no encontrado."
        exit 1
    }
}

# Limpiar contenedores e imágenes previas (opcional)
if ($Clean) {
    Log-Info "Limpiando contenedores e imágenes previas..."
    try {
        docker-compose down -v 2>$null
        docker system prune -f 2>$null
        Log-Success "Limpieza completada"
    } catch {
        Log-Warning "Error durante la limpieza, continuando..."
    }
}

# Construir imágenes
Log-Info "Construyendo imágenes Docker..."
try {
    docker-compose build --no-cache
    Log-Success "Imágenes construidas exitosamente"
} catch {
    Log-Error "Error al construir las imágenes"
    exit 1
}

# Iniciar servicios
Log-Info "Iniciando servicios..."
try {
    docker-compose up -d
} catch {
    Log-Error "Error al iniciar los servicios"
    exit 1
}

# Esperar a que los servicios estén listos
Log-Info "Esperando a que los servicios estén listos..."
Start-Sleep -Seconds 10

# Verificar que la aplicación responde
Log-Info "Verificando que la aplicación esté funcionando..."
$maxAttempts = 30
$attempt = 1

do {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Log-Success "Aplicación funcionando correctamente!"
            break
        }
    } catch {
        if ($attempt -eq $maxAttempts) {
            Log-Error "La aplicación no responde después de $maxAttempts intentos"
            Log-Info "Mostrando logs para diagnóstico:"
            docker-compose logs adoptme-app
            exit 1
        }
        Log-Info "Esperando... intento $attempt/$maxAttempts"
        Start-Sleep -Seconds 2
        $attempt++
    }
} while ($attempt -le $maxAttempts)

# Mostrar información de acceso
Write-Host ""
Log-Success "🎉 ¡Deployment completado exitosamente!"
Write-Host ""
Write-Host "📋 Información de acceso:"
Write-Host "  🌐 Aplicación: http://localhost:3000"
Write-Host "  📚 API Docs: http://localhost:3000/api/docs"
Write-Host "  💾 MongoDB: mongodb://admin:password123@localhost:27017/adoptme-db"
Write-Host ""
Write-Host "📊 Comandos útiles:"
Write-Host "  📋 Ver logs: docker-compose logs -f"
Write-Host "  🔍 Estado de servicios: docker-compose ps"
Write-Host "  ⏹️  Parar servicios: docker-compose down"
Write-Host ""
Log-Info "Para ver los logs en tiempo real: docker-compose logs -f adoptme-app"
