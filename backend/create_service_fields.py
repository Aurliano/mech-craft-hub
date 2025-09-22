#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Service, ServiceField, ServiceTab

def create_service_fields():
    # Get services
    analysis_service = Service.objects.get(id='550e8400-e29b-41d4-a716-446655440001')
    design_service = Service.objects.get(id='550e8400-e29b-41d4-a716-446655440002')
    manufacturing_service = Service.objects.get(id='550e8400-e29b-41d4-a716-446655440003')
    drawing_service = Service.objects.get(id='550e8400-e29b-41d4-a716-446655440004')
    
    # Create tabs for each service
    analysis_tab, _ = ServiceTab.objects.get_or_create(
        service=analysis_service,
        name='simulation',
        defaults={
            'display_name': 'شبیه‌سازی',
            'description': 'تنظیمات شبیه‌سازی',
            'order': 1,
            'is_active': True
        }
    )
    
    design_tab, _ = ServiceTab.objects.get_or_create(
        service=design_service,
        name='design',
        defaults={
            'display_name': 'طراحی',
            'description': 'تنظیمات طراحی',
            'order': 1,
            'is_active': True
        }
    )
    
    manufacturing_tab, _ = ServiceTab.objects.get_or_create(
        service=manufacturing_service,
        name='production',
        defaults={
            'display_name': 'تولید',
            'description': 'تنظیمات تولید',
            'order': 1,
            'is_active': True
        }
    )
    
    drawing_tab, _ = ServiceTab.objects.get_or_create(
        service=drawing_service,
        name='technical_drawing',
        defaults={
            'display_name': 'نقشه‌کشی فنی',
            'description': 'تنظیمات نقشه‌کشی',
            'order': 1,
            'is_active': True
        }
    )
    
    # Analysis Service Fields
    analysis_fields = [
        {
            'service': analysis_service,
            'tab': analysis_tab,
            'name': 'نوع تحلیل',
            'field_key': 'analysis_type',
            'type': 'select',
            'options': ['استاتیک', 'دینامیک', 'حرارتی', 'سیال', 'مغناطیسی'],
            'is_required': True,
            'order': 1,
            'help_text': 'نوع تحلیل مورد نظر را انتخاب کنید'
        },
        {
            'service': analysis_service,
            'tab': analysis_tab,
            'name': 'نرم‌افزار',
            'field_key': 'software',
            'type': 'select',
            'options': ['ANSYS', 'COMSOL', 'ABAQUS', 'SolidWorks Simulation', 'MATLAB'],
            'is_required': True,
            'order': 2,
            'help_text': 'نرم‌افزار مورد استفاده'
        },
        {
            'service': analysis_service,
            'tab': analysis_tab,
            'name': 'پیچیدگی پروژه',
            'field_key': 'complexity',
            'type': 'select',
            'options': ['ساده', 'متوسط', 'پیچیده', 'بسیار پیچیده'],
            'is_required': True,
            'order': 3,
            'help_text': 'سطح پیچیدگی پروژه'
        },
        {
            'service': analysis_service,
            'tab': analysis_tab,
            'name': 'فایل مدل',
            'field_key': 'model_file',
            'type': 'file',
            'is_required': True,
            'order': 4,
            'help_text': 'فایل مدل سه‌بعدی (STEP, IGES, STL)'
        },
        {
            'service': analysis_service,
            'tab': analysis_tab,
            'name': 'توضیحات اضافی',
            'field_key': 'description',
            'type': 'textarea',
            'is_required': False,
            'order': 5,
            'help_text': 'توضیحات تکمیلی در مورد پروژه'
        }
    ]
    
    # Design Service Fields
    design_fields = [
        {
            'service': design_service,
            'tab': design_tab,
            'name': 'نوع طراحی',
            'field_key': 'design_type',
            'type': 'select',
            'options': ['قطعه منفرد', 'مجموعه', 'سیستم کامل', 'بهینه‌سازی'],
            'is_required': True,
            'order': 1,
            'help_text': 'نوع طراحی مورد نظر'
        },
        {
            'service': design_service,
            'tab': design_tab,
            'name': 'مواد',
            'field_key': 'material',
            'type': 'select',
            'options': ['فولاد', 'آلومینیوم', 'پلاستیک', 'کامپوزیت', 'سایر'],
            'is_required': True,
            'order': 2,
            'help_text': 'نوع ماده مورد استفاده'
        },
        {
            'service': design_service,
            'tab': design_tab,
            'name': 'ابعاد تقریبی',
            'field_key': 'dimensions',
            'type': 'text',
            'is_required': True,
            'order': 3,
            'help_text': 'ابعاد تقریبی (مثال: 100x50x25 mm)'
        },
        {
            'service': design_service,
            'tab': design_tab,
            'name': 'فایل مرجع',
            'field_key': 'reference_file',
            'type': 'file',
            'is_required': False,
            'order': 4,
            'help_text': 'فایل مرجع یا نقشه اولیه'
        },
        {
            'service': design_service,
            'tab': design_tab,
            'name': 'ویژگی‌های خاص',
            'field_key': 'special_requirements',
            'type': 'textarea',
            'is_required': False,
            'order': 5,
            'help_text': 'ویژگی‌های خاص و محدودیت‌ها'
        }
    ]
    
    # Manufacturing Service Fields
    manufacturing_fields = [
        {
            'service': manufacturing_service,
            'tab': manufacturing_tab,
            'name': 'روش تولید',
            'field_key': 'manufacturing_method',
            'type': 'select',
            'options': ['CNC', 'پرینت سه‌بعدی', 'قالب‌گیری', 'ماشینکاری', 'جوشکاری'],
            'is_required': True,
            'order': 1,
            'help_text': 'روش تولید مورد نظر'
        },
        {
            'service': manufacturing_service,
            'tab': manufacturing_tab,
            'name': 'تعداد قطعه',
            'field_key': 'quantity',
            'type': 'number',
            'is_required': True,
            'order': 2,
            'help_text': 'تعداد قطعات مورد نیاز'
        },
        {
            'service': manufacturing_service,
            'tab': manufacturing_tab,
            'name': 'دقت تولید',
            'field_key': 'precision',
            'type': 'select',
            'options': ['±0.1mm', '±0.05mm', '±0.01mm', '±0.005mm', 'سایر'],
            'is_required': True,
            'order': 3,
            'help_text': 'دقت مورد نیاز'
        },
        {
            'service': manufacturing_service,
            'tab': manufacturing_tab,
            'name': 'فایل نقشه',
            'field_key': 'drawing_file',
            'type': 'file',
            'is_required': True,
            'order': 4,
            'help_text': 'فایل نقشه فنی (DWG, PDF)'
        },
        {
            'service': manufacturing_service,
            'tab': manufacturing_tab,
            'name': 'مواد اولیه',
            'field_key': 'raw_material',
            'type': 'text',
            'is_required': True,
            'order': 5,
            'help_text': 'نوع و مشخصات مواد اولیه'
        }
    ]
    
    # Drawing Service Fields
    drawing_fields = [
        {
            'service': drawing_service,
            'tab': drawing_tab,
            'name': 'نوع نقشه',
            'field_key': 'drawing_type',
            'type': 'select',
            'options': ['نقشه فنی', 'نقشه مونتاژ', 'نقشه انفجاری', 'نقشه جوش', 'نقشه ابعادی'],
            'is_required': True,
            'order': 1,
            'help_text': 'نوع نقشه مورد نیاز'
        },
        {
            'service': drawing_service,
            'tab': drawing_tab,
            'name': 'استاندارد نقشه‌کشی',
            'field_key': 'standard',
            'type': 'select',
            'options': ['ISO', 'ASME', 'DIN', 'JIS', 'سایر'],
            'is_required': True,
            'order': 2,
            'help_text': 'استاندارد نقشه‌کشی'
        },
        {
            'service': drawing_service,
            'tab': drawing_tab,
            'name': 'مقیاس نقشه',
            'field_key': 'scale',
            'type': 'select',
            'options': ['1:1', '1:2', '1:5', '1:10', '1:20', '1:50', '1:100'],
            'is_required': True,
            'order': 3,
            'help_text': 'مقیاس نقشه'
        },
        {
            'service': drawing_service,
            'tab': drawing_tab,
            'name': 'فایل مدل',
            'field_key': 'model_file',
            'type': 'file',
            'is_required': True,
            'order': 4,
            'help_text': 'فایل مدل سه‌بعدی'
        },
        {
            'service': drawing_service,
            'tab': drawing_tab,
            'name': 'فرمت خروجی',
            'field_key': 'output_format',
            'type': 'multiselect',
            'options': ['DWG', 'PDF', 'DXF', 'STEP', 'IGES'],
            'is_required': True,
            'order': 5,
            'help_text': 'فرمت‌های خروجی مورد نیاز'
        }
    ]
    
    # Create all fields
    all_fields = analysis_fields + design_fields + manufacturing_fields + drawing_fields
    
    for field_data in all_fields:
        field, created = ServiceField.objects.get_or_create(
            service=field_data['service'],
            field_key=field_data['field_key'],
            defaults=field_data
        )
        if created:
            print(f"Created field: {field.name} for {field.service.name}")
        else:
            print(f"Field already exists: {field.name} for {field.service.name}")

if __name__ == '__main__':
    create_service_fields()
    print("Service fields created successfully!")
