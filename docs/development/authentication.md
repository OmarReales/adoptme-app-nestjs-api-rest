# 🔄 Hybrid Authentication Guide - AdoptMe

## 📋 **Architecture Overview**

The AdoptMe application implements a **hybrid authentication architecture** that combines:

1. **Sessions** for the web application (frontend with Handlebars)
2. **JWT tokens** for REST API and mobile applications
3. **Hybrid guards** that accept both methods

## 🔧 **How It Works**

### **1. Single Login, Dual Authentication**

When a user logs in (`POST /api/auth/login`):

```json
// Response
{
  "user": {
    /* user data */
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

- ✅ **Session**: Automatically created in `req.session.user`
- ✅ **JWT**: Returns `access_token` in the response

### **2. Available Guards**

#### **SessionAuthGuard** - Sessions only

```typescript
@UseGuards(SessionAuthGuard)
@Get('profile')
getProfile(@GetSessionUser() user: any) {
  return user;
}
```

#### **JwtAuthGuard** - JWT only

```typescript
@UseGuards(JwtAuthGuard)
@Get('data')
getData(@GetUser() user: any) {
  return user;
}
```

#### **HybridAuthGuard** - Sessions OR JWT

```typescript
@UseGuards(HybridAuthGuard)
@Get('flexible')
getFlexible(@GetUser() user: any) {
  // Accepts both sessions and JWT
  return user;
}
```

### **3. Recommended Usage by Client Type**

#### **Web Frontend (Handlebars)**

- ✅ Use **SessionAuthGuard**
- ✅ Automatic authentication with cookies
- ✅ No manual token management required

#### **REST API for Mobile/External**

- ✅ Use **JwtAuthGuard**
- ✅ Send `Authorization: Bearer <token>` header
- ✅ Stateless, perfect for microservices

#### **Flexible Endpoints**

- ✅ Use **HybridAuthGuard**
- ✅ Accepts both web and mobile
- ✅ Automatic fallback

## 📱 **Usage Examples**

### **Web App (Session-based)**

```javascript
// Login from web frontend
fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include', // Important for cookies
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

// Subsequent requests automatically use session
fetch('/api/pets', {
  credentials: 'include',
});
```

### **Mobile App (JWT-based)**

```javascript
// Login from mobile
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

const { access_token } = await response.json();

// Save token and use in subsequent requests
fetch('/api/pets', {
  headers: {
    Authorization: `Bearer ${access_token}`,
  },
});
```

### **Hybrid Endpoint**

```javascript
// Works with both methods automatically
fetch('/api/pets/hybrid-endpoint', {
  headers: {
    Authorization: `Bearer ${token}`, // Or use credentials: 'include'
  },
});
```

## 🎯 **Architecture Advantages**

### **For Web Developers**

- ✅ Transparent authentication with cookies
- ✅ No manual token management required
- ✅ Automatic session regeneration
- ✅ Perfect for SSR

### **For Mobile/API Developers**

- ✅ Stateless authentication
- ✅ Configurable token expiration
- ✅ Cross-domain compatible
- ✅ Perfect for microservices

### **For the Application**

- ✅ Maximum flexibility
- ✅ Single authentication system
- ✅ Scalable for different clients
- ✅ Maintains backward compatibility

## 🔒 **Security Configuration**

### **Environment Variables**

```env
# For Sessions
SESSION_SECRET=your-session-secret-min-32-chars
SESSION_MAX_AGE=86400000

# For JWT
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_EXPIRES_IN=7d
```

### **Security Headers**

- **Sessions**: `httpOnly`, `secure`, `sameSite`
- **JWT**: Payload validation, ObjectId, roles

## 📚 **Migrating Existing Guards**

To leverage the hybrid architecture, you can:

1. **Keep specific guards** where you're certain of the client
2. **Use HybridAuthGuard** on endpoints you want to be flexible
3. **Migrate gradually** based on needs

```typescript
// Before
@UseGuards(SessionAuthGuard)

// After (for flexibility)
@UseGuards(HybridAuthGuard)
```

## 🎉 **Final Result**

Your AdoptMe application can now serve:

- **Web frontend** with session authentication
- **REST API** with JWT authentication
- **Mobile apps** with stateless tokens
- **Microservices** with flexible authentication

All with a single unified authentication system!

## 🛠️ **Implementation Details**

### **Guard Priority**

The HybridAuthGuard follows this priority:

1. Check for JWT token in Authorization header
2. If no JWT, check for session
3. If neither, return unauthorized

### **User Object**

Both authentication methods provide a consistent user object:

```typescript
interface AuthenticatedUser {
  userId: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  // ... other user fields
}
```

### **Security Considerations**

- **Sessions**: Secure cookies, CSRF protection, session rotation
- **JWT**: Token expiration, secret key rotation, payload validation
- **Hybrid**: Input validation, rate limiting, audit logging
