#!/usr/bin/env python3
"""
Script to set up user roles and fix existing users
Run this to ensure all roles exist and users have proper roles assigned
"""

import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django with development settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
os.environ.setdefault('SECRET_KEY', 'dev-secret-key-for-setup-only')
os.environ.setdefault('DEBUG', 'True')

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

def fix_existing_users():
    """Assign appropriate roles to existing users who don't have any role"""
    customer_role = Role.objects.get(name='customer')
    contractor_role = Role.objects.get(name='contractor')
    
    # Get all users without any active roles
    users_without_roles = User.objects.filter(user_roles__isnull=True).distinct()
    count = 0
    
    for user in users_without_roles:
        # Check if user has contractor services (indicates they should be contractor)
        has_contractor_services = hasattr(user, 'contractor_services') and user.contractor_services.exists()
        
        if has_contractor_services:
            UserRole.objects.create(
                user=user,
                role=contractor_role,
                is_active=True
            )
            print(f"Assigned contractor role to {user.username}")
        else:
            UserRole.objects.create(
                user=user,
                role=customer_role,
                is_active=True
            )
            print(f"Assigned customer role to {user.username}")
        count += 1
    
    print(f"Fixed roles for {count} users")

def check_user_roles():
    """Check and display current user roles"""
    print("\nCurrent user roles:")
    print("-" * 50)
    
    for user in User.objects.all():
        roles = user.user_roles.filter(is_active=True)
        role_names = [ur.role.name for ur in roles]
        print(f"{user.username}: {', '.join(role_names) if role_names else 'No roles'}")

if __name__ == '__main__':
    print("Setting up roles...")
    create_roles()
    
    print("\nFixing existing users...")
    fix_existing_users()
    
    print("\nChecking current user roles...")
    check_user_roles()
    
    print("\nRole setup completed!")
