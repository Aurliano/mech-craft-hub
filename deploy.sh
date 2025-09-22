#!/bin/bash

# MechCraft Hub Production Deployment Script
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 Starting MechCraft Hub Production Deployment..."

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

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    if [ -f "env.production" ]; then
        cp env.production .env
        print_warning "Please edit .env file with your actual production values before continuing."
        print_warning "Press Enter when ready to continue..."
        read
    else
        print_error "No environment template found. Please create .env file manually."
        exit 1
    fi
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

print_status "Environment loaded successfully"

# Pre-deployment backup (if database exists)
print_status "Creating pre-deployment backup..."
if docker-compose ps postgres | grep -q "Up"; then
    docker-compose exec -T postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup_pre_deployment_$(date +%Y%m%d_%H%M%S).sql
    print_status "Pre-deployment backup created"
else
    print_warning "PostgreSQL not running, skipping backup"
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down || true

# Pull latest images
print_status "Pulling latest Docker images..."
docker-compose -f docker-compose.prod.yml pull

# Build application images
print_status "Building application images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
print_status "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Run database migrations
print_status "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Collect static files
print_status "Collecting static files..."
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

# Create superuser (optional)
print_warning "Do you want to create a superuser? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
fi

# Health check
print_status "Performing health checks..."
if curl -f http://localhost/health/ > /dev/null 2>&1; then
    print_status "✅ Application health check passed"
else
    print_error "❌ Application health check failed"
    print_error "Check logs with: docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi

# Test API endpoints
print_status "Testing API endpoints..."
if curl -f http://localhost/api/v1/ > /dev/null 2>&1; then
    print_status "✅ API endpoints are responding"
else
    print_warning "⚠️  API endpoints test failed (this might be normal if authentication is required)"
fi

# Display service status
print_status "Service Status:"
docker-compose -f docker-compose.prod.yml ps

# Display access information
print_status "🎉 Deployment completed successfully!"
echo ""
echo "📊 Access Information:"
echo "  - Application: http://localhost"
echo "  - API Documentation: http://localhost/api/schema/swagger-ui/"
echo "  - Admin Panel: http://localhost/admin/"
echo "  - Prometheus: http://localhost:9090"
echo "  - Grafana: http://localhost:3000 (admin/your-grafana-password)"
echo ""
echo "📝 Useful Commands:"
echo "  - View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Stop services: docker-compose -f docker-compose.prod.yml down"
echo "  - Restart services: docker-compose -f docker-compose.prod.yml restart"
echo "  - Backup database: docker-compose -f docker-compose.prod.yml exec backend python manage.py backup_db"
echo ""
echo "🔒 Security Notes:"
echo "  - Make sure to configure SSL certificates for HTTPS"
echo "  - Update firewall rules to only allow necessary ports"
echo "  - Regularly update dependencies and monitor security alerts"
echo "  - Set up monitoring and alerting for production use"
echo ""
print_status "Deployment completed! 🚀"
