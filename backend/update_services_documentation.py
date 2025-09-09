#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Service

def update_services_documentation():
    # Update design and manufacturing services to support documentation
    design_service_id = '550e8400-e29b-41d4-a716-446655440002'  # طراحی مکانیکی
    manufacturing_service_id = '550e8400-e29b-41d4-a716-446655440003'  # ساخت و تولید
    
    try:
        # Update design service
        design_service = Service.objects.get(id=design_service_id)
        design_service.supports_documentation = True
        design_service.save()
        print(f"Updated design service: {design_service.name}")
        
        # Update manufacturing service
        manufacturing_service = Service.objects.get(id=manufacturing_service_id)
        manufacturing_service.supports_documentation = True
        manufacturing_service.save()
        print(f"Updated manufacturing service: {manufacturing_service.name}")
        
        print("Services updated successfully!")
        
    except Service.DoesNotExist as e:
        print(f"Service not found: {e}")
    except Exception as e:
        print(f"Error updating services: {e}")

if __name__ == '__main__':
    update_services_documentation()
