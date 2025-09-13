#!/usr/bin/env python
"""
Setup script for ticket file types
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import TicketFileType


def create_ticket_file_types():
    """Create default ticket file types"""
    
    file_types = [
        {
            'name': 'image',
            'display_name': 'تصاویر',
            'category': 'image',
            'extensions': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'],
            'mime_types': [
                'image/jpeg', 'image/png', 'image/gif', 'image/webp', 
                'image/bmp', 'image/tiff'
            ],
            'max_size_mb': 10,
            'is_active': True
        },
        {
            'name': 'document',
            'display_name': 'اسناد',
            'category': 'document',
            'extensions': ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
            'mime_types': [
                'application/pdf', 'application/msword', 
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain', 'application/rtf'
            ],
            'max_size_mb': 50,
            'is_active': True
        },
        {
            'name': 'cad_3d',
            'display_name': 'فایل‌های سه بعدی',
            'category': 'cad_3d',
            'extensions': ['.stl', '.obj', '.stp', '.step', '.iges', '.igs', '.3ds', '.dae', '.fbx'],
            'mime_types': [
                'application/sla', 'application/octet-stream', 'model/stl', 'model/obj'
            ],
            'max_size_mb': 100,
            'is_active': True
        },
        {
            'name': 'drawing',
            'display_name': 'نقشه‌ها',
            'category': 'drawing',
            'extensions': ['.dwg', '.dxf', '.pdf'],
            'mime_types': [
                'application/dwg', 'application/dxf', 'application/pdf'
            ],
            'max_size_mb': 100,
            'is_active': True
        },
        {
            'name': 'archive',
            'display_name': 'فایل‌های فشرده',
            'category': 'other',
            'extensions': ['.zip', '.rar', '.7z'],
            'mime_types': [
                'application/zip', 'application/x-rar-compressed', 
                'application/x-7z-compressed'
            ],
            'max_size_mb': 100,
            'is_active': True
        }
    ]
    
    created_count = 0
    for file_type_data in file_types:
        file_type, created = TicketFileType.objects.get_or_create(
            name=file_type_data['name'],
            defaults=file_type_data
        )
        if created:
            created_count += 1
            print(f"✓ Created file type: {file_type.display_name}")
        else:
            print(f"- File type already exists: {file_type.display_name}")
    
    print(f"\nCreated {created_count} new file types")
    return created_count


def create_ticket_categories():
    """Create default ticket categories"""
    from api.models import TicketCategory
    
    categories = [
        {
            'name': 'order_support',
            'display_name': 'پشتیبانی سفارش',
            'requires_order': True,
            'description': 'پشتیبانی و راهنمایی برای سفارشات در حال انجام'
        },
        {
            'name': 'technical_issue',
            'display_name': 'مشکل فنی',
            'requires_order': False,
            'description': 'گزارش مشکلات فنی سایت یا سیستم'
        },
        {
            'name': 'general_inquiry',
            'display_name': 'سوال عمومی',
            'requires_order': False,
            'description': 'سوالات عمومی در مورد خدمات و امکانات'
        },
        {
            'name': 'billing_support',
            'display_name': 'پشتیبانی مالی',
            'requires_order': False,
            'description': 'پشتیبانی در مورد مسائل مالی و پرداخت'
        }
    ]
    
    created_count = 0
    for category_data in categories:
        category, created = TicketCategory.objects.get_or_create(
            name=category_data['name'],
            defaults=category_data
        )
        if created:
            created_count += 1
            print(f"✓ Created category: {category.display_name}")
        else:
            print(f"- Category already exists: {category.display_name}")
    
    print(f"\nCreated {created_count} new categories")
    return created_count


if __name__ == '__main__':
    print("Setting up ticket file types and categories...")
    print("=" * 50)
    
    file_types_count = create_ticket_file_types()
    print("\n" + "=" * 50)
    categories_count = create_ticket_categories()
    
    print("\n" + "=" * 50)
    print(f"Setup completed!")
    print(f"Created {file_types_count} file types and {categories_count} categories")
