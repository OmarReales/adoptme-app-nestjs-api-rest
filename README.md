# 🐾 AdoptMe API

**A comprehensive pet adoption platform API built with NestJS, TypeScript, and MongoDB**

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [API Documentation](#-api-documentation)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Database Schema](#-database-schema)
- [Authentication & Authorization](#-authentication--authorization)
- [API Endpoints](#-api-endpoints)
- [Notification System](#-notification-system)
- [Testing](#-testing)
- [Development](#-development)
- [Contributing](#-contributing)

---

## 🚀 Overview

AdoptMe API is a full-featured backend system designed for pet adoption platforms. It provides comprehensive functionality for managing users, pets, adoption requests, and notifications. Built with modern technologies and best practices, it offers a secure, scalable, and maintainable solution for pet adoption services.

### Key Highlights

- **🔐 Robust Authentication**: JWT-based authentication with role-based access control
- **📊 Complete CRUD Operations**: Full management of users, pets, and adoptions
- **🔔 Real-time Notifications**: Comprehensive notification system for user engagement
- **📝 Comprehensive Logging**: Advanced logging with Winston for monitoring and debugging
- **🛡️ Security First**: Input validation, rate limiting, and security middleware
- **📚 Auto-generated Documentation**: Interactive Swagger/OpenAPI documentation
- **🧪 Testing Ready**: Unit and integration testing setup

---

## ✨ Features

### Core Functionality

- **User Management**: Registration, authentication, profile management
- **Pet Management**: Add, update, delete pets with detailed information
- **Adoption System**: Request, approve, reject adoption applications
- **Notification System**: Real-time notifications for adoption events
- **Admin Dashboard**: Administrative functions and statistics

### Advanced Features

- **Role-Based Access Control**: User and Admin roles with specific permissions
- **Data Validation**: Comprehensive input validation using class-validator
- **Rate Limiting**: Protection against abuse with throttling
- **Logging & Monitoring**: Detailed logging for all operations
- **Mock Data Generation**: Tools for development and testing
- **Pagination & Filtering**: Efficient data retrieval with query options

---

## 🛠️ Technology Stack

### Backend Framework

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **Express** - Web application framework

### Database

- **MongoDB** - NoSQL document database
- **Mongoose** - ODM for MongoDB

### Authentication & Security

- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Passport** - Authentication middleware
- **@nestjs/throttler** - Rate limiting

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Mocha** - Testing framework
- **Swagger/OpenAPI** - API documentation

### Utilities

- **class-validator** - Input validation
- **class-transformer** - Object transformation
- **Winston** - Logging
- **Faker.js** - Mock data generation

---

## 🏗️ Architecture

### Project Structure

```
src/
├── app.module.ts              # Main application module
├── main.ts                    # Application entry point
├── common/                    # Shared utilities and components
│   ├── decorators/           # Custom decorators (@GetUser, @Roles)
│   ├── filters/              # Exception filters
│   ├── guards/               # Authentication and authorization guards
│   ├── interfaces/           # Common interfaces and types
│   ├── middleware/           # HTTP logging middleware
│   ├── pipes/                # Validation pipes
│   └── services/             # Shared services (logging)
├── config/                   # Configuration files
│   ├── database.config.ts    # Database configuration
│   ├── jwt.config.ts         # JWT configuration
│   ├── email.config.ts       # Email configuration
│   └── winston.config.ts     # Logging configuration
├── modules/                  # Feature modules
│   ├── auth/                 # Authentication module
│   ├── users/                # User management module
│   ├── pets/                 # Pet management module
│   ├── adoptions/            # Adoption system module
│   ├── notifications/        # Notification system module
│   ├── mocking/              # Mock data generation module
│   └── logger-test/          # Logging test module
└── schemas/                  # Database schemas
    ├── user.schema.ts        # User document schema
    ├── pet.schema.ts         # Pet document schema
    ├── adoption.schema.ts    # Adoption document schema
    └── notification.schema.ts # Notification document schema
```

### Design Patterns

- **Module-based Architecture**: Organized by features
- **Repository Pattern**: Data access abstraction with Mongoose
- **Dependency Injection**: NestJS built-in DI container
- **Guard Pattern**: Authentication and authorization guards
- **Decorator Pattern**: Custom decorators for common operations

---

## 📚 API Documentation

Interactive API documentation is available via Swagger UI when the application is running:

- **URL**: `http://localhost:3000/api/docs`
- **Features**: Interactive testing, schema definitions, example requests/responses
- **Authentication**: Bearer token support for protected endpoints

---

## 🚀 Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v5 or higher)
- **npm** or **yarn**

### Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd adoptme-app-nestjs-api-rest
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**

   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest

   # Or use your local MongoDB installation
   ```

5. **Run the application**

   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/adoptme-db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL=http://localhost:3001

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Application Configuration

The application uses NestJS ConfigModule for centralized configuration management:

- **database.config.ts**: MongoDB connection settings
- **jwt.config.ts**: JWT token configuration
- **email.config.ts**: Email service configuration
- **winston.config.ts**: Logging configuration

---

## 🗄️ Database Schema

### User Schema

```typescript
interface User {
  _id: ObjectId;
  username: string; // Unique username
  firstname: string; // First name
  lastname: string; // Last name
  email: string; // Unique email
  password: string; // Hashed password
  age: number; // Age (18-120)
  role: 'user' | 'admin'; // User role
  isEmailVerified: boolean; // Email verification status
  emailVerificationToken?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Pet Schema

```typescript
interface Pet {
  _id: ObjectId;
  name: string; // Pet name
  breed: string; // Pet breed
  age: number; // Pet age (0-30)
  owner: ObjectId | null; // Current owner (nullable)
  status: 'available' | 'adopted';
  description?: string; // Pet description
  image?: string; // Pet image URL
  likedBy: ObjectId[]; // Users who liked this pet
  createdAt: Date;
  updatedAt: Date;
}
```

### Adoption Schema

```typescript
interface Adoption {
  _id: ObjectId;
  user: ObjectId; // Adopter reference
  pet: ObjectId; // Pet reference
  status: 'pending' | 'approved' | 'rejected';
  adminApprover?: ObjectId; // Admin who approved/rejected
  requestDate: Date; // Request creation date
  approvedDate?: Date; // Approval date
  rejectedDate?: Date; // Rejection date
  notes?: string; // Admin notes
  createdAt: Date;
  updatedAt: Date;
}
```

### Notification Schema

```typescript
interface Notification {
  _id: ObjectId;
  recipient: ObjectId; // User who receives the notification
  type: NotificationType; // Type of notification
  title: string; // Notification title
  message: string; // Notification message
  isRead: boolean; // Read status
  relatedId?: ObjectId; // Related document ID
  relatedModel?: string; // Related model name
  actionUrl?: string; // Action URL
  priority: 'low' | 'medium' | 'high';
  expiresAt?: Date; // Expiration date
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. **User Registration/Login**
   - User provides credentials
   - Server validates and returns JWT token
   - Token contains user ID, username, and role

2. **Token Validation**
   - JWT tokens are validated on protected routes
   - Token payload is extracted and attached to request
   - Custom `@GetUser()` decorator provides user info

### Authorization Levels

- **Public Routes**: No authentication required
- **Protected Routes**: JWT token required
- **Admin Routes**: Admin role required
- **Owner Routes**: Resource ownership or admin role required

### Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Configurable expiration times
- **Rate Limiting**: Configurable request throttling
- **Input Validation**: Comprehensive DTO validation
- **CORS**: Cross-origin resource sharing configured

---

## 📡 API Endpoints

### Authentication (`/auth`)

| Method | Endpoint         | Description       | Auth   |
| ------ | ---------------- | ----------------- | ------ |
| POST   | `/auth/register` | Register new user | Public |
| POST   | `/auth/login`    | User login        | Public |

### Users (`/users`)

| Method | Endpoint     | Description                 | Auth        |
| ------ | ------------ | --------------------------- | ----------- |
| POST   | `/users`     | Create user (Admin)         | Admin       |
| GET    | `/users`     | Get all users (Admin)       | Admin       |
| GET    | `/users/me`  | Get current user profile    | User        |
| PATCH  | `/users/me`  | Update current user profile | User        |
| GET    | `/users/:id` | Get user by ID              | User/Admin  |
| PATCH  | `/users/:id` | Update user by ID           | Owner/Admin |
| DELETE | `/users/:id` | Delete user (Admin)         | Admin       |

### Pets (`/pets`)

| Method | Endpoint         | Description               | Auth   |
| ------ | ---------------- | ------------------------- | ------ |
| POST   | `/pets`          | Create pet (Admin)        | Admin  |
| GET    | `/pets`          | Get all pets with filters | Public |
| GET    | `/pets/my-pets`  | Get user's pets           | User   |
| GET    | `/pets/my-liked` | Get user's liked pets     | User   |
| GET    | `/pets/:id`      | Get pet by ID             | Public |
| PATCH  | `/pets/:id`      | Update pet (Admin)        | Admin  |
| DELETE | `/pets/:id`      | Delete pet (Admin)        | Admin  |
| POST   | `/pets/:id/like` | Like a pet                | User   |
| DELETE | `/pets/:id/like` | Unlike a pet              | User   |

### Adoptions (`/adoptions`)

| Method | Endpoint                 | Description                     | Auth        |
| ------ | ------------------------ | ------------------------------- | ----------- |
| POST   | `/adoptions`             | Create adoption request         | User        |
| GET    | `/adoptions`             | Get all adoptions (Admin)       | Admin       |
| GET    | `/adoptions/my-requests` | Get user's adoption requests    | User        |
| GET    | `/adoptions/pending`     | Get pending adoptions (Admin)   | Admin       |
| GET    | `/adoptions/stats`       | Get adoption statistics (Admin) | Admin       |
| GET    | `/adoptions/:id`         | Get adoption by ID              | User/Admin  |
| PATCH  | `/adoptions/:id/status`  | Update adoption status (Admin)  | Admin       |
| DELETE | `/adoptions/:id`         | Delete adoption request         | Owner/Admin |

### Notifications (`/notifications`)

| Method | Endpoint                            | Description                    | Auth  |
| ------ | ----------------------------------- | ------------------------------ | ----- |
| POST   | `/notifications`                    | Create notification (Admin)    | Admin |
| GET    | `/notifications`                    | Get user notifications         | User  |
| GET    | `/notifications/stats`              | Get notification stats (Admin) | Admin |
| PATCH  | `/notifications/:id/read`           | Mark notification as read      | User  |
| PATCH  | `/notifications/mark-multiple-read` | Mark multiple as read          | User  |
| PATCH  | `/notifications/mark-all-read`      | Mark all as read               | User  |
| DELETE | `/notifications/:id`                | Delete notification            | User  |

### Development Tools (`/mocking`)

| Method | Endpoint                | Description                 | Auth   |
| ------ | ----------------------- | --------------------------- | ------ |
| POST   | `/mocking/pets`         | Generate mock pets          | Public |
| DELETE | `/mocking/pets`         | Clear all pets              | Public |
| POST   | `/mocking/users`        | Generate mock users         | Public |
| DELETE | `/mocking/users`        | Clear all users             | Public |
| POST   | `/mocking/generatedata` | Generate complete mock data | Public |

---

## 🔔 Notification System

### Features

- **Real-time notifications** for adoption events
- **Multiple notification types** (adoption requests, approvals, rejections, etc.)
- **Priority levels** (low, medium, high)
- **Expiration support** for time-sensitive notifications
- **Bulk operations** (mark all as read, delete multiple)
- **Admin statistics** and monitoring

### Notification Types

- `ADOPTION_REQUEST` - New adoption request created
- `ADOPTION_APPROVED` - Adoption request approved
- `ADOPTION_REJECTED` - Adoption request rejected
- `NEW_PET_AVAILABLE` - New pet available for adoption
- `PET_STATUS_CHANGED` - Pet status updated
- `SYSTEM_MAINTENANCE` - System maintenance notifications
- `ACCOUNT_UPDATED` - User account changes
- `GENERAL` - General notifications

### Integration Points

- **Automatic notifications** when adoption requests are created
- **Admin notifications** for new adoption requests
- **User notifications** for adoption status changes
- **Bulk notifications** for system-wide announcements

---

## 🧪 Testing

### Test Structure

```
test/
├── unit/                     # Unit tests
│   ├── auth/                # Authentication tests
│   ├── users/               # User service tests
│   └── pets/                # Pet service tests
├── integration/             # Integration tests
│   ├── users/               # User API tests
│   └── pets/                # Pet API tests
├── setup/                   # Test setup utilities
│   ├── test-app.setup.ts    # Application setup
│   ├── test-data.ts         # Test data fixtures
│   └── test-db.setup.ts     # Database setup
└── utils/                   # Test utilities
    ├── auth.helper.ts       # Authentication helpers
    └── test.helper.ts       # General test helpers
```

### Running Tests

```bash
# Mocha-based tests
npm run test:mocha          # Run all Mocha tests
npm run test:mocha:watch    # Run Mocha tests in watch mode
npm run test:unit           # Run unit tests
npm run test:integration    # Run integration tests
npm run test:all            # Run both integration and unit tests
```

### Test Features

- **Mocha Testing Framework**: Comprehensive testing setup with Mocha
- **Comprehensive coverage** of services and controllers
- **Authentication helpers** for testing protected routes
- **Database mocking** and cleanup utilities
- **Fixture data** for consistent testing
- **Multiple test types**: Unit and integration tests

---

## 🔧 Development

### Available Scripts

```bash
# Development
npm start                   # Start the application
npm run start:dev           # Start in development mode with hot reload
npm run start:debug         # Start in debug mode with debugging

# Building & Production
npm run build               # Build the application
npm run start:prod          # Start in production mode

# Code Quality
npm run lint                # Run ESLint with auto-fix
npm run format              # Format code with Prettier

# Testing
npm run test:mocha          # Run all Mocha tests
npm run test:mocha:watch    # Run Mocha tests in watch mode
npm run test:unit           # Run unit tests
npm run test:integration    # Run integration tests
npm run test:all            # Run both integration and unit tests
```

### Development Workflow

1. **Feature Development**
   - Create feature branch
   - Implement functionality with tests
   - Run linting and tests
   - Create pull request

2. **Code Quality**
   - ESLint for code linting
   - Prettier for code formatting
   - TypeScript for type safety
   - Comprehensive testing

3. **Logging & Debugging**
   - Winston logger with multiple levels
   - HTTP request/response logging
   - Business event logging
   - Error tracking and monitoring

---

## 📈 Performance & Scalability

### Performance Features

- **Database indexing** on frequently queried fields
- **Pagination** for large data sets
- **Query optimization** with Mongoose
- **Rate limiting** to prevent abuse
- **Efficient filtering** and sorting

### Scalability Considerations

- **Modular architecture** for easy scaling
- **Stateless design** with JWT tokens
- **Database optimization** with proper schemas
- **Caching strategies** ready for implementation
- **Microservice-ready** architecture

---

## 🚀 Deployment

### Production Checklist

- [ ] Set strong JWT secret (min 32 characters)
- [ ] Configure production MongoDB URI
- [ ] Set up proper CORS origins
- [ ] Configure email service (optional)
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting for production
- [ ] Set up SSL/TLS certificates
- [ ] Configure environment variables
- [ ] Set up backup strategy
- [ ] Configure health checks

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-super-secure-production-secret
FRONTEND_URL=https://your-frontend-domain.com
```

---

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Coding Standards

- **TypeScript** for type safety
- **ESLint** configuration for code quality
- **Prettier** for consistent formatting
- **Conventional commits** for commit messages
- **Comprehensive testing** for new features

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Support

For support and questions:

- Create an issue in the repository
- Check the [API documentation](http://localhost:3000/api/docs) when running locally
- Review the test files for usage examples

---

**Built with ❤️ using NestJS, TypeScript, and MongoDB**

```

```
