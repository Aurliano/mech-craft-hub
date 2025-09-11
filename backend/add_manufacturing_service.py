#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import User, Service, ContractorService

def add_manufacturing_service_to_contractors():
    """Add manufacturing service to all contractors"""
    
    # Get manufacturing service
    try:
        manufacturing_service = Service.objects.get(id='550e8400-e29b-41d4-a716-446655440003')
        print(f"Found manufacturing service: {manufacturing_service.name}")
    except Service.DoesNotExist:
        print("Manufacturing service not found!")
        return
    
    # Get all contractors
    contractors = User.objects.filter(user_roles__role__name='contractor', user_roles__is_active=True).distinct()
    print(f"Found {contractors.count()} contractors")
    
    added_count = 0
    for contractor in contractors:
        # Check if contractor already has manufacturing service
        existing = ContractorService.objects.filter(
            contractor=contractor,
            service=manufacturing_service
        ).exists()
        
        if not existing:
            ContractorService.objects.create(
                contractor=contractor,
                service=manufacturing_service,
                is_active=True
            )
            print(f"Added manufacturing service to contractor: {contractor.username}")
            added_count += 1
        else:
            print(f"Contractor {contractor.username} already has manufacturing service")
    
    print(f"Added manufacturing service to {added_count} contractors")

if __name__ == "__main__":
    add_manufacturing_service_to_contractors()
