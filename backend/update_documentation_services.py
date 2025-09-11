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

def update_services():
    # Enable documentation for specific services
    service_ids = [
        '550e8400-e29b-41d4-a716-446655440001',  # Analysis
        '550e8400-e29b-41d4-a716-446655440002',  # Design  
        '550e8400-e29b-41d4-a716-446655440003',  # Manufacturing
    ]
    
    for service_id in service_ids:
        try:
            service = Service.objects.get(id=service_id)
            service.supports_documentation = True
            service.save()
            print(f"Updated {service.name}: supports_documentation = True")
        except Service.DoesNotExist:
            print(f"Service {service_id} not found")

if __name__ == "__main__":
    update_services()
