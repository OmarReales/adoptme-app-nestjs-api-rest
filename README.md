# 🐾 AdoptMe - Pet Adoption Platform

**A modern, full-stack pet adoption platform with advanced features built with NestJS, TypeScript, MongoDB, and comprehensive web interface**

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Handlebars](https://img.shields.io/badge/Handlebars-%23000000.svg?style=for-the-badge&logo=handlebars.js&logoColor=white)
![Bootstrap](https://img.shields.io/badge/bootstrap-%23563D7C.svg?style=for-the-badge&logo=bootstrap&logoColor=white)
![Winston](https://img.shields.io/badge/winston-%23000000.svg?style=for-the-badge&logo=winston&logoColor=white)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Web Interface](#-web-interface)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Authentication & Authorization](#-authentication--authorization)
- [Testing](#-testing)
- [Development](#-development)
- [Contributing](#-contributing)

---

## 🚀 Overview

AdoptMe API is a full-featured pet adoption platform that combines a robust backend API with a modern web interface. It provides comprehensive functionality for managing users, pets, adoption requests, and notifications, all wrapped in an intuitive web application with server-side rendering.

### Key Highlights

- **🎨 Modern Web Interface**: Responsive design with Bootstrap 5 and custom CSS
- **� Mobile-First Design**: Optimized for all device sizes
- **� Session-Based Authentication**: Secure user authentication with session management
- **📊 Advanced Filtering & Pagination**: Smart pet search with persistent filters
- **📝 Comprehensive Logging**: Winston-based logging with multiple levels and file rotation
- **🛡️ Security First**: Input validation, rate limiting, and security middleware
- **📚 Auto-generated Documentation**: Interactive Swagger/OpenAPI documentation
- **🧪 Testing Ready**: Jest, Mocha, and comprehensive testing setup
- **🎯 Real-Time Features**: Dynamic content loading and interactive UI

---

## ✨ Features

### Core Functionality

- **User Management**: Complete user registration, authentication, and profile management with secure session handling
- **Pet Management**: Full CRUD operations for pets with detailed information including species, gender, breed, age, and characteristics
- **Advanced Pet Search**: Real-time filtering by name, species, age range with persistent URL parameters and instant results
- **Smart Pagination**: Efficient pagination (24 pets per page) that maintains filter state across navigation
- **Adoption System**: Complete adoption workflow with request, approval, and rejection functionality
- **Platform Statistics**: Real-time dashboard with total pets, users, adoptions, and notifications
- **Mock Data Generation**: Sophisticated Faker.js-based data generation for testing and development

### Web Interface Features

- **🏠 Homepage**: Modern landing page with live statistics, platform overview, and call-to-action buttons
- **🐕 Pet Listing**: Advanced search interface with real-time filtering, pagination, and responsive card layout
- **💝 Adoption Management**: Complete adoption workflow management with status tracking
- **👤 Authentication**: Modern login/register forms with session-based authentication
- **📊 Statistics Dashboard**: Live platform metrics and analytics
- **📱 Responsive Design**: Mobile-first design optimized for all screen sizes using Bootstrap 5

### Advanced Technical Features

- **Session-Based Authentication**: Secure session management with express-session and httpOnly cookies
- **Role-Based Access Control**: User and Admin roles with granular permissions
- **Comprehensive Validation**: Input validation using class-validator with DTO patterns
- **Rate Limiting**: Built-in throttling protection against abuse and DDoS attacks
- **Enterprise Logging**: Winston-based multi-level logging with file rotation, structured JSON output, and console formatting
- **Filter Persistence**: URL-based filter state that persists across page refreshes and navigation
- **Modern CSS Architecture**: CSS custom properties, gradients, responsive grid, and component-based styling
- **Error Handling**: Global exception filters with structured error responses and logging
- **API Documentation**: Auto-generated Swagger/OpenAPI 3.0 documentation with interactive testing interface

---

## 🛠️ Technology Stack

### Backend Framework

- **NestJS** v11.0.1 - Progressive Node.js framework with TypeScript and advanced features
- **Express** - Robust web application framework with extensive middleware ecosystem
- **TypeScript** v5.7.3 - Type-safe JavaScript with latest ES features and strict mode

### Frontend & UI

- **Express-Handlebars** v8.0.3 - Powerful templating engine for server-side rendering
- **Bootstrap 5** - Modern responsive CSS framework with utility classes
- **Custom CSS** - Modern styling with CSS custom properties, flexbox, grid, and animations
- **Vanilla JavaScript** - Clean, modular ES6+ frontend code with modern patterns

### Database & ODM

- **MongoDB** v8.16.0 - NoSQL document database with flexible schema design
- **Mongoose** v8.16.0 - Elegant MongoDB object modeling with TypeScript support and validation

### Authentication & Security

- **Express Session** v1.18.1 - Session-based authentication with secure cookie management
- **bcryptjs** v3.0.2 - Password hashing with configurable salt rounds
- **@nestjs/throttler** v6.4.0 - Rate limiting and DDoS protection with Redis support
- **cookie-parser** v1.4.7 - Cookie parsing middleware for Express

### Development & Testing

- **ESLint** v9.18.0 - Advanced linting with TypeScript support and custom rules
- **Prettier** v3.4.2 - Code formatting with consistent style enforcement
- **Jest** v29.7.0 - Comprehensive JavaScript testing framework with coverage
- **Mocha** v11.7.0 - Flexible testing framework with async support
- **Chai** v5.2.0 & **Sinon** v21.0.0 - Assertion library and test spies/stubs
- **Supertest** v7.1.1 - HTTP assertion library for API testing

### Logging & Monitoring

- **Winston** v3.17.0 - Enterprise-grade logging with multiple transports
- **nest-winston** v1.10.2 - NestJS integration for Winston with custom formatting
- **winston-daily-rotate-file** v5.0.0 - Automated log file rotation and archiving

### Validation & Transformation

- **class-validator** v0.14.2 - Decorator-based validation with custom validators
- **class-transformer** v0.5.1 - Object transformation and serialization
- **@nestjs/swagger** v11.2.0 - OpenAPI 3.0 documentation generation

### Utilities & Tools

- **@faker-js/faker** v9.8.0 - Realistic mock data generation for testing
- **UUID** v11.1.0 - RFC4122 compliant unique identifier generation
- **@nestjs/config** v4.0.2 - Configuration management with environment variables

---

## 🏗️ Architecture

### Project Structure

```
src/
├── app.module.ts              # Main application module with all imports
├── main.ts                    # Application entry point with Handlebars setup
├── common/                    # Shared utilities and components
│   ├── decorators/           # Custom decorators (@GetUser, @Roles)
│   ├── filters/              # Global exception filters
│   ├── guards/               # Authentication and authorization guards
│   ├── middleware/           # HTTP logging and session middleware
│   ├── pipes/                # Custom validation pipes
│   ├── services/             # Shared services (CustomLoggerService)
│   └── utils/                # Utility functions and helpers
├── config/                   # Configuration files
│   ├── database.config.ts    # MongoDB connection configuration
│   ├── jwt.config.ts         # JWT token configuration
│   ├── email.config.ts       # Email service configuration
│   └── winston.config.ts     # Winston logging configuration with levels
├── modules/                  # Feature modules (business logic)
│   ├── auth/                 # Authentication module with session support
│   ├── users/                # User management and profiles
│   ├── pets/                 # Pet management with advanced filtering
│   ├── adoptions/            # Adoption system with workflow management
│   ├── notifications/        # Notification system
│   ├── views/                # Server-side rendering controller
│   ├── stats/                # Platform statistics and analytics
│   ├── mocking/              # Mock data generation with Faker.js
│   └── logger-test/          # Logging test endpoints
├── schemas/                  # Mongoose schemas with TypeScript
│   ├── user.schema.ts        # User document schema with roles
│   ├── pet.schema.ts         # Pet schema with species, gender, characteristics
│   ├── adoption.schema.ts    # Adoption workflow schema
│   └── notification.schema.ts # Notification system schema
└── scripts/                  # Database seeding and utility scripts

views/                        # Handlebars templates (SSR)
├── layouts/                  # Layout templates
│   └── main.hbs             # Main layout with Bootstrap 5
├── partials/                 # Reusable components
│   ├── navbar.hbs           # Navigation with auth state
│   └── footer.hbs           # Footer component
├── index.hbs                # Homepage with statistics
├── auth/                    # Authentication views
│   ├── login.hbs           # Login form
│   └── register.hbs        # Registration form
├── pets/                    # Pet-related views
│   ├── index.hbs           # Pet listing with filters and pagination
│   ├── detail.hbs          # Pet detail page
│   └── create.hbs          # Pet creation form
├── adoptions/               # Adoption-related views
│   └── index.hbs           # Adoption management dashboard
└── users/                   # User-related views
    └── profile.hbs         # User profile management

public/                      # Static assets
├── css/                    # Stylesheets
│   ├── styles.css          # Main application styles
│   ├── shared.css          # Shared utility styles
│   ├── pets.css            # Pet-specific styling
│   ├── auth.css            # Authentication form styling
│   └── adoptions.css       # Adoption page styling
├── js/                     # Frontend JavaScript modules
│   ├── main.js             # Core application functionality
│   ├── shared.js           # Shared utilities and helpers
│   ├── pets.js             # Pet listing and filtering logic
│   ├── home.js             # Homepage dynamic features
│   ├── auth.js             # Authentication handling
│   └── adoptions.js        # Adoption management features
└── images/                 # Static image assets

test/                       # Comprehensive testing suite
├── integration/            # Integration tests
│   ├── pets/              # Pet module integration tests
│   └── users/             # User module integration tests
├── unit/                  # Unit tests
│   ├── pets/              # Pet service unit tests
│   └── users/             # User service unit tests
├── setup/                 # Test configuration and utilities
└── utils/                 # Testing helper functions

logs/                      # Winston log files (production)
├── combined.log           # All application logs
├── errors.log             # Error-level logs only
├── exceptions.log         # Unhandled exceptions
└── rejections.log         # Promise rejections
```

### Design Patterns & Architecture

- **Modular Architecture**: Feature-based organization with clear separation of concerns
- **Repository Pattern**: Data access abstraction using Mongoose with TypeScript
- **Dependency Injection**: NestJS built-in IoC container for loose coupling
- **Guard Pattern**: Authentication and authorization guards for route protection
- **Decorator Pattern**: Custom decorators for common operations and metadata
- **MVC Pattern**: Clear separation between controllers, services, and data layers
- **Factory Pattern**: Configuration factories for environment-specific settings

### Key Architecture Decisions

1. **Session-Based Authentication**: Chosen over JWT for better security and state management
2. **Server-Side Rendering**: Handlebars for SEO-friendly, fast-loading pages
3. **Modular CSS**: Separate stylesheets for each feature to maintain scalability
4. **Progressive Enhancement**: JavaScript enhances but doesn't break without it
5. **Winston Logging**: Structured logging with multiple levels and transports
6. **MongoDB with Mongoose**: Document database for flexible pet and user data

---

## 🚀 Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v5 or higher)
- **npm** or **yarn**

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/adoptme-app-nestjs-api-rest.git
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
   # Using MongoDB service
   sudo systemctl start mongod

   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Run the application**

   ```bash
   # Development mode with hot reload
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

6. **Access the application**
   - **Web Interface**: http://localhost:3000
   - **API Documentation**: http://localhost:3000/api/docs

### Development Setup

```bash
# Install dependencies
npm install

# Generate sample data
curl -X POST http://localhost:3000/api/mocking/pets -H "Content-Type: application/json" -d '{"count": 50}'

# Run tests
npm run test:all

# Watch mode for development
npm run start:dev
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/adoptme-db

# Server Configuration
PORT=3000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-min-32-characters

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
```

### Application Configuration

The application uses NestJS ConfigModule for centralized configuration:

- **`database.config.ts`**: MongoDB connection settings with retry logic
- **`winston.config.ts`**: Multi-level logging with console and file transports
- **`email.config.ts`**: Email service configuration for notifications

### Session Configuration

Session-based authentication is configured in `main.ts`:

```typescript
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'adoptme-super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);
```

---

## 🌐 Web Interface

### Available Routes

#### Public Routes

- **`/`** - Homepage with platform overview and live statistics
- **`/view-pets`** - Pet listing with advanced filtering and pagination
- **`/login`** - User authentication
- **`/register`** - User registration

#### Protected Routes

- **`/view-adoptions`** - Adoption management dashboard
- **`/pets/create`** - Pet creation form (admin)
- **`/profile`** - User profile management

### Key Features

#### Homepage (`/`)

- **Live Statistics**: Real-time platform metrics
- **Quick Actions**: Direct links to main features
- **Modern Design**: Gradient backgrounds and animations
- **Responsive Layout**: Mobile-first design approach

#### Pet Listing (`/view-pets`)

- **Advanced Filtering**: By name, species, and age range
- **Smart Pagination**: 24 pets per page with navigation
- **Persistent Filters**: URL-based state that survives page refresh
- **Real-time Search**: Instant filtering as you type
- **Species Filter**: Dog, Cat, Rabbit, Bird, Other
- **Age Ranges**: Young (1-3), Adult (4-8), Senior (9+)

#### Filter Persistence

The pet listing maintains filter state in the URL:

```
/view-pets?page=2&species=dog&ageRange=adult&name=buddy
```

#### Responsive Design

- **Mobile-First**: Optimized for phones and tablets
- **Bootstrap 5**: Modern responsive components
- **Custom CSS**: Brand-specific styling with CSS variables
- **Touch-Friendly**: Large touch targets for mobile users

### Frontend Architecture

#### JavaScript Modules

- **`pets.js`**: Pet listing, filtering, and pagination logic
- **`home.js`**: Homepage statistics and dynamic content
- **`auth.js`**: Authentication form handling
- **`shared.js`**: Common utilities and API helpers
- **`main.js`**: Core application initialization

#### CSS Architecture

- **Modular Approach**: Feature-specific stylesheets
- **CSS Variables**: Consistent theming and colors
- **Utility Classes**: Reusable styling patterns
- **Modern Features**: Gradients, shadows, and animations

---

## 📚 API Documentation

### Swagger/OpenAPI Integration

The API includes comprehensive documentation generated automatically from the NestJS decorators and DTOs:

- **Interactive Documentation**: Available at `/api/docs` when running the application
- **OpenAPI 3.0 Specification**: Fully compliant with modern API standards
- **Live Testing**: Execute API calls directly from the documentation interface
- **Schema Definitions**: Complete request/response schemas with validation rules
- **Authentication Integration**: Test protected endpoints with session authentication

### API Features

- **RESTful Design**: Following REST principles with proper HTTP methods and status codes
- **Consistent Responses**: Standardized response format across all endpoints
- **Error Handling**: Structured error responses with meaningful messages
- **Validation**: Request validation using class-validator with detailed error messages
- **Pagination**: Consistent pagination pattern for list endpoints
- **Filtering**: Advanced filtering capabilities with query parameters

### Access the Documentation

```bash
# Start the application
npm run start:dev

# Open in browser
http://localhost:3000/api/docs
```

## � API Endpoints

### User Schema

```typescript
interface User {
  _id: ObjectId;
  username: string; // Unique username
  firstname: string; // First name
  lastname: string; // Last name
  email: string; // Unique email (lowercase)
  password: string; // Hashed with bcryptjs
  age: number; // Age validation (18-120)
  role: 'user' | 'admin'; // Role-based access control
  isEmailVerified: boolean; // Email verification status
  emailVerificationToken?: string; // Email verification token
  passwordResetToken?: string; // Password reset token
  passwordResetExpires?: Date; // Password reset expiration
  createdAt: Date;
  updatedAt: Date;
}
```

### Pet Schema

```typescript
interface Pet {
  _id: ObjectId;
  name: string; // Pet name (required)
  breed: string; // Pet breed (required)
  age: number; // Pet age (0-30 years)
  species: 'dog' | 'cat' | 'rabbit' | 'bird' | 'other'; // Pet species
  gender: 'male' | 'female'; // Pet gender
  owner: ObjectId | null; // Current owner reference
  status: 'available' | 'adopted' | 'pending'; // Adoption status
  description?: string; // Pet description
  image?: string; // Pet image URL
  characteristics: string[]; // Pet characteristics array
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
  status: 'pending' | 'approved' | 'rejected'; // Adoption status
  adminApprover?: ObjectId; // Admin who approved/rejected
  requestDate: Date; // Request creation date (default: now)
  approvedDate?: Date; // Approval date
  rejectedDate?: Date; // Rejection date
  notes?: string; // Admin notes
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Features

- **Automatic Timestamps**: All schemas include `createdAt` and `updatedAt`
- **Schema Validation**: Built-in Mongoose validation with custom rules
- **Enum Validations**: Strict enum validation for status fields
- **Reference Integrity**: ObjectId references with proper population
- **Indexing**: Optimized queries with strategic indexes on frequently searched fields
- **Soft Deletes**: Documents are marked as deleted rather than physically removed

---

## 🔐 Authentication & Authorization

### Authentication System

**Session-Based Authentication** with secure cookie management:

1. **User Registration/Login**
   - User provides credentials (username/email and password)
   - Server validates credentials against database
   - Session is created and stored server-side
   - Secure httpOnly cookie is sent to client

2. **Session Management**
   - Sessions stored server-side with express-session
   - Secure cookies with httpOnly flag prevent XSS
   - 24-hour session expiration with automatic renewal
   - Session data includes user ID, username, and role

3. **Route Protection**
   - `SessionAuthGuard` validates session existence
   - Custom `@GetUser()` decorator extracts user from session
   - Middleware checks session validity on protected routes

### Authorization Levels

- **Public Routes**: Homepage, pet listing, login, register
- **Protected Routes**: Adoption management, user profiles
- **Admin Routes**: Pet creation, user management, statistics
- **Resource-Based**: Users can only modify their own resources

### Security Features

- **Password Hashing**: bcryptjs with salt rounds for secure password storage
- **Session Security**: httpOnly cookies with secure flag in production
- **Rate Limiting**: Configurable throttling to prevent brute force attacks
- **Input Validation**: class-validator with strict DTO validation
- **CORS Protection**: Configured origins and credentials handling
- **Error Handling**: Sanitized error responses to prevent information leakage

### Role-Based Access Control (RBAC)

```typescript
enum UserRole {
  USER = 'user', // Can adopt pets, manage own profile
  ADMIN = 'admin', // Full platform access, user management
}
```

### Session Configuration

```typescript
session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
});
```

---

## � API Documentation

### Swagger/OpenAPI Integration

The API includes comprehensive documentation generated automatically from the NestJS decorators and DTOs:

- **Interactive Documentation**: Available at `/api/docs` when running the application
- **OpenAPI 3.0 Specification**: Fully compliant with modern API standards
- **Live Testing**: Execute API calls directly from the documentation interface
- **Schema Definitions**: Complete request/response schemas with validation rules
- **Authentication Integration**: Test protected endpoints with session authentication

### API Features

- **RESTful Design**: Following REST principles with proper HTTP methods and status codes
- **Consistent Responses**: Standardized response format across all endpoints
- **Error Handling**: Structured error responses with meaningful messages
- **Validation**: Request validation using class-validator with detailed error messages
- **Pagination**: Consistent pagination pattern for list endpoints
- **Filtering**: Advanced filtering capabilities with query parameters

### Access the Documentation

```bash
# Start the application
npm run start:dev

# Open in browser
http://localhost:3000/api/docs
```

## �📡 API Endpoints

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

## 📝 Logging System

### Winston Integration

The application uses Winston for comprehensive logging with multiple levels and output formats:

#### Log Levels

- **error**: Error conditions requiring immediate attention
- **warn**: Warning conditions that should be addressed
- **info**: General application information
- **http**: HTTP request/response logging
- **verbose**: Verbose information for debugging
- **debug**: Debug information for development
- **silly**: Most detailed logging level

#### Development Logging

- **Colorized Console Output**: Easy-to-read colored logs in development
- **Structured Format**: Timestamp, level, context, and message formatting
- **Request ID Tracking**: Track requests across the application
- **Context Awareness**: Service and module context in log messages

#### Production Logging

- **File Rotation**: Automatic log file rotation with size limits
- **JSON Format**: Structured JSON logs for parsing and analysis
- **Error Isolation**: Separate error logs for critical issues
- **Exception Handling**: Unhandled exceptions and promise rejections

#### Log Files (Production)

```
logs/
├── combined.log     # All application logs (20MB, 5 files)
├── errors.log       # Error-level logs only (10MB, 10 files)
├── exceptions.log   # Unhandled exceptions
└── rejections.log   # Promise rejections
```

#### Usage Example

```typescript
// In services
this.logger.info('User registration started', 'AuthService', { userId });
this.logger.warn('Invalid login attempt', 'AuthService', { email });
this.logger.error('Database connection failed', 'DatabaseService', error);
```

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
SESSION_SECRET=your-super-secure-production-secret-min-32-chars
FRONTEND_URL=https://your-frontend-domain.com
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

---

## ⚡ Performance & Optimization

### Backend Optimizations

- **Database Indexing**: Strategic indexes on frequently queried fields
- **Query Optimization**: Efficient MongoDB queries with projection and lean()
- **Connection Pooling**: MongoDB connection pool for better resource management
- **Rate Limiting**: Configurable throttling to prevent abuse
- **Compression**: Response compression for better network performance
- **Caching**: Session-based caching for user data and authentication

### Frontend Optimizations

- **Server-Side Rendering**: Fast initial page loads with Handlebars
- **Minimal JavaScript**: Progressive enhancement with vanilla JavaScript
- **CSS Optimization**: Modular CSS with minimal redundancy
- **Image Optimization**: Proper image sizing and lazy loading
- **Browser Caching**: Proper cache headers for static assets

### Monitoring & Metrics

- **Structured Logging**: Comprehensive logging with Winston
- **Error Tracking**: Global exception handling and logging
- **Performance Monitoring**: HTTP request timing and database query tracking
- **Health Checks**: Application health monitoring endpoints

---

## 🚀 Deployment

### Production Checklist

- [ ] Configure environment variables
- [ ] Set up MongoDB with replica set
- [ ] Configure SSL/TLS certificates
- [ ] Set up reverse proxy (nginx)
- [ ] Configure log rotation
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy
- [ ] Set up health checks

### Docker Deployment

```dockerfile
# Example Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

### Environment Configuration

```env
# Production environment
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://mongo-cluster/adoptme-db
SESSION_SECRET=your-super-secure-production-secret-min-32-chars

# Security
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# CORS
FRONTEND_URL=https://your-domain.com
```

---

## 🤝 Contributing

### Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/adoptme-app-nestjs-api-rest.git
   cd adoptme-app-nestjs-api-rest
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment**

   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

4. **Start Development Server**

   ```bash
   npm run start:dev
   ```

5. **Generate Test Data**
   ```bash
   curl -X POST http://localhost:3000/api/mocking/pets \
     -H "Content-Type: application/json" \
     -d '{"count": 50}'
   ```

### Development Workflow

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow TypeScript best practices
   - Add appropriate tests
   - Update documentation if needed

3. **Run Tests**

   ```bash
   npm run test:all
   npm run lint
   ```

4. **Commit Changes**

   ```bash
   git commit -m "feat: add your feature description"
   ```

5. **Submit Pull Request**
   - Provide clear description
   - Include screenshots if UI changes
   - Ensure all tests pass

### Coding Standards

- **TypeScript**: Strict type checking with latest ES features
- **ESLint**: Automated linting with custom rules
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Structured commit messages
- **Testing**: Comprehensive unit and integration tests
- **Documentation**: Update README and API docs for changes

### Architecture Guidelines

- **Modular Design**: Feature-based module organization
- **Separation of Concerns**: Clear separation between layers
- **Dependency Injection**: Use NestJS IoC container
- **Error Handling**: Comprehensive error handling with logging
- **Security First**: Follow security best practices
- **Performance**: Consider performance implications

---

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support & Troubleshooting

### Common Issues

**Database Connection Issues**

```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

**Port Already in Use**

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

**Session Issues**

- Ensure SESSION_SECRET is set in environment
- Check cookie settings in browser
- Clear browser cookies for localhost

### Getting Help

- 📖 **Documentation**: Check the comprehensive API docs at `/api/docs`
- 🐛 **Issues**: Create an issue in the repository with details
- 💬 **Discussions**: Use GitHub Discussions for questions
- 📝 **Examples**: Review test files for usage examples
- 🔍 **Debugging**: Check logs in `logs/` directory

### Useful Commands

```bash
# View recent logs
tail -f logs/combined.log

# Test API endpoints
curl -X GET http://localhost:3000/api/pets

# Generate mock data
curl -X POST http://localhost:3000/api/mocking/generatedata

# Health check
curl http://localhost:3000/api/health
```

---

## 📊 Project Status

- ✅ **Core Features**: Complete user, pet, and adoption management
- ✅ **Authentication**: Session-based authentication with security
- ✅ **Web Interface**: Responsive design with advanced filtering
- ✅ **API Documentation**: Comprehensive Swagger/OpenAPI docs
- ✅ **Logging**: Enterprise-grade logging with Winston
- ✅ **Testing**: Unit and integration test coverage
- ✅ **Performance**: Optimized queries and caching
- 🔄 **Active Development**: Continuous improvements and features

---

**Built with ❤️ using NestJS, TypeScript, MongoDB, and modern web technologies**

_AdoptMe - Connecting pets with loving families through technology_

```

```
