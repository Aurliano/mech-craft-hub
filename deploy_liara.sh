#!/bin/bash

# MechCraft Hub - Liara Deployment Script
# This script automates the deployment process to Liara

set -e  # Exit on any error

echo "🚀 Starting MechCraft Hub deployment to Liara..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Liara CLI is installed
if ! command -v liara &> /dev/null; then
    print_error "Liara CLI is not installed. Please install it first:"
    echo "npm install -g @liara/cli"
    exit 1
fi

# Check if user is logged in to Liara
if ! liara whoami &> /dev/null; then
    print_error "You are not logged in to Liara. Please login first:"
    echo "liara login"
    exit 1
fi

print_status "Checking project structure..."

# Verify required files exist
required_files=("liara.json" "Procfile" "requirements_liara.txt" "Dockerfile.liara")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file $file not found!"
        exit 1
    fi
done

print_success "All required files found"

# Set environment variables
print_status "Setting up environment variables..."

# Generate a secure secret key if not provided
if [ -z "$SECRET_KEY" ]; then
    SECRET_KEY=$(python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
    print_warning "Generated new SECRET_KEY. Please save it securely!"
    echo "SECRET_KEY=$SECRET_KEY"
fi

# Update liara.json with the secret key
if [ ! -z "$SECRET_KEY" ]; then
    sed -i "s/your-secret-key-here/$SECRET_KEY/g" liara.json
    print_success "Updated liara.json with SECRET_KEY"
fi

# Build frontend if needed
if [ -d "src" ]; then
    print_status "Building frontend..."
    if command -v npm &> /dev/null; then
        npm ci
        npm run build
        print_success "Frontend built successfully"
    else
        print_warning "npm not found, skipping frontend build"
    fi
else
    print_status "Frontend already built in dist/ directory"
fi

# Deploy to Liara
print_status "Deploying to Liara..."

# Use the optimized Dockerfile for Liara
cp Dockerfile.liara backend/Dockerfile

# Deploy
liara deploy

print_success "Deployment completed successfully!"

# Show deployment info
print_status "Deployment Information:"
echo "App URL: https://mech-craft-hub-main.liara.run"
echo "Health Check: https://mech-craft-hub-main.liara.run/health/"
echo "API Docs: https://mech-craft-hub-main.liara.run/api/docs/"

print_success "🎉 MechCraft Hub is now live on Liara!"
