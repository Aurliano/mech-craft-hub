#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Service

def update_services_documentation():
    """Update services to support documentation based on service type"""
    
    # Services that should support documentation
    documentation_services = [
        '550e8400-e29b-41d4-a716-446655440001',  # Analysis & Simulation
        '550e8400-e29b-41d4-a716-446655440002',  # Design
        '550e8400-e29b-41d4-a716-446655440003',  # Manufacturing
    ]
    
    # Services that should NOT support documentation
    no_documentation_services = [
        '550e8400-e29b-41d4-a716-446655440004',  # Drawing
    ]
    
    updated_count = 0
    
    # Enable documentation for specified services
    for service_id in documentation_services:
        try:
            service = Service.objects.get(id=service_id)
            if not service.supports_documentation:
                service.supports_documentation = True
                service.save()
                print(f"✅ Enabled documentation for: {service.name} ({service.type})")
                updated_count += 1
            else:
                print(f"ℹ️  Documentation already enabled for: {service.name} ({service.type})")
        except Service.DoesNotExist:
            print(f"❌ Service not found: {service_id}")
    
    # Disable documentation for specified services
    for service_id in no_documentation_services:
        try:
            service = Service.objects.get(id=service_id)
            if service.supports_documentation:
                service.supports_documentation = False
                service.save()
                print(f"✅ Disabled documentation for: {service.name} ({service.type})")
                updated_count += 1
            else:
                print(f"ℹ️  Documentation already disabled for: {service.name} ({service.type})")
        except Service.DoesNotExist:
            print(f"❌ Service not found: {service_id}")
    
    print(f"\n📊 Updated {updated_count} services")
    
    # Show current status
    print("\n📋 Current service documentation status:")
    for service in Service.objects.all():
        status = "✅ Supports" if service.supports_documentation else "❌ No support"
        print(f"  {service.name} ({service.type}): {status}")

if __name__ == "__main__":
    update_services_documentation()