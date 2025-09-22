# Secrets Management Guide

This document outlines the secure management of secrets and sensitive configuration for the MechCraft Hub application.

## Overview

Secrets management is critical for maintaining security in production environments. This guide covers:

- Environment variable management
- GitHub Actions secrets
- AWS Secrets Manager integration
- Local development secrets
- Secret rotation procedures

## Environment Variables

### Required Secrets

Create a `.env` file in the backend directory with the following variables:

```bash
# Django Configuration
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database Configuration
POSTGRES_DB=mechcraft
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-database-password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Redis Configuration
REDIS_PASSWORD=your-secure-redis-password
REDIS_URL=redis://:your-secure-redis-password@localhost:6379/0

# AWS Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_REGION_NAME=us-east-1
S3_BACKUP_BUCKET=your-backup-bucket-name

# Email Configuration
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@domain.com
EMAIL_HOST_PASSWORD=your-email-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

# Security Configuration
TURNSTILE_SITE_KEY=your-turnstile-site-key
TURNSTILE_SECRET_KEY=your-turnstile-secret-key

# Monitoring Configuration
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=1.0.0

# Grafana Configuration
GRAFANA_PASSWORD=your-grafana-admin-password
```

### Optional Configuration

```bash
# ClamAV Configuration
CLAMAV_ENABLED=True
CLAMAV_SOCKET=/var/run/clamav/clamd.ctl

# File Upload Configuration
MAX_FILE_SIZE=52428800  # 50MB
ALLOWED_FILE_TYPES=pdf,image,document,cad

# Backup Configuration
BACKUP_RETENTION_DAYS=30
```

## GitHub Actions Secrets

Configure the following secrets in your GitHub repository:

### Required Secrets

1. **SECRET_KEY**: Django secret key for production
2. **POSTGRES_PASSWORD**: Database password
3. **REDIS_PASSWORD**: Redis password
4. **AWS_ACCESS_KEY_ID**: AWS access key for S3 backups
5. **AWS_SECRET_ACCESS_KEY**: AWS secret key for S3 backups
6. **S3_BACKUP_BUCKET**: S3 bucket name for backups
7. **SENTRY_DSN**: Sentry DSN for error tracking
8. **TURNSTILE_SITE_KEY**: Cloudflare Turnstile site key
9. **TURNSTILE_SECRET_KEY**: Cloudflare Turnstile secret key
10. **EMAIL_HOST_PASSWORD**: Email service password

### Optional Secrets

1. **GRAFANA_PASSWORD**: Grafana admin password
2. **SENTRY_RELEASE**: Release version for Sentry
3. **SENTRY_ENVIRONMENT**: Environment name for Sentry

### Setting GitHub Secrets

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Click on "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add each secret with its corresponding value

## AWS Secrets Manager Integration

For production environments, consider using AWS Secrets Manager for enhanced security:

### 1. Create Secrets in AWS Secrets Manager

```bash
# Create a secret for database credentials
aws secretsmanager create-secret \
    --name "mechcraft/database" \
    --description "Database credentials for MechCraft Hub" \
    --secret-string '{"username":"postgres","password":"your-secure-password","host":"your-db-host","port":"5432","database":"mechcraft"}'

# Create a secret for application configuration
aws secretsmanager create-secret \
    --name "mechcraft/app-config" \
    --description "Application configuration for MechCraft Hub" \
    --secret-string '{"secret_key":"your-secret-key","turnstile_site_key":"your-site-key","turnstile_secret_key":"your-secret-key"}'
```

### 2. Update Application to Use AWS Secrets Manager

Add the following to your Django settings:

```python
import boto3
import json
from botocore.exceptions import ClientError

def get_secret(secret_name, region_name="us-east-1"):
    """Retrieve secret from AWS Secrets Manager"""
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )
    
    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        raise e
    
    return json.loads(get_secret_value_response['SecretString'])

# Use secrets in production
if not DEBUG:
    try:
        db_secret = get_secret("mechcraft/database")
        DATABASES['default'].update({
            'USER': db_secret['username'],
            'PASSWORD': db_secret['password'],
            'HOST': db_secret['host'],
            'PORT': db_secret['port'],
            'NAME': db_secret['database'],
        })
    except Exception as e:
        logger.error(f"Failed to load database secrets: {e}")
```

### 3. IAM Policy for Secrets Manager

Create an IAM policy for your application:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue"
            ],
            "Resource": [
                "arn:aws:secretsmanager:us-east-1:123456789012:secret:mechcraft/*"
            ]
        }
    ]
}
```

## Local Development

### 1. Create .env file

Copy the example environment file:

```bash
cp env.example .env
```

### 2. Generate Secret Key

Generate a new Django secret key:

```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

### 3. Use Docker Compose for Local Development

```bash
# Start local development environment
docker-compose -f docker-compose.dev.yml up -d

# Run database migrations
docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate

# Create superuser
docker-compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser
```

## Secret Rotation

### 1. Database Password Rotation

```bash
# 1. Update password in database
psql -h localhost -U postgres -c "ALTER USER postgres PASSWORD 'new-password';"

# 2. Update application configuration
# Update .env file or AWS Secrets Manager

# 3. Restart application
docker-compose restart backend
```

### 2. Django Secret Key Rotation

```bash
# 1. Generate new secret key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# 2. Update configuration
# Update .env file or AWS Secrets Manager

# 3. Restart application
docker-compose restart backend
```

### 3. AWS Access Key Rotation

```bash
# 1. Create new access key in AWS IAM
# 2. Update application configuration
# 3. Test new credentials
# 4. Delete old access key
```

## Security Best Practices

### 1. Environment File Security

- Never commit `.env` files to version control
- Use `.gitignore` to exclude sensitive files
- Set appropriate file permissions (600)

```bash
chmod 600 .env
```

### 2. Secret Validation

Add secret validation to your application startup:

```python
def validate_required_secrets():
    """Validate that all required secrets are present"""
    required_secrets = [
        'SECRET_KEY',
        'POSTGRES_PASSWORD',
        'REDIS_PASSWORD',
    ]
    
    missing_secrets = []
    for secret in required_secrets:
        if not os.getenv(secret):
            missing_secrets.append(secret)
    
    if missing_secrets:
        raise ValueError(f"Missing required secrets: {', '.join(missing_secrets)}")

# Call during application startup
validate_required_secrets()
```

### 3. Secret Logging

Never log secrets or sensitive information:

```python
import logging

# BAD - Don't do this
logger.info(f"Database password: {os.getenv('POSTGRES_PASSWORD')}")

# GOOD - Do this instead
logger.info("Database connection established")
```

### 4. Regular Security Audits

- Review secrets quarterly
- Rotate secrets annually
- Monitor for secret exposure
- Use tools like `git-secrets` to prevent accidental commits

## Troubleshooting

### Common Issues

1. **Secret not found**: Check environment variable name and value
2. **Permission denied**: Verify file permissions on .env file
3. **AWS credentials error**: Check IAM permissions and region
4. **Database connection failed**: Verify database credentials and network access

### Debug Commands

```bash
# Check environment variables
docker-compose exec backend env | grep -E "(SECRET|PASSWORD|KEY)"

# Test database connection
docker-compose exec backend python manage.py dbshell

# Test Redis connection
docker-compose exec backend python -c "import redis; r = redis.Redis.from_url('redis://:password@redis:6379/0'); print(r.ping())"
```

## Emergency Procedures

### 1. Secret Compromise

If a secret is compromised:

1. Immediately rotate the compromised secret
2. Update all environments
3. Restart all services
4. Review access logs
5. Notify security team

### 2. Database Credential Compromise

1. Change database password immediately
2. Update application configuration
3. Restart application
4. Review database access logs
5. Consider database user rotation

### 3. AWS Credential Compromise

1. Disable compromised access key
2. Create new access key
3. Update application configuration
4. Review CloudTrail logs
5. Consider IAM user rotation
