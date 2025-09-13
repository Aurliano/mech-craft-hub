#!/usr/bin/env python3
"""
Script to create sample tabs and fields for analysis service
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

def create_analysis_tabs():
    """Create tabs for analysis service"""
    
    # Get the analysis service
    try:
        analysis_service = Service.objects.get(id='550e8400-e29b-41d4-a716-446655440001')
        print(f"Found analysis service: {analysis_service.name}")
    except Service.DoesNotExist:
        print("Analysis service not found!")
        return
    
    # Create tabs
    tabs_data = [
        {
            'name': 'static_analysis',
            'display_name': 'تحلیل استاتیک',
            'description': 'تحلیل استاتیک سازه‌ها و قطعات تحت بارهای ثابت',
            'order': 1,
            'fields': [
                {
                    'name': 'نوع بار',
                    'field_key': 'load_type',
                    'type': 'select',
                    'options': [
                        {'value': 'tensile', 'label': 'کششی'},
                        {'value': 'compressive', 'label': 'فشاری'},
                        {'value': 'bending', 'label': 'خمشی'},
                        {'value': 'torsion', 'label': 'پیچشی'},
                        {'value': 'combined', 'label': 'ترکیبی'}
                    ],
                    'is_required': True,
                    'order': 1,
                    'help_text': 'نوع بار اعمال شده به سازه را انتخاب کنید'
                },
                {
                    'name': 'مقدار بار (N)',
                    'field_key': 'load_value',
                    'type': 'number',
                    'is_required': True,
                    'order': 2,
                    'help_text': 'مقدار بار به نیوتن وارد کنید'
                },
                {
                    'name': 'نوع ماده',
                    'field_key': 'material_type',
                    'type': 'select',
                    'options': [
                        {'value': 'steel', 'label': 'فولاد'},
                        {'value': 'aluminum', 'label': 'آلومینیوم'},
                        {'value': 'composite', 'label': 'کامپوزیت'},
                        {'value': 'plastic', 'label': 'پلاستیک'}
                    ],
                    'is_required': True,
                    'order': 3,
                    'help_text': 'نوع ماده سازه را انتخاب کنید'
                },
                {
                    'name': 'فایل هندسه',
                    'field_key': 'geometry_file',
                    'type': 'file',
                    'is_required': True,
                    'order': 4,
                    'help_text': 'فایل هندسه سازه (STEP, IGES, STL)'
                }
            ]
        },
        {
            'name': 'dynamic_analysis',
            'display_name': 'تحلیل دینامیک',
            'description': 'تحلیل دینامیک و ارتعاشات سازه‌ها',
            'order': 2,
            'fields': [
                {
                    'name': 'نوع تحلیل دینامیک',
                    'field_key': 'dynamic_type',
                    'type': 'select',
                    'options': [
                        {'value': 'modal', 'label': 'تحلیل مودال'},
                        {'value': 'harmonic', 'label': 'تحلیل هارمونیک'},
                        {'value': 'transient', 'label': 'تحلیل گذرا'},
                        {'value': 'random', 'label': 'تحلیل تصادفی'}
                    ],
                    'is_required': True,
                    'order': 1,
                    'help_text': 'نوع تحلیل دینامیک مورد نیاز را انتخاب کنید'
                },
                {
                    'name': 'فرکانس تحریک (Hz)',
                    'field_key': 'excitation_frequency',
                    'type': 'number',
                    'is_required': True,
                    'order': 2,
                    'help_text': 'فرکانس تحریک به هرتز'
                },
                {
                    'name': 'دامنه تحریک (N)',
                    'field_key': 'excitation_amplitude',
                    'type': 'number',
                    'is_required': True,
                    'order': 3,
                    'help_text': 'دامنه نیروی تحریک به نیوتن'
                },
                {
                    'name': 'زمان تحلیل (s)',
                    'field_key': 'analysis_time',
                    'type': 'number',
                    'is_required': True,
                    'order': 4,
                    'help_text': 'مدت زمان تحلیل به ثانیه'
                }
            ]
        },
        {
            'name': 'coding_solution',
            'display_name': 'حل مسئله با کد نویسی',
            'description': 'حل مسائل مهندسی با استفاده از برنامه‌نویسی',
            'order': 3,
            'fields': [
                {
                    'name': 'زبان برنامه‌نویسی',
                    'field_key': 'programming_language',
                    'type': 'select',
                    'options': [
                        {'value': 'matlab', 'label': 'MATLAB'},
                        {'value': 'python', 'label': 'Python'},
                        {'value': 'c++', 'label': 'C++'},
                        {'value': 'fortran', 'label': 'Fortran'}
                    ],
                    'is_required': True,
                    'order': 1,
                    'help_text': 'زبان برنامه‌نویسی مورد نظر را انتخاب کنید'
                },
                {
                    'name': 'توضیحات مسئله',
                    'field_key': 'problem_description',
                    'type': 'textarea',
                    'is_required': True,
                    'order': 2,
                    'help_text': 'شرح کامل مسئله و خواسته‌های آن'
                },
                {
                    'name': 'فایل‌های ورودی',
                    'field_key': 'input_files',
                    'type': 'file',
                    'is_required': False,
                    'order': 3,
                    'help_text': 'فایل‌های داده ورودی (اختیاری)'
                },
                {
                    'name': 'نوع خروجی',
                    'field_key': 'output_type',
                    'type': 'multiselect',
                    'options': [
                        {'value': 'plots', 'label': 'نمودارها'},
                        {'value': 'data', 'label': 'داده‌های عددی'},
                        {'value': 'code', 'label': 'کد نهایی'},
                        {'value': 'report', 'label': 'گزارش تحلیلی'}
                    ],
                    'is_required': True,
                    'order': 4,
                    'help_text': 'نوع خروجی مورد نیاز را انتخاب کنید'
                }
            ]
        }
    ]
    
    # Create tabs and fields
    for tab_data in tabs_data:
        # Create tab
        tab, created = ServiceTab.objects.get_or_create(
            service=analysis_service,
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
                service=analysis_service,
                tab=tab,
                field_key=field_data['field_key'],
                defaults={
                    'name': field_data['name'],
                    'type': field_data['type'],
                    'options': field_data.get('options'),
                    'is_required': field_data['is_required'],
                    'order': field_data['order'],
                    'help_text': field_data.get('help_text', ''),
                    'is_active': True
                }
            )
            
            if created:
                print(f"  Created field: {field.name}")
            else:
                print(f"  Field already exists: {field.name}")

if __name__ == '__main__':
    print("Creating sample tabs for analysis service...")
    create_analysis_tabs()
    print("Done!")
