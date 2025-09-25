# پلتفرم مهندسی سایدا

پلتفرم تخصصی خدمات مهندسی مکانیک با امنیت پیشرفته و زیرساخت سخت‌افزاری بهینه.

## 🚀 Features

- **Secure File Upload**: ClamAV antivirus scanning, magic bytes validation, file type restrictions
- **Database Security**: PostgreSQL with automated backups, point-in-time recovery
- **Monitoring & Logging**: Sentry integration, Prometheus metrics, comprehensive alerting
- **CI/CD Pipeline**: Automated security scanning, vulnerability assessment, quality gates
- **Infrastructure Hardening**: Non-root containers, minimal base images, security headers
- **Secrets Management**: Environment-based configuration, AWS Secrets Manager support

## 🏗️ Architecture

### Backend (Django)
- Django 5.2 with DRF
- PostgreSQL database with Redis caching
- JWT authentication with rate limiting
- File upload security with ClamAV
- Comprehensive monitoring and logging

### Frontend (React)
- Vite + TypeScript + React
- shadcn/ui components
- Tailwind CSS styling
- Responsive design

### Infrastructure
- Docker containerization
- Nginx reverse proxy
- Prometheus + Grafana monitoring
- Automated backups to S3

## 🔒 Security Features

### File Upload Security
- ClamAV antivirus scanning
- Magic bytes validation
- File type restrictions
- Size limits and sanitization

### Application Security
- JWT authentication
- Rate limiting and throttling
- CSRF protection
- Content Security Policy (CSP)
- Security headers (HSTS, X-Frame-Options, etc.)

### Infrastructure Security
- Non-root container execution
- Minimal base images
- Network segmentation
- Secrets management
- Regular security updates

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ and npm
- Python 3.11+

### Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd mech-craft-hub
```

2. **Set up environment variables**
```bash
cp env.template .env
# Edit .env with your configuration
```

3. **Start development environment**
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend (in another terminal)
npm install
npm run dev
```

### Production Deployment

1. **Configure production environment**
```bash
# Set production environment variables
export DEBUG=False
export SECRET_KEY=your-production-secret-key
export POSTGRES_PASSWORD=your-secure-password
# ... other production variables
```

2. **Deploy with Docker Compose**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. **Run database migrations**
```bash
docker-compose exec backend python manage.py migrate
```

4. **Create superuser**
```bash
docker-compose exec backend python manage.py createsuperuser
```

## 📊 Monitoring

### Health Checks
- Application health: `https://yourdomain.com/health/`
- Metrics endpoint: `https://yourdomain.com/metrics/`

### Monitoring Stack
- **Prometheus**: Metrics collection
- **Grafana**: Dashboards and visualization
- **Sentry**: Error tracking and performance monitoring

### Key Metrics
- Request rate and response time
- Error rates and security events
- Database performance
- System resources (CPU, memory, disk)

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend
python manage.py test

# Security tests
python manage.py test api.tests_security_integration

# Frontend tests
npm test
```

### Code Quality
```bash
# Linting
cd backend
ruff check .
bandit -r .

# Frontend linting
npm run lint
```

### Database Management
```bash
# Create backup
python manage.py backup_db --compress --s3-upload

# Restore backup
./scripts/pg_restore.sh backup.sql.gz --drop-db --create-db
```

## 📚 Documentation

- [Security Implementation](backend/SECURITY_IMPLEMENTATION.md)
- [Secrets Management](SECRETS_MANAGEMENT.md)
- [Infrastructure Runbook](INFRASTRUCTURE_RUNBOOK.md)
- [API Documentation](backend/API_README.md)

## 🛡️ Security

This project implements comprehensive security measures:

- **File Upload Security**: ClamAV scanning, type validation, size limits
- **Authentication**: JWT with refresh tokens, rate limiting
- **Database Security**: Encrypted connections, regular backups
- **Infrastructure**: Non-root containers, security headers, monitoring
- **CI/CD**: Automated security scanning, vulnerability assessment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and security scans
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the infrastructure runbook

## 🔄 CI/CD Pipeline

The project includes a comprehensive CI/CD pipeline with:

- **Security Scanning**: Bandit, pip-audit, safety checks
- **Code Quality**: Ruff linting, ESLint
- **Testing**: Unit tests, integration tests, security tests
- **Docker Security**: Trivy vulnerability scanning
- **Deployment**: Automated deployment with health checks

## 📈 Performance

- **Caching**: Redis for session and data caching
- **Database**: Optimized queries and connection pooling
- **Static Files**: CDN-ready with proper headers
- **Monitoring**: Real-time performance metrics

## 🔧 Technologies Used

### Backend
- Django 5.2
- Django REST Framework
- PostgreSQL
- Redis
- ClamAV
- Sentry
- Prometheus

### Frontend
- React 18
- TypeScript
- Vite
- shadcn/ui
- Tailwind CSS

### Infrastructure
- Docker
- Nginx
- Prometheus
- Grafana
- AWS S3
