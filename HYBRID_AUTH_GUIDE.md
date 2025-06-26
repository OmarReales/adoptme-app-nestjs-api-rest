# 🔄 Guía de Autenticación Híbrida - AdoptMe

## 📋 **Resumen de la Arquitectura**

La aplicación AdoptMe implementa una **arquitectura híbrida de autenticación** que combina:

1. **Sesiones** para la aplicación web (frontend con Handlebars)
2. **JWT tokens** para API REST y aplicaciones móviles
3. **Guards híbridos** que aceptan ambos métodos

## 🔧 **Cómo Funciona**

### **1. Login Único, Doble Autenticación**

Cuando un usuario hace login (`POST /api/auth/login`):

```json
// Response
{
  "user": {
    /* datos del usuario */
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

- ✅ **Sesión**: Se crea automáticamente en `req.session.user`
- ✅ **JWT**: Se devuelve `access_token` en la respuesta

### **2. Guards Disponibles**

#### **SessionAuthGuard** - Solo sesiones

```typescript
@UseGuards(SessionAuthGuard)
@Get('profile')
getProfile(@GetSessionUser() user: any) {
  return user;
}
```

#### **JwtAuthGuard** - Solo JWT

```typescript
@UseGuards(JwtAuthGuard)
@Get('data')
getData(@GetUser() user: any) {
  return user;
}
```

#### **HybridAuthGuard** - Sesiones O JWT

```typescript
@UseGuards(HybridAuthGuard)
@Get('flexible')
getFlexible(@GetUser() user: any) {
  // Acepta tanto sesiones como JWT
  return user;
}
```

### **3. Uso Recomendado por Tipo de Cliente**

#### **Frontend Web (Handlebars)**

- ✅ Usar **SessionAuthGuard**
- ✅ Autenticación automática con cookies
- ✅ No requiere manejo manual de tokens

#### **API REST para Mobile/External**

- ✅ Usar **JwtAuthGuard**
- ✅ Enviar `Authorization: Bearer <token>` header
- ✅ Stateless, perfecto para microservicios

#### **Endpoints Flexibles**

- ✅ Usar **HybridAuthGuard**
- ✅ Acepta tanto web como mobile
- ✅ Fallback automático

## 📱 **Ejemplos de Uso**

### **Web App (Session-based)**

```javascript
// Login desde frontend web
fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include', // Importante para cookies
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

// Las siguientes requests automáticamente usan la sesión
fetch('/api/pets', {
  credentials: 'include',
});
```

### **Mobile App (JWT-based)**

```javascript
// Login desde mobile
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

const { access_token } = await response.json();

// Guardar token y usarlo en siguientes requests
fetch('/api/pets', {
  headers: {
    Authorization: `Bearer ${access_token}`,
  },
});
```

### **Hybrid Endpoint**

```javascript
// Funciona con ambos métodos automáticamente
fetch('/api/pets/hybrid-endpoint', {
  headers: {
    Authorization: `Bearer ${token}`, // O usar credentials: 'include'
  },
});
```

## 🎯 **Ventajas de esta Arquitectura**

### **Para Desarrolladores Web**

- ✅ Autenticación transparente con cookies
- ✅ No requiere manejo manual de tokens
- ✅ Regeneración automática de sesiones
- ✅ Perfecto para SSR

### **Para Desarrolladores Mobile/API**

- ✅ Stateless authentication
- ✅ Tokens con expiración configurable
- ✅ Cross-domain compatible
- ✅ Perfecto para microservicios

### **Para la Aplicación**

- ✅ Máxima flexibilidad
- ✅ Un solo sistema de autenticación
- ✅ Escalable para diferentes clientes
- ✅ Mantiene compatibilidad hacia atrás

## 🔒 **Configuración de Seguridad**

### **Variables de Entorno**

```env
# Para Sesiones
SESSION_SECRET=tu-session-secret-min-32-chars
SESSION_MAX_AGE=86400000

# Para JWT
JWT_SECRET=tu-jwt-secret-min-32-chars
JWT_EXPIRES_IN=7d
```

### **Headers de Seguridad**

- **Sesiones**: `httpOnly`, `secure`, `sameSite`
- **JWT**: Validación de payload, ObjectId, roles

## 📚 **Migración de Guards Existentes**

Para aprovechar la arquitectura híbrida, puedes:

1. **Mantener guards específicos** donde tengas certeza del cliente
2. **Usar HybridAuthGuard** en endpoints que quieras que sean flexibles
3. **Migrar gradualmente** según necesidades

```typescript
// Antes
@UseGuards(SessionAuthGuard)

// Después (para flexibilidad)
@UseGuards(HybridAuthGuard)
```

## 🎉 **Resultado Final**

Tu aplicación AdoptMe ahora puede servir:

- **Frontend web** con autenticación por sesiones
- **API REST** con autenticación JWT
- **Apps móviles** con tokens stateless
- **Microservicios** con autenticación flexible

¡Todo con un solo sistema de autenticación unificado!
