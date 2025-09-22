# Infrastructure Runbook

This document provides operational procedures for managing the MechCraft Hub infrastructure in production.

## Table of Contents

1. [Deployment Procedures](#deployment-procedures)
2. [Monitoring and Alerting](#monitoring-and-alerting)
3. [Backup and Recovery](#backup-and-recovery)
4. [Security Procedures](#security-procedures)
5. [Incident Response](#incident-response)
6. [Maintenance Windows](#maintenance-windows)
7. [Troubleshooting](#troubleshooting)

## Deployment Procedures

### Pre-Deployment Checklist

- [ ] Database backup completed
- [ ] All tests passing in CI/CD pipeline
- [ ] Security scans completed successfully
- [ ] Monitoring systems operational
- [ ] Rollback plan prepared
- [ ] Team notified of deployment window

### Production Deployment

#### 1. Blue-Green Deployment

```bash
# 1. Deploy to staging environment
docker-compose -f docker-compose.staging.yml up -d

# 2. Run smoke tests
./scripts/smoke_tests.sh

# 3. Deploy to production (blue environment)
docker-compose -f docker-compose.prod.yml up -d

# 4. Verify deployment
curl -f https://yourdomain.com/health/ || exit 1

# 5. Switch traffic (update load balancer)
# 6. Monitor for 15 minutes
# 7. Decommission old environment
```

#### 2. Rolling Deployment

```bash
# 1. Update one service at a time
docker-compose -f docker-compose.prod.yml up -d --no-deps backend

# 2. Wait for health check
sleep 30

# 3. Update next service
docker-compose -f docker-compose.prod.yml up -d --no-deps nginx

# 4. Verify all services
docker-compose -f docker-compose.prod.yml ps
```

### Post-Deployment Verification

```bash
# Health checks
curl -f https://yourdomain.com/health/
curl -f https://yourdomain.com/api/docs/

# Database connectivity
docker-compose exec backend python manage.py dbshell -c "SELECT 1;"

# Redis connectivity
docker-compose exec backend python -c "import redis; r = redis.Redis.from_url('redis://:password@redis:6379/0'); print(r.ping())"

# File upload test
curl -X POST -F "file=@test.pdf" https://yourdomain.com/api/upload/

# Metrics endpoint
curl -f https://yourdomain.com/metrics/
```

## Monitoring and Alerting

### Key Metrics to Monitor

#### Application Metrics
- Request rate and response time
- Error rate (4xx, 5xx responses)
- Database connection pool usage
- Cache hit/miss ratio
- File upload success rate

#### Infrastructure Metrics
- CPU usage (alert if > 80%)
- Memory usage (alert if > 90%)
- Disk space (alert if < 10% free)
- Network I/O
- Database performance

#### Security Metrics
- Failed login attempts
- File upload rejections
- Security events
- Rate limiting triggers

### Alerting Rules

#### Critical Alerts (Immediate Response)
- Application down
- Database down
- High error rate (> 10%)
- Disk space critical (< 5%)

#### Warning Alerts (Response within 1 hour)
- High CPU usage (> 80%)
- High memory usage (> 90%)
- High response time (> 2s)
- Security events spike

### Monitoring Tools

#### Prometheus Queries

```promql
# Error rate
rate(django_requests_total{status_code=~"5.."}[5m])

# Response time 95th percentile
histogram_quantile(0.95, rate(django_request_duration_seconds_bucket[5m]))

# Memory usage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes

# CPU usage
100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

#### Grafana Dashboards

1. **Application Overview**: Request rate, response time, error rate
2. **Infrastructure**: CPU, memory, disk, network
3. **Security**: Failed logins, security events, file uploads
4. **Database**: Connection pool, query performance, locks

## Backup and Recovery

### Backup Procedures

#### Daily Database Backup

```bash
# Automated backup (runs via cron)
0 2 * * * /app/scripts/pg_backup.sh --compress --s3-upload

# Manual backup
docker-compose exec backend python manage.py backup_db --compress --s3-upload
```

#### Backup Verification

```bash
# List recent backups
aws s3 ls s3://your-backup-bucket/postgresql/

# Test restore (on staging)
./scripts/pg_restore.sh s3://your-backup-bucket/postgresql/backup_20240101_020000.sql.gz --dry-run
```

### Recovery Procedures

#### Database Recovery

```bash
# 1. Stop application
docker-compose stop backend

# 2. Download backup from S3
aws s3 cp s3://your-backup-bucket/postgresql/backup_20240101_020000.sql.gz ./backup.sql.gz

# 3. Restore database
./scripts/pg_restore.sh backup.sql.gz --drop-db --create-db

# 4. Verify restore
docker-compose exec postgres psql -U postgres -d mechcraft -c "SELECT COUNT(*) FROM api_user;"

# 5. Start application
docker-compose start backend
```

#### Point-in-Time Recovery

```bash
# 1. Stop application
docker-compose stop backend

# 2. Restore base backup
./scripts/pg_restore.sh base_backup.sql.gz --drop-db --create-db

# 3. Apply WAL files (if available)
# This requires WAL archiving to be enabled

# 4. Start application
docker-compose start backend
```

### Backup Testing

```bash
# Monthly backup restore test
# 1. Create test database
createdb mechcraft_test

# 2. Restore backup to test database
pg_restore -d mechcraft_test backup.sql

# 3. Verify data integrity
psql -d mechcraft_test -c "SELECT COUNT(*) FROM api_user;"

# 4. Clean up
dropdb mechcraft_test
```

## Security Procedures

### Security Monitoring

#### Daily Security Checks

```bash
# Check failed login attempts
docker-compose exec backend python manage.py shell -c "
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from axes.models import AccessAttempt
recent_attempts = AccessAttempt.objects.filter(
    attempt_time__gte=timezone.now() - timedelta(days=1)
)
print(f'Failed login attempts in last 24h: {recent_attempts.count()}')
"

# Check security events
docker-compose exec backend python manage.py shell -c "
from api.monitoring import SecurityLogger
# Review security logs
"

# Check file upload rejections
docker-compose exec backend python manage.py shell -c "
from api.models import FileUpload
rejected_uploads = FileUpload.objects.filter(
    status='rejected',
    created_at__gte=timezone.now() - timedelta(days=1)
)
print(f'Rejected uploads in last 24h: {rejected_uploads.count()}')
"
```

#### Weekly Security Review

1. Review access logs
2. Check for suspicious activities
3. Verify backup integrity
4. Update security patches
5. Review user permissions

### Incident Response

#### Security Incident Response

1. **Immediate Response (0-15 minutes)**
   - Assess scope and impact
   - Isolate affected systems if necessary
   - Notify security team
   - Document initial findings

2. **Containment (15-60 minutes)**
   - Block malicious IPs
   - Reset compromised credentials
   - Enable additional monitoring
   - Preserve evidence

3. **Eradication (1-4 hours)**
   - Remove malware/threats
   - Patch vulnerabilities
   - Update security controls
   - Verify system integrity

4. **Recovery (4-24 hours)**
   - Restore normal operations
   - Monitor for recurrence
   - Update incident documentation
   - Conduct post-incident review

#### Incident Communication

```bash
# Emergency contact list
SECURITY_TEAM="security@company.com"
DEVOPS_TEAM="devops@company.com"
MANAGEMENT="management@company.com"

# Incident notification template
cat > incident_notification.txt << EOF
SECURITY INCIDENT ALERT

Time: $(date)
Severity: [CRITICAL/HIGH/MEDIUM/LOW]
Affected Systems: [List affected systems]
Description: [Brief description]
Actions Taken: [List actions taken]
Next Steps: [List next steps]

Contact: [Your contact information]
EOF
```

## Maintenance Windows

### Scheduled Maintenance

#### Weekly Maintenance (Sundays 2-4 AM)

```bash
# 1. Backup database
docker-compose exec backend python manage.py backup_db --compress --s3-upload

# 2. Update system packages
docker-compose exec backend apt-get update && apt-get upgrade -y

# 3. Clean up old logs
find /app/logs -name "*.log" -mtime +30 -delete

# 4. Restart services
docker-compose restart

# 5. Verify health
curl -f https://yourdomain.com/health/
```

#### Monthly Maintenance (First Sunday 2-6 AM)

```bash
# 1. Full system backup
./scripts/full_system_backup.sh

# 2. Security updates
docker-compose pull
docker-compose up -d

# 3. Database maintenance
docker-compose exec postgres psql -U postgres -c "VACUUM ANALYZE;"

# 4. Log rotation
docker-compose exec backend logrotate /etc/logrotate.conf

# 5. Performance review
# Review metrics and optimize as needed
```

### Emergency Maintenance

```bash
# Emergency maintenance procedure
# 1. Notify users
# 2. Put maintenance page
# 3. Perform maintenance
# 4. Verify functionality
# 5. Remove maintenance page
# 6. Notify users of completion
```

## Troubleshooting

### Common Issues

#### Application Won't Start

```bash
# Check logs
docker-compose logs backend

# Check database connectivity
docker-compose exec postgres pg_isready -U postgres

# Check Redis connectivity
docker-compose exec redis redis-cli ping

# Check environment variables
docker-compose exec backend env | grep -E "(SECRET|PASSWORD|KEY)"
```

#### High Memory Usage

```bash
# Check memory usage
docker stats

# Check for memory leaks
docker-compose exec backend python manage.py shell -c "
import psutil
print(f'Memory usage: {psutil.virtual_memory().percent}%')
"

# Restart services
docker-compose restart backend
```

#### Database Connection Issues

```bash
# Check database status
docker-compose exec postgres pg_isready -U postgres

# Check connection pool
docker-compose exec backend python manage.py shell -c "
from django.db import connection
print(f'Active connections: {len(connection.queries)}')
"

# Check database logs
docker-compose logs postgres
```

#### File Upload Issues

```bash
# Check ClamAV status
docker-compose exec clamav clamdscan --version

# Check file permissions
docker-compose exec backend ls -la /app/media/

# Check disk space
docker-compose exec backend df -h
```

### Performance Optimization

#### Database Optimization

```sql
-- Check slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY n_distinct DESC;

-- Analyze tables
ANALYZE;
```

#### Application Optimization

```bash
# Check Django debug info
docker-compose exec backend python manage.py shell -c "
from django.conf import settings
print(f'DEBUG: {settings.DEBUG}')
print(f'Database: {settings.DATABASES[\"default\"][\"ENGINE\"]}')
print(f'Cache: {settings.CACHES[\"default\"][\"BACKEND\"]}')
"

# Check cache performance
docker-compose exec backend python manage.py shell -c "
from django.core.cache import cache
cache.set('test', 'value', 30)
print(f'Cache test: {cache.get(\"test\")}')
"
```

### Emergency Procedures

#### Complete System Recovery

```bash
# 1. Stop all services
docker-compose down

# 2. Restore from backup
aws s3 cp s3://your-backup-bucket/full-backup.tar.gz ./
tar -xzf full-backup.tar.gz

# 3. Restore database
./scripts/pg_restore.sh database_backup.sql --drop-db --create-db

# 4. Restore media files
aws s3 sync s3://your-backup-bucket/media/ ./media/

# 5. Start services
docker-compose up -d

# 6. Verify functionality
curl -f https://yourdomain.com/health/
```

#### Data Corruption Recovery

```bash
# 1. Stop application
docker-compose stop backend

# 2. Check database integrity
docker-compose exec postgres psql -U postgres -d mechcraft -c "CHECKPOINT;"

# 3. Restore from last known good backup
./scripts/pg_restore.sh last_good_backup.sql --drop-db --create-db

# 4. Start application
docker-compose start backend
```

## Contact Information

### Emergency Contacts

- **On-Call Engineer**: +1-555-0123
- **Security Team**: security@company.com
- **DevOps Team**: devops@company.com
- **Management**: management@company.com

### Escalation Procedures

1. **Level 1**: On-call engineer (0-15 minutes)
2. **Level 2**: Senior engineer (15-30 minutes)
3. **Level 3**: Engineering manager (30-60 minutes)
4. **Level 4**: CTO (60+ minutes)

### External Services

- **AWS Support**: Enterprise support plan
- **Cloudflare Support**: Business support plan
- **Sentry Support**: Team plan
- **Database Hosting**: Managed PostgreSQL service

## Appendix

### Useful Commands

```bash
# Quick health check
curl -f https://yourdomain.com/health/ && echo "OK" || echo "FAILED"

# Check all services
docker-compose ps

# View logs
docker-compose logs -f backend

# Execute commands
docker-compose exec backend python manage.py shell

# Backup database
docker-compose exec backend python manage.py backup_db

# Restart services
docker-compose restart

# Update services
docker-compose pull && docker-compose up -d
```

### Monitoring URLs

- **Application**: https://yourdomain.com
- **API Docs**: https://yourdomain.com/api/docs/
- **Health Check**: https://yourdomain.com/health/
- **Metrics**: https://yourdomain.com/metrics/
- **Grafana**: https://monitoring.yourdomain.com
- **Prometheus**: https://monitoring.yourdomain.com:9090
