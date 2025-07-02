# 🐾 AdoptMe - Pet Adoption Platform

**A modern, full-stack pet adoption platform built with NestJS, TypeScript, and MongoDB**

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

[![Docker Hub](https://img.shields.io/docker/pulls/tukisito/adoptme-app?style=for-the-badge&logo=docker&logoColor=white&label=Docker%20Hub)](https://hub.docker.com/r/tukisito/adoptme-app)

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/OmarReales/adoptme-app-nestjs-api-rest.git
cd adoptme-app-nestjs-api-rest

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Start with Docker (recommended)
docker-compose up -d

# Or start locally
npm run start:dev
```

**🌐 Access the application:**

- **Web Interface**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health

---

## ✨ Key Features

### 🎯 Core Functionality

- **Complete User Management** with authentication and profiles
- **Advanced Pet Management** with detailed information and search
- **Smart Adoption System** with request workflow management
- **Real-time Statistics Dashboard** with platform metrics
- **Notification System** for adoption events and updates

### 🎨 Modern Web Interface

- **Responsive Design** optimized for all devices
- **Advanced Filtering & Search** with persistent URL state
- **Session-based Authentication** with secure cookie management
- **Server-side Rendering** with Handlebars templates

### 🛡️ Enterprise-Grade Features

- **Hybrid Authentication** (Sessions + JWT for API)
- **Comprehensive Logging** with Winston
- **Rate Limiting & Security** middleware
- **Input Validation** with TypeScript DTOs
- **Auto-generated API Documentation** with Swagger

---

## 🛠️ Technology Stack

| Category           | Technologies                        |
| ------------------ | ----------------------------------- |
| **Backend**        | NestJS, TypeScript, Express         |
| **Database**       | MongoDB, Mongoose ODM               |
| **Frontend**       | Handlebars, Bootstrap 5, Vanilla JS |
| **Authentication** | Express Session, JWT, bcryptjs      |
| **DevOps**         | Docker, Docker Compose              |
| **Testing**        | Mocha, Chai, Supertest              |
| **Logging**        | Winston with file rotation          |

---

## 📚 Documentation

### 🚀 Getting Started

- [Installation Guide](#installation)
- [Environment Configuration](#configuration)
- [API Documentation](http://localhost:3000/api/docs) (when running)

### 🐳 Deployment

- [**Docker Deployment Guide**](./docs/deployment/docker.md) - Complete Docker setup and production deployment
- [**Production Checklist**](./docs/deployment/production.md) - Security and performance considerations

### 👨‍💻 Development

- [**Authentication Guide**](./docs/development/authentication.md) - Hybrid auth system (Sessions + JWT)
- [**Security Features**](./docs/development/security.md) - Security improvements and best practices
- [**API Reference**](./docs/development/api-reference.md) - Detailed API endpoints documentation

### 📝 Changelog

- [**Refactoring Summary**](./docs/changelog/refactoring-summary.md) - Recent improvements and changes

### 📖 Complete Documentation Index

- [**📚 Documentation Index**](./docs/index.md) - Complete documentation organized by role and topic

> 💡 **Tip**: Visit [docs/index.md](./docs/index.md) for the complete documentation index with guides organized by developer role and expertise level.

---

## ⚙️ Installation

### Prerequisites

- **Node.js** (v18+)
- **MongoDB** (v5+)
- **Docker** (optional, recommended)

### Method 1: Docker (Recommended)

```bash
# Quick start with Docker
docker-compose up -d

# View logs
docker-compose logs -f adoptme-app

# Generate sample data
curl -X POST http://localhost:3000/api/mocking/generatedata
```

### Method 2: Local Development

```bash
# Install dependencies
npm install

# Start MongoDB (if not using Docker)
sudo systemctl start mongod

# Run the application
npm run start:dev

# Generate sample data
curl -X POST http://localhost:3000/api/mocking/pets -H "Content-Type: application/json" -d '{"count": 50}'
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/adoptme-db

# Server
PORT=3000
NODE_ENV=development

# Authentication
SESSION_SECRET=your-super-secret-session-key-min-32-characters
JWT_SECRET=your-jwt-secret-min-32-characters

# Security
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Quick Commands

```bash
# Development
npm run start:dev          # Start with hot reload
npm run build              # Build for production
npm run start:prod         # Start production build

# Testing
npm run test:all           # Run all tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format with Prettier
```

---

## 🌐 Web Interface

### Available Routes

| Route             | Description                       | Access    |
| ----------------- | --------------------------------- | --------- |
| `/`               | Homepage with statistics          | Public    |
| `/view-pets`      | Pet listing with advanced filters | Public    |
| `/login`          | User authentication               | Public    |
| `/register`       | User registration                 | Public    |
| `/view-adoptions` | Adoption management               | Protected |
| `/pets/create`    | Create new pet                    | Admin     |

### API Endpoints

| Module             | Endpoints              | Documentation                |
| ------------------ | ---------------------- | ---------------------------- |
| **Authentication** | `/api/auth/*`          | Login, register, logout      |
| **Users**          | `/api/users/*`         | User management and profiles |
| **Pets**           | `/api/pets/*`          | Pet management and search    |
| **Adoptions**      | `/api/adoptions/*`     | Adoption workflow            |
| **Notifications**  | `/api/notifications/*` | User notifications           |

**📖 Complete API Documentation**: http://localhost:3000/api/docs

---

## 🧪 Testing

```bash
# Run all tests
npm run test:all

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:mocha:watch

# Test specific module
npm run test:unit -- --grep "PetsService"
```

---

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** with tests
4. **Run quality checks**: `npm run lint && npm run test:all`
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Use conventional commit messages

---

## 📞 Support & Troubleshooting

### Common Issues

**Database Connection Failed**

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

### Getting Help

- 📖 **Documentation**: Check the `/docs` folder for detailed guides
- 🐛 **Issues**: Create an issue in the repository
- 💬 **Discussions**: Use GitHub Discussions for questions
- 📝 **API Docs**: Visit `/api/docs` when running the application

### Health Check

```bash
# Application health
curl http://localhost:3000/api/health

# View logs
tail -f logs/combined.log

# Generate test data
curl -X POST http://localhost:3000/api/mocking/generatedata
```

---

## 📊 Project Status

- ✅ **Core Features**: Complete user, pet, and adoption management
- ✅ **Authentication**: Hybrid session + JWT authentication system
- ✅ **Web Interface**: Responsive design with advanced filtering
- ✅ **API Documentation**: Interactive Swagger/OpenAPI documentation
- ✅ **Security**: Enterprise-grade security and validation
- ✅ **Testing**: Comprehensive unit and integration tests
- ✅ **Docker Ready**: Production-ready containerization
- 🔄 **Active Development**: Continuous improvements and new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using NestJS, TypeScript, MongoDB, and modern web technologies**

_AdoptMe - Connecting pets with loving families through technology_
