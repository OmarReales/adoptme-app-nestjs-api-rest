# 📚 Documentation Index - AdoptMe

Welcome to the AdoptMe documentation! This index helps you find the information you need quickly.

## 🚀 Getting Started

| Document                                            | Description                    | For        |
| --------------------------------------------------- | ------------------------------ | ---------- |
| [Main README](../README.md)                         | Quick start guide and overview | Everyone   |
| [Installation Guide](../README.md#installation)     | Setup instructions             | Developers |
| [API Documentation](http://localhost:3000/api/docs) | Interactive API docs           | Developers |

---

## 🐳 Deployment

| Document                                           | Description                          | For              |
| -------------------------------------------------- | ------------------------------------ | ---------------- |
| [Docker Guide](./deployment/docker.md)             | Complete Docker setup and deployment | DevOps Engineers |
| [Production Checklist](./deployment/production.md) | Production deployment guide          | DevOps Engineers |

### Deployment Quick Links

- **Development**: `docker-compose up -d`
- **Production**: See [Production Guide](./deployment/production.md)
- **Docker Hub**: [tukisito/adoptme-app](https://hub.docker.com/r/tukisito/adoptme-app)

---

## 👨‍💻 Development

| Document                                                | Description                              | For                        |
| ------------------------------------------------------- | ---------------------------------------- | -------------------------- |
| [Authentication Guide](./development/authentication.md) | Hybrid auth system (Sessions + JWT)      | Backend Developers         |
| [Security Features](./development/security.md)          | Security improvements and best practices | Security Engineers         |
| [API Reference](./development/api-reference.md)         | Complete API endpoint documentation      | Frontend/Mobile Developers |

### Development Quick Links

- **Auth System**: Hybrid (Sessions + JWT)
- **Database**: MongoDB with Mongoose
- **Testing**: `npm run test:all`
- **Linting**: `npm run lint`

---

## 📝 Changelog & History

| Document                                                  | Description                     | For              |
| --------------------------------------------------------- | ------------------------------- | ---------------- |
| [Refactoring Summary](./changelog/refactoring-summary.md) | Recent improvements and changes | Development Team |

---

## 🔗 External Resources

| Resource          | Description                       | Link                                                      |
| ----------------- | --------------------------------- | --------------------------------------------------------- |
| **Live API Docs** | Interactive Swagger documentation | http://localhost:3000/api/docs                            |
| **Docker Hub**    | Official Docker images            | https://hub.docker.com/r/tukisito/adoptme-app             |
| **GitHub**        | Source code repository            | https://github.com/OmarReales/adoptme-app-nestjs-api-rest |

---

## 🎯 Quick Navigation by Role

### 🆕 New Developers

1. Read [Main README](../README.md)
2. Follow [Installation Guide](../README.md#installation)
3. Explore [API Documentation](http://localhost:3000/api/docs)
4. Review [Authentication Guide](./development/authentication.md)

### 🚀 DevOps Engineers

1. Review [Docker Guide](./deployment/docker.md)
2. Follow [Production Checklist](./deployment/production.md)
3. Check [Security Features](./development/security.md)

### 📱 Frontend/Mobile Developers

1. Study [API Reference](./development/api-reference.md)
2. Understand [Authentication Guide](./development/authentication.md)
3. Test with [Live API Docs](http://localhost:3000/api/docs)

### 🔒 Security Engineers

1. Review [Security Features](./development/security.md)
2. Check [Production Checklist](./deployment/production.md)
3. Analyze [Authentication Guide](./development/authentication.md)

---

## 📋 Project Structure

```
docs/
├── index.md                           # This index
├── deployment/
│   ├── docker.md                      # Docker deployment guide
│   └── production.md                  # Production checklist
├── development/
│   ├── authentication.md              # Auth system guide
│   ├── security.md                    # Security features
│   └── api-reference.md               # API documentation
└── changelog/
    └── refactoring-summary.md         # Recent changes
```

---

## 🆘 Getting Help

### 📖 Documentation Issues

If you find issues with the documentation:

1. Check if information is outdated
2. Create an issue in the repository
3. Suggest improvements

### 🐛 Technical Issues

For technical problems:

1. Check [Troubleshooting](../README.md#support--troubleshooting)
2. Review relevant documentation
3. Check application logs
4. Create an issue with details

### 💬 Questions & Discussions

For questions and discussions:

1. Use GitHub Discussions
2. Check existing documentation first
3. Provide context and examples

---

## 🔄 Documentation Updates

This documentation is actively maintained. Last updated: **July 2, 2025**

### Contributing to Documentation

1. Fork the repository
2. Make your changes
3. Test documentation locally
4. Submit a pull request
5. Wait for review

### Documentation Standards

- Use clear, concise language
- Include code examples
- Add navigation links
- Keep formatting consistent
- Update this index when adding new docs

---

**Happy coding! 🚀**
