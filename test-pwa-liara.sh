#!/bin/bash

# PWA Test Script for Liara Deployment
# This script tests PWA functionality after deployment

set -e

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

# Default URL
URL=${1:-"https://saydatech.ir"}

print_status "Testing PWA functionality for $URL"

# Test Service Worker MIME type
print_status "Testing Service Worker MIME type..."
SW_RESPONSE=$(curl -s -I "$URL/service-worker.js")
if echo "$SW_RESPONSE" | grep -q "application/javascript"; then
    print_success "Service Worker MIME type is correct"
else
    print_error "Service Worker MIME type is incorrect"
    echo "$SW_RESPONSE"
fi

# Test Manifest MIME type
print_status "Testing Manifest MIME type..."
MANIFEST_RESPONSE=$(curl -s -I "$URL/manifest.json")
if echo "$MANIFEST_RESPONSE" | grep -q "application/manifest+json"; then
    print_success "Manifest MIME type is correct"
else
    print_error "Manifest MIME type is incorrect"
    echo "$MANIFEST_RESPONSE"
fi

# Test Manifest content
print_status "Testing Manifest content..."
MANIFEST_CONTENT=$(curl -s "$URL/manifest.json")
if echo "$MANIFEST_CONTENT" | grep -q "پلتفرم مهندسی سایدا"; then
    print_success "Manifest content is correct"
else
    print_error "Manifest content is incorrect"
fi

# Test PWA Icons
print_status "Testing PWA Icons..."
ICON_RESPONSE=$(curl -s -I "$URL/icons/icon-192x192.png")
if echo "$ICON_RESPONSE" | grep -q "200 OK"; then
    print_success "PWA Icons are accessible"
else
    print_error "PWA Icons are not accessible"
fi

# Test PWA Screenshots
print_status "Testing PWA Screenshots..."
SCREENSHOT_RESPONSE=$(curl -s -I "$URL/screenshots/desktop-screenshot.png")
if echo "$SCREENSHOT_RESPONSE" | grep -q "200 OK"; then
    print_success "PWA Screenshots are accessible"
else
    print_error "PWA Screenshots are not accessible"
fi

# Test HTTPS
print_status "Testing HTTPS..."
if [[ $URL == https://* ]]; then
    print_success "HTTPS is enabled (required for PWA)"
else
    print_warning "HTTPS is not enabled (PWA requires HTTPS)"
fi

# Test Service Worker registration
print_status "Testing Service Worker registration..."
SW_CONTENT=$(curl -s "$URL/service-worker.js")
if echo "$SW_CONTENT" | grep -q "Service Worker"; then
    print_success "Service Worker content is correct"
else
    print_error "Service Worker content is incorrect"
fi

# Test Cache Headers
print_status "Testing Cache Headers..."
SW_CACHE=$(curl -s -I "$URL/service-worker.js" | grep -i "cache-control")
if echo "$SW_CACHE" | grep -q "no-cache"; then
    print_success "Service Worker cache headers are correct"
else
    print_warning "Service Worker cache headers may be incorrect"
fi

MANIFEST_CACHE=$(curl -s -I "$URL/manifest.json" | grep -i "cache-control")
if echo "$MANIFEST_CACHE" | grep -q "max-age"; then
    print_success "Manifest cache headers are correct"
else
    print_warning "Manifest cache headers may be incorrect"
fi

print_success "PWA testing completed!"

# Summary
echo ""
echo "=== PWA Test Summary ==="
echo "URL: $URL"
echo "Service Worker: $URL/service-worker.js"
echo "Manifest: $URL/manifest.json"
echo "Icons: $URL/icons/"
echo "Screenshots: $URL/screenshots/"
echo ""
echo "To test in browser:"
echo "1. Open $URL in Chrome/Edge"
echo "2. Open Developer Tools > Console"
echo "3. Check for Service Worker registration messages"
echo "4. Check for PWA install prompt"
echo ""
echo "To test MIME types manually:"
echo "curl -I $URL/service-worker.js"
echo "curl -I $URL/manifest.json"
