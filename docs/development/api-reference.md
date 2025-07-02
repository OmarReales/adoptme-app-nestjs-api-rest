# 📖 API Reference - AdoptMe

Complete API documentation for the AdoptMe pet adoption platform.

## 🔗 Base URL

```
http://localhost:3000/api
```

## 🔐 Authentication

The API supports two authentication methods:

### Session-based (Web)

```javascript
// Login creates a session cookie
fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include', // Important!
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
```

### JWT-based (API/Mobile)

```javascript
// Use Authorization header
fetch('/api/pets', {
  headers: {
    Authorization: 'Bearer <your_jwt_token>',
    'Content-Type': 'application/json',
  },
});
```

---

## 🔒 Authentication Endpoints

### POST `/auth/login`

Login user and create session + JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "user": {
    "userId": "60d5ecb54b24a",
    "username": "johndoe",
    "email": "user@example.com",
    "role": "user"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

### POST `/auth/register`

Register new user.

**Request Body:**

```json
{
  "username": "johndoe",
  "firstname": "John",
  "lastname": "Doe",
  "email": "user@example.com",
  "password": "password123",
  "age": 25
}
```

**Response:**

```json
{
  "user": {
    "userId": "60d5ecb54b24a",
    "username": "johndoe",
    "email": "user@example.com",
    "role": "user"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Registration successful"
}
```

---

## 👥 User Endpoints

### GET `/users/me`

Get current user profile.

**Headers:** `Authorization: Bearer <token>` or session cookie

**Response:**

```json
{
  "_id": "60d5ecb54b24a",
  "username": "johndoe",
  "firstname": "John",
  "lastname": "Doe",
  "email": "user@example.com",
  "age": 25,
  "role": "user",
  "createdAt": "2025-07-02T10:00:00.000Z"
}
```

### PATCH `/users/me`

Update current user profile.

**Request Body:**

```json
{
  "firstname": "Johnny",
  "age": 26
}
```

---

## 🐾 Pet Endpoints

### GET `/pets`

Get all pets with optional filtering.

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 24)
- `species` (string): Filter by species (dog, cat, rabbit, bird, other)
- `name` (string): Search by name
- `ageRange` (string): Filter by age (young, adult, senior)
- `status` (string): Filter by status (available, adopted, pending)

**Example:**

```
GET /pets?page=1&limit=24&species=dog&ageRange=adult
```

**Response:**

```json
{
  "pets": [
    {
      "_id": "60d5ecb54b24a",
      "name": "Buddy",
      "breed": "Golden Retriever",
      "age": 3,
      "species": "dog",
      "gender": "male",
      "status": "available",
      "description": "Friendly and energetic dog",
      "characteristics": ["friendly", "energetic", "trained"],
      "likedBy": [],
      "createdAt": "2025-07-02T10:00:00.000Z"
    }
  ],
  "totalPets": 1,
  "totalPages": 1,
  "currentPage": 1,
  "hasNextPage": false,
  "hasPrevPage": false
}
```

### GET `/pets/:id`

Get specific pet by ID.

**Response:**

```json
{
  "_id": "60d5ecb54b24a",
  "name": "Buddy",
  "breed": "Golden Retriever",
  "age": 3,
  "species": "dog",
  "gender": "male",
  "status": "available",
  "description": "Friendly and energetic dog",
  "characteristics": ["friendly", "energetic", "trained"],
  "owner": null,
  "likedBy": [],
  "createdAt": "2025-07-02T10:00:00.000Z",
  "updatedAt": "2025-07-02T10:00:00.000Z"
}
```

### POST `/pets` (Admin only)

Create new pet.

**Request Body:**

```json
{
  "name": "Buddy",
  "breed": "Golden Retriever",
  "age": 3,
  "species": "dog",
  "gender": "male",
  "description": "Friendly and energetic dog",
  "characteristics": ["friendly", "energetic", "trained"]
}
```

### GET `/pets/my-pets`

Get pets owned by current user.

**Headers:** `Authorization: Bearer <token>` or session cookie

### GET `/pets/my-liked`

Get pets liked by current user.

**Headers:** `Authorization: Bearer <token>` or session cookie

### POST `/pets/:id/like`

Like a pet.

**Headers:** `Authorization: Bearer <token>` or session cookie

### DELETE `/pets/:id/like`

Unlike a pet.

**Headers:** `Authorization: Bearer <token>` or session cookie

---

## 💝 Adoption Endpoints

### POST `/adoptions`

Create adoption request.

**Headers:** `Authorization: Bearer <token>` or session cookie

**Request Body:**

```json
{
  "pet": "60d5ecb54b24a",
  "notes": "I would love to adopt this pet because..."
}
```

**Response:**

```json
{
  "_id": "60d5ecb54b24b",
  "user": "60d5ecb54b24c",
  "pet": "60d5ecb54b24a",
  "status": "pending",
  "notes": "I would love to adopt this pet because...",
  "requestDate": "2025-07-02T10:00:00.000Z",
  "createdAt": "2025-07-02T10:00:00.000Z"
}
```

### GET `/adoptions/my-requests`

Get current user's adoption requests.

**Headers:** `Authorization: Bearer <token>` or session cookie

**Response:**

```json
{
  "adoptions": [
    {
      "_id": "60d5ecb54b24b",
      "user": {
        "_id": "60d5ecb54b24c",
        "username": "johndoe",
        "email": "user@example.com"
      },
      "pet": {
        "_id": "60d5ecb54b24a",
        "name": "Buddy",
        "breed": "Golden Retriever",
        "species": "dog"
      },
      "status": "pending",
      "requestDate": "2025-07-02T10:00:00.000Z"
    }
  ],
  "totalRequests": 1
}
```

### GET `/adoptions` (Admin only)

Get all adoption requests.

### GET `/adoptions/pending` (Admin only)

Get pending adoption requests.

### PATCH `/adoptions/:id/status` (Admin only)

Update adoption status.

**Request Body:**

```json
{
  "status": "approved", // or "rejected"
  "notes": "Great match for this pet!"
}
```

---

## 🔔 Notification Endpoints

### GET `/notifications`

Get user notifications.

**Headers:** `Authorization: Bearer <token>` or session cookie

**Response:**

```json
{
  "notifications": [
    {
      "_id": "60d5ecb54b24d",
      "recipient": "60d5ecb54b24c",
      "title": "Adoption Request Approved",
      "message": "Your adoption request for Buddy has been approved!",
      "type": "ADOPTION_APPROVED",
      "isRead": false,
      "priority": "high",
      "createdAt": "2025-07-02T10:00:00.000Z"
    }
  ],
  "totalNotifications": 1,
  "unreadCount": 1
}
```

### PATCH `/notifications/:id/read`

Mark notification as read.

### PATCH `/notifications/mark-all-read`

Mark all notifications as read.

### DELETE `/notifications/:id`

Delete notification.

---

## 📊 Statistics Endpoints

### GET `/stats`

Get platform statistics.

**Response:**

```json
{
  "totalPets": 150,
  "totalUsers": 75,
  "totalAdoptions": 25,
  "totalNotifications": 200,
  "availablePets": 125,
  "adoptedPets": 25,
  "pendingAdoptions": 5,
  "approvedAdoptions": 20,
  "rejectedAdoptions": 0
}
```

---

## 🧪 Development Tools

### POST `/mocking/generatedata`

Generate complete mock data for testing.

**Response:**

```json
{
  "message": "Mock data generated successfully",
  "summary": {
    "users": 20,
    "pets": 50,
    "adoptions": 10,
    "notifications": 30
  }
}
```

### POST `/mocking/pets`

Generate mock pets.

**Request Body:**

```json
{
  "count": 25
}
```

### POST `/mocking/users`

Generate mock users.

**Request Body:**

```json
{
  "count": 10
}
```

---

## 📝 Data Models

### User Model

```typescript
interface User {
  _id: ObjectId;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string; // hashed
  age: number;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Pet Model

```typescript
interface Pet {
  _id: ObjectId;
  name: string;
  breed: string;
  age: number;
  species: 'dog' | 'cat' | 'rabbit' | 'bird' | 'other';
  gender: 'male' | 'female';
  owner: ObjectId | null;
  status: 'available' | 'adopted' | 'pending';
  description?: string;
  image?: string;
  characteristics: string[];
  likedBy: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Adoption Model

```typescript
interface Adoption {
  _id: ObjectId;
  user: ObjectId;
  pet: ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  adminApprover?: ObjectId;
  requestDate: Date;
  approvedDate?: Date;
  rejectedDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## ⚠️ Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": ["Validation error messages"],
  "error": "Bad Request"
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## 🔗 Interactive Documentation

For a complete interactive API documentation with the ability to test endpoints directly:

**Visit:** http://localhost:3000/api/docs (when running the application)

The interactive documentation is automatically generated from the code and includes:

- Complete endpoint documentation
- Request/response schemas
- Authentication integration
- Live testing capability
- Example requests and responses
