#!/bin/bash

# MechCraft Hub Production Rollback Script
# This script handles rollback to previous version

set -e  # Exit on any error

echo "🔄 Starting MechCraft Hub Rollback Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create backup before rollback
print_status "Creating backup before rollback..."
if docker-compose -f docker-compose.prod.yml ps postgres | grep -q "Up"; then
    docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup_before_rollback_$(date +%Y%m%d_%H%M%S).sql
    print_status "Backup created before rollback"
else
    print_warning "PostgreSQL not running, skipping backup"
fi

# Stop current deployment
print_status "Stopping current deployment..."
docker-compose -f docker-compose.prod.yml down

# Check if there's a previous version to rollback to
if [ -d "backup_previous_version" ]; then
    print_status "Found previous version backup, restoring..."
    
    # Restore previous version files
    cp -r backup_previous_version/* ./
    
    # Start previous version
    print_status "Starting previous version..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Health check
    print_status "Performing health checks..."
    if curl -f http://localhost/health/ > /dev/null 2>&1; then
        print_status "✅ Rollback completed successfully"
        print_status "Previous version is now running"
    else
        print_error "❌ Rollback health check failed"
        print_error "Manual intervention may be required"
        exit 1
    fi
else
    print_warning "No previous version backup found"
    print_warning "Rolling back to last known good configuration..."
    
    # Restart with current configuration
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Health check
    print_status "Performing health checks..."
    if curl -f http://localhost/health/ > /dev/null 2>&1; then
        print_status "✅ Service restart completed successfully"
    else
        print_error "❌ Service restart failed"
        print_error "Check logs with: docker-compose -f docker-compose.prod.yml logs"
        exit 1
    fi
fi

# Display service status
print_status "Service Status:"
docker-compose -f docker-compose.prod.yml ps

print_status "🎉 Rollback process completed!"
echo ""
echo "📊 Access Information:"
echo "  - Application: http://localhost"
echo "  - API Documentation: http://localhost/api/schema/swagger-ui/"
echo "  - Admin Panel: http://localhost/admin/"
echo ""
echo "📝 Next Steps:"
echo "  1. Verify all functionality is working"
echo "  2. Check logs for any issues"
echo "  3. Investigate the cause of the original problem"
echo "  4. Plan a fix and re-deploy when ready"
echo ""
print_status "Rollback completed! 🔄"
