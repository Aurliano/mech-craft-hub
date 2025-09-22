# Production Configuration Guide

## 1. ClamAV Configuration

### Installation (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install clamav clamav-daemon clamav-freshclam
```

### Configuration
```bash
# Start ClamAV daemon
sudo systemctl start clamav-daemon
sudo systemctl enable clamav-daemon

# Update virus definitions
sudo freshclam

# Configure socket path
echo "LocalSocket /var/run/clamav/clamd.ctl" | sudo tee -a /etc/clamav/clamd.conf
```

### Environment Variables
```bash
export CLAMAV_SOCKET="/var/run/clamav/clamd.ctl"
export CLAMAV_ENABLED="true"
```

### Docker Configuration
```yaml
# docker-compose.prod.yml
services:
  clamav:
    image: clamav/clamav:latest
    container_name: clamav
    ports:
      - "3310:3310"
    volumes:
      - clamav_data:/var/lib/clamav
    environment:
      - CLAMAV_NO_FRESHCLAM=false
      - CLAMAV_NO_CLAMD=false
    restart: unless-stopped

volumes:
  clamav_data:
```

## 2. Sentry Configuration

### Installation
```bash
pip install sentry-sdk[django]
```

### Environment Variables
```bash
export SENTRY_DSN="https://your-dsn@sentry.io/project-id"
export SENTRY_ENVIRONMENT="production"
export SENTRY_RELEASE="1.0.0"
export SENTRY_TRACES_SAMPLE_RATE="0.1"
```

### Django Settings
```python
# settings.py
SENTRY_DSN = os.getenv('SENTRY_DSN')
SENTRY_ENVIRONMENT = os.getenv('SENTRY_ENVIRONMENT', 'production')
SENTRY_RELEASE = os.getenv('SENTRY_RELEASE')
SENTRY_TRACES_SAMPLE_RATE = float(os.getenv('SENTRY_TRACES_SAMPLE_RATE', '0.1'))

# Initialize Sentry
if SENTRY_DSN:
    from api.monitoring import init_sentry
    init_sentry()
```

### Sentry Project Setup
1. Create account at [sentry.io](https://sentry.io)
2. Create new Django project
3. Copy DSN from project settings
4. Configure alert rules for errors and performance

## 3. Prometheus Configuration

### Installation
```bash
# Download Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
tar xvfz prometheus-2.45.0.linux-amd64.tar.gz
cd prometheus-2.45.0.linux-amd64
```

### Configuration File
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'django-app'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['localhost:9187']
```

### Alert Rules
```yaml
# alert_rules.yml
groups:
  - name: django_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(django_http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(django_http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "95th percentile latency is {{ $value }} seconds"
```

### Docker Configuration
```yaml
# docker-compose.prod.yml
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./monitoring/alert_rules.yml:/etc/prometheus/alert_rules.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    restart: unless-stopped

volumes:
  grafana_data:
```

## 4. Nginx Configuration

### Production Nginx Config
```nginx
# /etc/nginx/sites-available/mechcraft
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # API Endpoints
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Login Endpoint
    location /api/v1/auth/login/ {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health Check
    location /health/ {
        proxy_pass http://localhost:8000;
        access_log off;
    }

    # Metrics (Restrict Access)
    location /metrics/ {
        allow 127.0.0.1;
        allow 10.0.0.0/8;
        deny all;
        proxy_pass http://localhost:8000;
    }

    # Static Files
    location /static/ {
        alias /var/www/mechcraft/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Media Files
    location /media/ {
        alias /var/www/mechcraft/media/;
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

## 5. Environment Variables

### Production .env
```bash
# Django Settings
DEBUG=False
SECRET_KEY=your-super-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mechcraft_prod

# Redis
REDIS_URL=redis://localhost:6379/0

# ClamAV
CLAMAV_SOCKET=/var/run/clamav/clamd.ctl
CLAMAV_ENABLED=true

# Sentry
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=1.0.0
SENTRY_TRACES_SAMPLE_RATE=0.1

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_REGION_NAME=us-east-1
S3_BACKUP_BUCKET=mechcraft-backups

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## 6. Systemd Services

### Django Application
```ini
# /etc/systemd/system/mechcraft.service
[Unit]
Description=MechCraft Django Application
After=network.target postgresql.service redis.service

[Service]
Type=exec
User=www-data
Group=www-data
WorkingDirectory=/var/www/mechcraft
Environment=DJANGO_SETTINGS_MODULE=config.settings
ExecStart=/var/www/mechcraft/venv/bin/gunicorn --bind 127.0.0.1:8000 config.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

### Backup Service
```ini
# /etc/systemd/system/mechcraft-backup.service
[Unit]
Description=MechCraft Database Backup
After=postgresql.service

[Service]
Type=oneshot
User=www-data
Group=www-data
WorkingDirectory=/var/www/mechcraft
Environment=DJANGO_SETTINGS_MODULE=config.settings
ExecStart=/var/www/mechcraft/venv/bin/python manage.py backup_db --compress --s3-upload

[Install]
WantedBy=multi-user.target
```

### Backup Timer
```ini
# /etc/systemd/system/mechcraft-backup.timer
[Unit]
Description=Run MechCraft backup daily
Requires=mechcraft-backup.service

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

## 7. Monitoring Setup

### Enable Services
```bash
# Enable and start services
sudo systemctl enable mechcraft
sudo systemctl start mechcraft
sudo systemctl enable mechcraft-backup.timer
sudo systemctl start mechcraft-backup.timer

# Check status
sudo systemctl status mechcraft
sudo systemctl status mechcraft-backup.timer
```

### Log Monitoring
```bash
# View application logs
sudo journalctl -u mechcraft -f

# View backup logs
sudo journalctl -u mechcraft-backup -f

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 8. Security Checklist

- [ ] SSL certificates installed and configured
- [ ] Firewall configured (UFW/iptables)
- [ ] Fail2ban installed and configured
- [ ] Regular security updates enabled
- [ ] Database backups automated
- [ ] Monitoring and alerting configured
- [ ] Log rotation configured
- [ ] File permissions set correctly
- [ ] Secrets managed securely
- [ ] Rate limiting configured

## 9. Performance Optimization

### Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_order_customer ON orders(customer_id);
CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_ticket_created_at ON tickets(created_at);
CREATE INDEX idx_user_email ON users(email);
```

### Redis Configuration
```conf
# /etc/redis/redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### Gunicorn Configuration
```python
# gunicorn.conf.py
bind = "127.0.0.1:8000"
workers = 4
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
timeout = 30
keepalive = 2
preload_app = True
```

This configuration provides a production-ready setup with comprehensive monitoring, security, and performance optimizations.
