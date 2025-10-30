#!/bin/bash

# Static Files Management Script for PWA
# This script manages static files and prevents PWA conflicts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to clean staticfiles
clean_staticfiles() {
    print_status "Cleaning staticfiles directory..."
    
    # Remove PWA files from staticfiles
    rm -rf backend/staticfiles/icons
    rm -rf backend/staticfiles/screenshots
    rm -f backend/staticfiles/service-worker.js
    rm -f backend/staticfiles/manifest.json
    rm -f backend/staticfiles/web.config
    rm -f backend/staticfiles/pwa-debug.js
    rm -f backend/staticfiles/pwa-test.js
    rm -f backend/staticfiles/mime-test.js
    
    print_success "Staticfiles cleaned"
}

# Function to collect static files
collect_static() {
    print_status "Collecting static files..."
    
    cd backend
    python manage.py collectstatic --noinput --clear
    
    # Clean PWA files after collection
    rm -rf staticfiles/icons
    rm -rf staticfiles/screenshots
    rm -f staticfiles/service-worker.js
    rm -f staticfiles/manifest.json
    rm -f staticfiles/web.config
    rm -f staticfiles/pwa-debug.js
    rm -f staticfiles/pwa-test.js
    rm -f staticfiles/mime-test.js
    
    cd ..
    print_success "Static files collected and cleaned"
}

# Main execution
case "${1:-clean}" in
    "clean")
        clean_staticfiles
        ;;
    "collect")
        collect_static
        ;;
    "both")
        clean_staticfiles
        collect_static
        ;;
    *)
        echo "Usage: $0 {clean|collect|both}"
        echo "  clean  - Remove PWA files from staticfiles"
        echo "  collect - Collect static files and clean PWA files"
        echo "  both   - Clean and collect"
        exit 1
        ;;
esac
