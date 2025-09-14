#!/usr/bin/env python3
"""
Script to update drawing service to have tabs
"""

import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Service, ServiceTab, ServiceField

def update_drawing_service():
    """Update drawing service to have tabs"""
    
    # Get the drawing service
    try:
        drawing_service = Service.objects.get(type='drawing')
        print(f"Found drawing service: {drawing_service.name}")
    except Service.DoesNotExist:
        print("Drawing service not found!")
        return
    
    # Update has_tabs to True
    drawing_service.has_tabs = True
    drawing_service.save()
    print(f"Updated {drawing_service.name} to have tabs")
    
    # Create tabs for drawing service
    tabs_data = [
        {
            'name': 'production_drawing',
            'display_name': 'نقشه ساخت',
            'description': 'نقشه ساخت قطعات و اجزای مختلف',
            'order': 1,
            'fields': [
                {
                    'name': 'آپلود فایل (اجباری)',
                    'field_key': 'upload_file',
                    'type': 'file',
                    'is_required': True,
                    'order': 1,
                    'help_text': 'فایل سه بعدی خود را آپلود کنید'
                },
                {
                    'name': 'فرمت‌های مجاز',
                    'field_key': 'allowed_formats',
                    'type': 'multiselect',
                    'options': [
                        {'value': 'step', 'label': 'STEP'},
                        {'value': 'stp', 'label': 'STP'},
                        {'value': 'solidworks', 'label': 'SolidWorks'},
                        {'value': 'inventor', 'label': 'Inventor'}
                    ],
                    'is_required': True,
                    'order': 2,
                    'help_text': 'فرمت‌های مجاز فایل'
                },
                {
                    'name': 'سختی قطعه',
                    'field_key': 'part_hardness',
                    'type': 'text',
                    'is_required': True,
                    'order': 3,
                    'help_text': 'مثال: 200, HB 45, HRC...'
                },
                {
                    'name': 'جنس قطعه',
                    'field_key': 'part_material',
                    'type': 'text',
                    'is_required': True,
                    'order': 4,
                    'help_text': 'مثال: فولاد 304 AISI, آلومینیوم 6061...'
                },
                {
                    'name': 'عملیات پوشش دهی',
                    'field_key': 'coating_operations',
                    'type': 'text',
                    'is_required': False,
                    'order': 5,
                    'help_text': 'مثال: داکرومات 15 میکرومتر...'
                }
            ]
        },
        {
            'name': 'exploded_drawing',
            'display_name': 'نقشه انفجاری',
            'description': 'نقشه انفجاری و مونتاژ قطعات',
            'order': 2,
            'fields': [
                {
                    'name': 'آپلود فایل مونتاژ',
                    'field_key': 'assembly_file',
                    'type': 'file',
                    'is_required': True,
                    'order': 1,
                    'help_text': 'فایل مونتاژ سه بعدی'
                },
                {
                    'name': 'تعداد قطعات',
                    'field_key': 'part_count',
                    'type': 'number',
                    'is_required': True,
                    'order': 2,
                    'help_text': 'تعداد کل قطعات در مونتاژ'
                },
                {
                    'name': 'نوع نمایش',
                    'field_key': 'display_type',
                    'type': 'select',
                    'options': [
                        {'value': 'isometric', 'label': 'ایزومتریک'},
                        {'value': 'orthographic', 'label': 'ارتوگرافیک'},
                        {'value': 'section', 'label': 'مقطع'}
                    ],
                    'is_required': True,
                    'order': 3,
                    'help_text': 'نوع نمایش نقشه انفجاری'
                }
            ]
        },
        {
            'name': 'welding_drawing',
            'display_name': 'نقشه جوش',
            'description': 'نقشه‌های جوشکاری و اتصالات',
            'order': 3,
            'fields': [
                {
                    'name': 'آپلود فایل جوش',
                    'field_key': 'welding_file',
                    'type': 'file',
                    'is_required': True,
                    'order': 1,
                    'help_text': 'فایل قطعاتی که باید جوش داده شوند'
                },
                {
                    'name': 'نوع جوش',
                    'field_key': 'welding_type',
                    'type': 'select',
                    'options': [
                        {'value': 'butt', 'label': 'جوش لب به لب'},
                        {'value': 'fillet', 'label': 'جوش گوشه'},
                        {'value': 'plug', 'label': 'جوش سوراخی'},
                        {'value': 'spot', 'label': 'جوش نقطه‌ای'}
                    ],
                    'is_required': True,
                    'order': 2,
                    'help_text': 'نوع جوش مورد نیاز'
                },
                {
                    'name': 'ضخامت جوش',
                    'field_key': 'weld_thickness',
                    'type': 'number',
                    'is_required': True,
                    'order': 3,
                    'help_text': 'ضخامت جوش به میلی‌متر'
                },
                {
                    'name': 'استاندارد جوش',
                    'field_key': 'welding_standard',
                    'type': 'text',
                    'is_required': True,
                    'order': 4,
                    'help_text': 'مثال: AWS D1.1, ISO 2553'
                }
            ]
        }
    ]
    
    # Create tabs and fields
    for tab_data in tabs_data:
        # Create tab
        tab, created = ServiceTab.objects.get_or_create(
            service=drawing_service,
            name=tab_data['name'],
            defaults={
                'display_name': tab_data['display_name'],
                'description': tab_data['description'],
                'order': tab_data['order'],
                'is_active': True
            }
        )
        
        if created:
            print(f"Created tab: {tab.display_name}")
        else:
            print(f"Tab already exists: {tab.display_name}")
        
        # Create fields for this tab
        for field_data in tab_data['fields']:
            field, created = ServiceField.objects.get_or_create(
                service=drawing_service,
                tab=tab,
                field_key=field_data['field_key'],
                defaults={
                    'name': field_data['name'],
                    'type': field_data['type'],
                    'options': field_data.get('options'),
                    'is_required': field_data['is_required'],
                    'order': field_data['order'],
                    'help_text': field_data.get('help_text', '')
                }
            )
            
            if created:
                print(f"  Created field: {field.name}")
            else:
                print(f"  Field already exists: {field.name}")

if __name__ == '__main__':
    print("Updating drawing service to have tabs...")
    update_drawing_service()
    print("Done!")
