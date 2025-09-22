# PostgreSQL Migration Guide

## 1. PostgreSQL Installation

### Ubuntu/Debian
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib postgresql-client

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user
sudo -u postgres psql
```

### Docker Installation
```yaml
# docker-compose.prod.yml
services:
  postgres:
    image: postgres:15
    container_name: mechcraft_postgres
    environment:
      POSTGRES_DB: mechcraft_prod
      POSTGRES_USER: mechcraft_user
      POSTGRES_PASSWORD: your-secure-password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    restart: unless-stopped
    command: >
      postgres
      -c shared_preload_libraries=pg_stat_statements
      -c max_connections=200
      -c shared_buffers=256MB
      -c effective_cache_size=1GB
      -c maintenance_work_mem=64MB
      -c checkpoint_completion_target=0.9
      -c wal_buffers=16MB
      -c default_statistics_target=100

volumes:
  postgres_data:
```

## 2. Database Setup

### Create Database and User
```sql
-- Connect to PostgreSQL as superuser
sudo -u postgres psql

-- Create database
CREATE DATABASE mechcraft_prod;

-- Create user
CREATE USER mechcraft_user WITH PASSWORD 'your-secure-password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE mechcraft_prod TO mechcraft_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO mechcraft_user;

-- Exit
\q
```

### Test Connection
```bash
# Test connection
psql -h localhost -U mechcraft_user -d mechcraft_prod
```

## 3. Django Configuration

### Install PostgreSQL Driver
```bash
pip install psycopg2-binary
```

### Update Settings
```python
# config/settings.py
import os
from urllib.parse import urlparse

# Database configuration
if 'DATABASE_URL' in os.environ:
    # Parse database URL (for production)
    db_url = urlparse(os.environ['DATABASE_URL'])
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': db_url.path[1:],  # Remove leading slash
            'USER': db_url.username,
            'PASSWORD': db_url.password,
            'HOST': db_url.hostname,
            'PORT': db_url.port or 5432,
            'OPTIONS': {
                'sslmode': 'require' if os.environ.get('DATABASE_SSL', 'false').lower() == 'true' else 'prefer',
            },
        }
    }
else:
    # Local development
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'mechcraft_dev'),
            'USER': os.getenv('DB_USER', 'mechcraft_user'),
            'PASSWORD': os.getenv('DB_PASSWORD', 'password'),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
            'OPTIONS': {
                'sslmode': 'prefer',
            },
        }
    }

# Connection pooling
DATABASES['default']['CONN_MAX_AGE'] = 60
```

### Environment Variables
```bash
# Production
export DATABASE_URL="postgresql://mechcraft_user:password@localhost:5432/mechcraft_prod"
export DB_SSL="true"

# Development
export DB_NAME="mechcraft_dev"
export DB_USER="mechcraft_user"
export DB_PASSWORD="password"
export DB_HOST="localhost"
export DB_PORT="5432"
```

## 4. Migration Process

### Step 1: Backup SQLite Database
```bash
# Create backup directory
mkdir -p backups

# Backup SQLite database
python manage.py dumpdata --natural-foreign --natural-primary > backups/sqlite_backup.json

# Backup media files
tar -czf backups/media_backup.tar.gz media/
```

### Step 2: Create PostgreSQL Database
```bash
# Create new database
createdb -U mechcraft_user mechcraft_prod

# Test connection
python manage.py dbshell
```

### Step 3: Run Migrations
```bash
# Install PostgreSQL dependencies
pip install psycopg2-binary

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Step 4: Load Data
```bash
# Load data from SQLite backup
python manage.py loaddata backups/sqlite_backup.json

# Verify data
python manage.py shell
```

```python
# In Django shell
from django.contrib.auth import get_user_model
from api.models import Service, Order

User = get_user_model()
print(f"Users: {User.objects.count()}")
print(f"Services: {Service.objects.count()}")
print(f"Orders: {Order.objects.count()}")
```

## 5. Data Migration Script

### Custom Migration Script
```python
# scripts/migrate_to_postgresql.py
#!/usr/bin/env python
import os
import sys
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import call_command
from django.db import connection
from django.contrib.auth import get_user_model

User = get_user_model()

def migrate_to_postgresql():
    """Migrate from SQLite to PostgreSQL"""
    
    print("Starting migration to PostgreSQL...")
    
    # 1. Create database tables
    print("Creating database tables...")
    call_command('migrate', verbosity=2)
    
    # 2. Load fixtures
    print("Loading data from backup...")
    call_command('loaddata', 'backups/sqlite_backup.json', verbosity=2)
    
    # 3. Verify migration
    print("Verifying migration...")
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM auth_user")
        user_count = cursor.fetchone()[0]
        print(f"Users migrated: {user_count}")
        
        cursor.execute("SELECT COUNT(*) FROM api_service")
        service_count = cursor.fetchone()[0]
        print(f"Services migrated: {service_count}")
    
    print("Migration completed successfully!")

if __name__ == '__main__':
    migrate_to_postgresql()
```

### Run Migration Script
```bash
# Make script executable
chmod +x scripts/migrate_to_postgresql.py

# Run migration
python scripts/migrate_to_postgresql.py
```

## 6. Performance Optimization

### Database Indexes
```sql
-- Connect to PostgreSQL
psql -U mechcraft_user -d mechcraft_prod

-- Create performance indexes
CREATE INDEX CONCURRENTLY idx_orders_customer ON orders(customer_id);
CREATE INDEX CONCURRENTLY idx_orders_status ON orders(status);
CREATE INDEX CONCURRENTLY idx_orders_created_at ON orders(created_at);
CREATE INDEX CONCURRENTLY idx_tickets_created_at ON tickets(created_at);
CREATE INDEX CONCURRENTLY idx_tickets_status ON tickets(status);
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_users_username ON users(username);
CREATE INDEX CONCURRENTLY idx_turnstile_attempts_created_at ON turnstile_attempts(created_at);
CREATE INDEX CONCURRENTLY idx_turnstile_attempts_ip ON turnstile_attempts(ip);

-- Analyze tables for better query planning
ANALYZE;
```

### Connection Pooling
```python
# config/settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'mechcraft_prod',
        'USER': 'mechcraft_user',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
        'OPTIONS': {
            'sslmode': 'prefer',
        },
        'CONN_MAX_AGE': 60,  # Connection pooling
        'CONN_HEALTH_CHECKS': True,
    }
}
```

## 7. Backup and Restore

### Automated Backup Script
```bash
#!/bin/bash
# scripts/postgres_backup.sh

# Configuration
DB_NAME="mechcraft_prod"
DB_USER="mechcraft_user"
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/mechcraft_${DATE}.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Upload to S3 (optional)
if [ -n "$AWS_S3_BUCKET" ]; then
    aws s3 cp "${BACKUP_FILE}.gz" "s3://${AWS_S3_BUCKET}/postgresql/"
fi

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "mechcraft_*.sql.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

### Restore Script
```bash
#!/bin/bash
# scripts/postgres_restore.sh

BACKUP_FILE=$1
DB_NAME="mechcraft_prod"
DB_USER="mechcraft_user"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c $BACKUP_FILE | psql -h localhost -U $DB_USER -d $DB_NAME
else
    psql -h localhost -U $DB_USER -d $DB_NAME < $BACKUP_FILE
fi

echo "Restore completed from: $BACKUP_FILE"
```

## 8. Monitoring and Maintenance

### Database Monitoring
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('mechcraft_prod'));

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'mechcraft_prod';

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### Maintenance Tasks
```bash
# Add to crontab
# Daily VACUUM and ANALYZE
0 2 * * * /usr/bin/psql -U mechcraft_user -d mechcraft_prod -c "VACUUM ANALYZE;"

# Weekly REINDEX
0 3 * * 0 /usr/bin/psql -U mechcraft_user -d mechcraft_prod -c "REINDEX DATABASE mechcraft_prod;"

# Daily backup
0 1 * * * /path/to/scripts/postgres_backup.sh
```

## 9. Security Configuration

### PostgreSQL Security
```sql
-- Connect as superuser
sudo -u postgres psql

-- Create read-only user for monitoring
CREATE USER mechcraft_monitor WITH PASSWORD 'monitor_password';
GRANT CONNECT ON DATABASE mechcraft_prod TO mechcraft_monitor;
GRANT USAGE ON SCHEMA public TO mechcraft_monitor;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO mechcraft_monitor;

-- Set up row-level security (optional)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY orders_policy ON orders FOR ALL TO mechcraft_user USING (true);

-- Configure SSL
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/etc/ssl/certs/server.crt';
ALTER SYSTEM SET ssl_key_file = '/etc/ssl/private/server.key';
SELECT pg_reload_conf();
```

### Firewall Configuration
```bash
# Allow PostgreSQL connections only from localhost
sudo ufw allow from 127.0.0.1 to any port 5432
sudo ufw deny 5432

# Or allow specific IP ranges
sudo ufw allow from 10.0.0.0/8 to any port 5432
```

## 10. Testing and Validation

### Connection Test
```python
# test_postgresql_connection.py
import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from django.contrib.auth import get_user_model

def test_connection():
    """Test PostgreSQL connection and basic operations"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            print(f"PostgreSQL version: {version}")
            
            cursor.execute("SELECT current_database();")
            db_name = cursor.fetchone()[0]
            print(f"Connected to database: {db_name}")
            
        # Test Django ORM
        User = get_user_model()
        user_count = User.objects.count()
        print(f"Users in database: {user_count}")
        
        print("✅ PostgreSQL connection successful!")
        return True
        
    except Exception as e:
        print(f"❌ PostgreSQL connection failed: {e}")
        return False

if __name__ == '__main__':
    test_connection()
```

### Performance Test
```python
# test_performance.py
import time
from django.db import connection
from django.contrib.auth import get_user_model

def test_query_performance():
    """Test query performance"""
    User = get_user_model()
    
    # Test simple query
    start_time = time.time()
    users = User.objects.all()[:100]
    list(users)  # Force evaluation
    simple_query_time = time.time() - start_time
    
    # Test complex query
    start_time = time.time()
    users_with_orders = User.objects.select_related().prefetch_related('order_set').all()[:100]
    list(users_with_orders)
    complex_query_time = time.time() - start_time
    
    print(f"Simple query time: {simple_query_time:.4f}s")
    print(f"Complex query time: {complex_query_time:.4f}s")
    
    # Check query count
    print(f"Queries executed: {len(connection.queries)}")

if __name__ == '__main__':
    test_query_performance()
```

## 11. Rollback Plan

### Rollback to SQLite (Emergency)
```bash
# 1. Stop application
sudo systemctl stop mechcraft

# 2. Restore SQLite database
cp backups/db.sqlite3.backup db.sqlite3

# 3. Update settings to use SQLite
# Change DATABASES setting in settings.py

# 4. Restart application
sudo systemctl start mechcraft
```

### Data Recovery
```bash
# Restore from PostgreSQL backup
./scripts/postgres_restore.sh backups/mechcraft_20240101_120000.sql.gz

# Verify data integrity
python manage.py check --deploy
```

This migration guide provides a comprehensive approach to moving from SQLite to PostgreSQL with proper backup, testing, and rollback procedures.
