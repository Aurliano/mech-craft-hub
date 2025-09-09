#!/usr/bin/env python3
"""
Script to set up user roles in the database
Run this after migrations to create the basic roles
"""

import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Role, User, UserRole

def create_roles():
    """Create basic roles if they don't exist"""
    roles_data = [
        {
            'name': 'customer',
            'display_name': 'مشتری',
            'description': 'کاربران عادی که خدمات را سفارش می‌دهند'
        },
        {
            'name': 'contractor',
            'display_name': 'پیمانکار',
            'description': 'پیمانکاران که خدمات را ارائه می‌دهند'
        },
        {
            'name': 'admin',
            'display_name': 'مدیر',
            'description': 'مدیران سیستم'
        },
        {
            'name': 'support',
            'display_name': 'پشتیبان',
            'description': 'پشتیبانان فنی'
        }
    ]
    
    created_roles = []
    for role_data in roles_data:
        role, created = Role.objects.get_or_create(
            name=role_data['name'],
            defaults=role_data
        )
        if created:
            print(f"Created role: {role.display_name}")
            created_roles.append(role)
        else:
            print(f"Role already exists: {role.display_name}")
    
    return created_roles

def assign_default_role_to_users():
    """Assign customer role to all existing users who don't have any role"""
    customer_role = Role.objects.get(name='customer')
    
    users_without_roles = User.objects.filter(user_roles__isnull=True)
    count = 0
    
    for user in users_without_roles:
        UserRole.objects.create(
            user=user,
            role=customer_role,
            is_active=True
        )
        count += 1
    
    print(f"Assigned customer role to {count} users")

if __name__ == '__main__':
    print("Setting up roles...")
    create_roles()
    print("Assigning default roles to existing users...")
    assign_default_role_to_users()
    print("Role setup completed!")
