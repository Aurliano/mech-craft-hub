#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Scope, Service

def create_services():
    # Create scopes
    mechanical_scope, _ = Scope.objects.get_or_create(
        name='mechanical',
        defaults={
            'display_name': 'مهندسی مکانیک',
            'description': 'خدمات مهندسی مکانیک',
            'is_active': True
        }
    )
    
    # Create services
    services_data = [
        {
            'id': '550e8400-e29b-41d4-a716-446655440001',
            'scope': mechanical_scope,
            'name': 'تحلیل و شبیه‌سازی',
            'type': 'analysis',
            'description': 'تحلیل و شبیه‌سازی مکانیکی',
            'base_price': 500000,
            'estimated_delivery_days': 7,
            'is_active': True
        },
        {
            'id': '550e8400-e29b-41d4-a716-446655440002',
            'scope': mechanical_scope,
            'name': 'طراحی مکانیکی',
            'type': 'design',
            'description': 'طراحی قطعات و سیستم‌های مکانیکی',
            'base_price': 800000,
            'estimated_delivery_days': 10,
            'is_active': True
        },
        {
            'id': '550e8400-e29b-41d4-a716-446655440003',
            'scope': mechanical_scope,
            'name': 'ساخت و تولید',
            'type': 'manufacturing',
            'description': 'ساخت و تولید قطعات مکانیکی',
            'base_price': 1200000,
            'estimated_delivery_days': 14,
            'is_active': True
        },
        {
            'id': '550e8400-e29b-41d4-a716-446655440004',
            'scope': mechanical_scope,
            'name': 'نقشه‌کشی فنی',
            'type': 'drawing',
            'description': 'نقشه‌کشی فنی و مستندسازی',
            'base_price': 300000,
            'estimated_delivery_days': 5,
            'is_active': True
        }
    ]
    
    for service_data in services_data:
        service, created = Service.objects.get_or_create(
            id=service_data['id'],
            defaults=service_data
        )
        if created:
            print(f"Created service: {service.name}")
        else:
            print(f"Service already exists: {service.name}")

if __name__ == '__main__':
    create_services()
    print("Services created successfully!")
