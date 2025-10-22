#!/usr/bin/env python3
"""
Create sample data for MechCraft Hub services
This script creates the complete service structure as specified:
- Scope: مهندسی مکانیک (Mechanical Engineering)
- Services: Design, Analysis, Drawing, Manufacturing, Documentation
- Tabs and fields for each service as specified
"""

import os
import sys
import django

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings_ultra_simple')
django.setup()

from api.models import Scope, Service, ServiceTab, ServiceField


def clear_existing_data():
    """Clear all existing services, tabs, and fields"""
    print("🧹 Clearing existing data...")
    ServiceField.objects.all().delete()
    ServiceTab.objects.all().delete()
    Service.objects.all().delete()
    Scope.objects.all().delete()
    print("✅ Existing data cleared")


def create_scope():
    """Create Mechanical Engineering scope"""
    print("🏗️ Creating Mechanical Engineering scope...")
    scope, created = Scope.objects.get_or_create(
        name='مهندسی مکانیک',
        defaults={
            'display_name': 'مهندسی مکانیک',
            'description': 'خدمات مهندسی مکانیک و طراحی صنعتی',
            'is_active': True
        }
    )
    
    if created:
        print(f"✅ Created scope: {scope.display_name}")
    else:
        print(f"ℹ️ Scope already exists: {scope.display_name}")
    
    return scope


def create_design_service(scope):
    """Create Design and Modeling service (no tabs)"""
    print("🎨 Creating Design and Modeling service...")
    service, created = Service.objects.get_or_create(
        scope=scope,
        name='طراحی و مدل‌سازی مهندسی',
        defaults={
            'type': 'design',
            'description': 'خدمات طراحی و مدل‌سازی مهندسی',
            'base_price': 800000,
            'estimated_delivery_days': 10,
            'supports_documentation': True,
            'has_tabs': False,
            'is_active': True
        }
    )
    
    if created:
        print(f"✅ Created service: {service.name}")
    else:
        print(f"ℹ️ Service already exists: {service.name}")
    
    return service


def create_analysis_service(scope):
    """Create Analysis and Simulation service with 3 tabs"""
    print("📊 Creating Analysis and Simulation service...")
    service, created = Service.objects.get_or_create(
        scope=scope,
        name='تحلیل و شبیه‌سازی',
        defaults={
            'type': 'analysis',
            'description': 'خدمات تحلیل استاتیکی، دینامیکی و حل مسئله با کدنویسی',
            'base_price': 1200000,
            'estimated_delivery_days': 10,
            'supports_documentation': True,
            'has_tabs': True,
            'is_active': True
        }
    )
    
    if created:
        print(f"✅ Created service: {service.name}")
    else:
        print(f"ℹ️ Service already exists: {service.name}")
    
    return service


def create_drawing_service(scope):
    """Create Industrial Drawing service with 3 tabs"""
    print("📐 Creating Industrial Drawing service...")
    service, created = Service.objects.get_or_create(
        scope=scope,
        name='نقشه‌کشی صنعتی',
        defaults={
            'type': 'drawing',
            'description': 'خدمات نقشه‌کشی صنعتی شامل نقشه جوشکاری، انفجاری و ساخت',
            'base_price': 600000,
            'estimated_delivery_days': 7,
            'supports_documentation': True,
            'has_tabs': True,
            'is_active': True
        }
    )
    
    if created:
        print(f"✅ Created service: {service.name}")
    else:
        print(f"ℹ️ Service already exists: {service.name}")
    
    return service


def create_manufacturing_service(scope):
    """Create Manufacturing service (no tabs)"""
    print("🏭 Creating Manufacturing service...")
    service, created = Service.objects.get_or_create(
        scope=scope,
        name='ساخت و تولید',
        defaults={
            'type': 'manufacturing',
            'description': 'خدمات ساخت و تولید قطعات صنعتی با شبکه گسترده کارگاه‌ها',
            'base_price': 1000000,
            'estimated_delivery_days': 14,
            'supports_documentation': True,
            'has_tabs': False,
            'is_active': True
        }
    )
    
    if created:
        print(f"✅ Created service: {service.name}")
    else:
        print(f"ℹ️ Service already exists: {service.name}")
    
    return service


def create_documentation_service(scope):
    """Create Documentation service with 13 fields (12 checkboxes + 1 text)"""
    print("📚 Creating Documentation service...")
    service, created = Service.objects.get_or_create(
        scope=scope,
        name='مستندسازی',
        defaults={
            'type': 'documentation',
            'description': 'خدمات مستندسازی تخصصی پروژه‌های مهندسی',
            'base_price': 300000,
            'estimated_delivery_days': 5,
            'supports_documentation': False,  # Documentation service doesn't need documentation itself
            'has_tabs': False,
            'is_active': True
        }
    )
    
    if created:
        print(f"✅ Created service: {service.name}")
    else:
        print(f"ℹ️ Service already exists: {service.name}")
    
    return service


def create_analysis_tabs(analysis_service):
    """Create 3 tabs for Analysis service: Static, Dynamic, Coding"""
    print("📊 Creating Analysis service tabs...")
    
    tabs_data = [
        {
            'name': 'static_analysis',
            'display_name': 'تحلیل استاتیکی',
            'description': 'تحلیل استاتیکی با نرم‌افزارهای تخصصی',
            'order': 1
        },
        {
            'name': 'dynamic_analysis',
            'display_name': 'تحلیل دینامیکی',
            'description': 'تحلیل دینامیکی و شبیه‌سازی',
            'order': 2
        },
        {
            'name': 'coding_solution',
            'display_name': 'حل مسئله با کدنویسی',
            'description': 'حل مسائل با MATLAB و SIMULINK',
            'order': 3
        }
    ]
    
    created_tabs = []
    for tab_data in tabs_data:
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
            created_tabs.append(tab)
            print(f"✅ Created analysis tab: {tab.display_name}")
        else:
            print(f"ℹ️ Tab already exists: {tab.display_name}")
    
    return created_tabs


def create_drawing_tabs(drawing_service):
    """Create 3 tabs for Drawing service: Welding, Exploded, Manufacturing"""
    print("📐 Creating Drawing service tabs...")
    
    tabs_data = [
        {
            'name': 'welding_drawing',
            'display_name': 'نقشه جوشکاری',
            'description': 'طراحی نقشه‌های جوشکاری و اتصالات',
            'order': 1
        },
        {
            'name': 'exploded_drawing',
            'display_name': 'نقشه انفجاری',
            'description': 'طراحی نقشه‌های انفجاری و مونتاژ',
            'order': 2
        },
        {
            'name': 'manufacturing_drawing',
            'display_name': 'نقشه ساخت',
            'description': 'طراحی نقشه‌های ساخت و تولید قطعات',
            'order': 3
        }
    ]
    
    created_tabs = []
    for tab_data in tabs_data:
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
            created_tabs.append(tab)
            print(f"✅ Created drawing tab: {tab.display_name}")
        else:
            print(f"ℹ️ Tab already exists: {tab.display_name}")
    
    return created_tabs


def create_design_fields(design_service):
    """Create fields for Design service (no tabs)"""
    print("🎨 Creating Design service fields...")
    
    fields_data = [
        {
            'name': 'نام پروژه',
            'field_key': 'project_name',
            'type': 'text',
            'is_required': True,
            'order': 1,
            'help_text': 'نام پروژه یا محصول'
        },
        {
            'name': 'نوع طراحی',
            'field_key': 'design_type',
            'type': 'select',
            'options': [
                {'value': 'mechanical', 'label': 'مکانیکی'},
                {'value': 'structural', 'label': 'سازه‌ای'},
                {'value': 'product', 'label': 'محصولی'},
                {'value': 'automotive', 'label': 'خودرویی'}
            ],
            'is_required': True,
            'order': 2,
            'help_text': 'نوع طراحی مورد نظر را انتخاب کنید'
        },
        {
            'name': 'فایل مرجع',
            'field_key': 'reference_file',
            'type': 'file',
            'is_required': True,
            'order': 3,
            'help_text': 'فایل مدل سه بعدی خود را ارسال کنید (sldprt, sldasm, ipt, iam, stp)'
        },
        {
            'name': 'توضیحات پروژه',
            'field_key': 'project_description',
            'type': 'textarea',
            'is_required': False,
            'order': 4,
            'help_text': 'توضیحات کامل پروژه و نیازمندی‌های خاص'
        },
        {
            'name': 'اولویت پروژه',
            'field_key': 'project_priority',
            'type': 'select',
            'options': [
                {'value': 'low', 'label': 'کم'},
                {'value': 'medium', 'label': 'متوسط'},
                {'value': 'high', 'label': 'بالا'},
                {'value': 'urgent', 'label': 'فوری'}
            ],
            'is_required': True,
            'order': 5
        }
    ]
    
    for field_data in fields_data:
        field, created = ServiceField.objects.get_or_create(
            service=design_service,
            tab=None,
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
            print(f"✅ Created design field: {field.name}")
        else:
            print(f"ℹ️ Field already exists: {field.name}")


def create_analysis_fields(analysis_service, analysis_tabs):
    """Create fields for Analysis service tabs"""
    print("📊 Creating Analysis service fields...")
    
    # Static Analysis fields
    static_tab = next((tab for tab in analysis_tabs if tab.name == 'static_analysis'), None)
    if static_tab:
        static_fields = [
            {
                'name': 'انتخاب نرم‌افزار',
                'field_key': 'static_software_selection',
                'type': 'select',
                'options': [
                    {'value': 'comsol', 'label': 'COMSOL'},
                    {'value': 'abaqus', 'label': 'ABAQUS'},
                    {'value': 'adams', 'label': 'ADAMS'}
                ],
                'is_required': True,
                'order': 1,
                'help_text': 'نرم‌افزار مورد نظر برای تحلیل استاتیکی را انتخاب کنید'
            },
            {
                'name': 'بارگذاری فایل‌های پروژه',
                'field_key': 'static_project_files',
                'type': 'file',
                'is_required': True,
                'order': 2,
                'help_text': 'فایل مدل خود را آپلود کنید (فرمت‌های مجاز: DWG, STEP, STP, IGES, SLDPRT, SLDASM, IPT, IAM)'
            },
            {
                'name': 'توضیحات تکمیلی',
                'field_key': 'static_additional_notes',
                'type': 'textarea',
                'is_required': True,
                'order': 3,
                'help_text': 'توضیحات کاملی از پروژه خود ارائه دهید'
            }
        ]
        
        for field_data in static_fields:
            field, created = ServiceField.objects.get_or_create(
                service=analysis_service,
                tab=static_tab,
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
                print(f"✅ Created static analysis field: {field.name}")
            else:
                print(f"ℹ️ Field already exists: {field.name}")
    
    # Dynamic Analysis fields
    dynamic_tab = next((tab for tab in analysis_tabs if tab.name == 'dynamic_analysis'), None)
    if dynamic_tab:
        dynamic_fields = [
            {
                'name': 'بارگذاری فایل‌های پروژه',
                'field_key': 'dynamic_project_files',
                'type': 'file',
                'is_required': True,
                'order': 1,
                'help_text': 'فایل مدل خود را آپلود کنید (فرمت‌های مجاز: DWG, STEP, STP, IGES, SLDPRT, SLDASM, IPT, IAM)'
            },
            {
                'name': 'توضیحات تکمیلی',
                'field_key': 'dynamic_additional_notes',
                'type': 'textarea',
                'is_required': True,
                'order': 2,
                'help_text': 'توضیحات کاملی از پروژه خود ارائه دهید'
            }
        ]
        
        for field_data in dynamic_fields:
            field, created = ServiceField.objects.get_or_create(
                service=analysis_service,
                tab=dynamic_tab,
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
                print(f"✅ Created dynamic analysis field: {field.name}")
            else:
                print(f"ℹ️ Field already exists: {field.name}")
    
    # Coding Solution fields
    coding_tab = next((tab for tab in analysis_tabs if tab.name == 'coding_solution'), None)
    if coding_tab:
        coding_fields = [
            {
                'name': 'انتخاب نرم‌افزار مورد نظر',
                'field_key': 'coding_software_selection',
                'type': 'select',
                'options': [
                    {'value': 'matlab', 'label': 'MATLAB'},
                    {'value': 'simulink', 'label': 'SIMULINK'}
                ],
                'is_required': True,
                'order': 1,
                'help_text': 'نرم‌افزار مورد نظر برای حل مسئله را انتخاب کنید'
            },
            {
                'name': 'بارگذاری فایل‌های پروژه',
                'field_key': 'coding_project_files',
                'type': 'file',
                'is_required': False,
                'order': 2,
                'help_text': 'فایل‌های پروژه (فرمت‌های مجاز: PDF, DOCX, JPG, JPEG, PNG) - اختیاری'
            },
            {
                'name': 'توضیحات تکمیلی',
                'field_key': 'coding_additional_notes',
                'type': 'textarea',
                'is_required': True,
                'order': 3,
                'help_text': 'توضیحات کاملی از پروژه خود ارائه دهید'
            }
        ]
        
        for field_data in coding_fields:
            field, created = ServiceField.objects.get_or_create(
                service=analysis_service,
                tab=coding_tab,
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
                print(f"✅ Created coding solution field: {field.name}")
            else:
                print(f"ℹ️ Field already exists: {field.name}")


def create_drawing_fields(drawing_service, drawing_tabs):
    """Create fields for Drawing service tabs"""
    print("📐 Creating Drawing service fields...")
    
    # Welding Drawing fields
    welding_tab = next((tab for tab in drawing_tabs if tab.name == 'welding_drawing'), None)
    if welding_tab:
        welding_fields = [
            {
                'name': 'فایل مرجع',
                'field_key': 'reference_file',
                'type': 'file',
                'is_required': True,
                'order': 1,
                'help_text': 'فایل مدل سه بعدی خود را ارسال کنید (sldprt, sldasm, ipt, iam, stp) - نواحی که باید جوشکاری شوند را در فایل مشخص کنید'
            },
            {
                'name': 'روش جوشکاری',
                'field_key': 'welding_method',
                'type': 'text',
                'is_required': False,
                'order': 2,
                'help_text': 'راهنما: SMAW, MIG, TIG, FCAW'
            },
            {
                'name': 'ضخامت درز (ساق جوش)',
                'field_key': 'weld_thickness',
                'type': 'text',
                'is_required': False,
                'order': 3,
                'help_text': 'انتخاب واحد و مقدار عددی'
            },
            {
                'name': 'تلرانس‌های عددی',
                'field_key': 'welding_dimensional_tolerance',
                'type': 'text',
                'is_required': False,
                'order': 4,
                'help_text': 'انتخاب واحد و مقدار عددی'
            },
            {
                'name': 'تلرانس‌های هندسی',
                'field_key': 'welding_geometric_tolerance',
                'type': 'text',
                'is_required': False,
                'order': 5,
                'help_text': 'انتخاب واحد و مقدار عددی'
            },
            {
                'name': 'توضیحات تکمیلی',
                'field_key': 'welding_additional_notes',
                'type': 'textarea',
                'is_required': False,
                'order': 6,
                'help_text': 'هر توضیح اضافی که لازم است'
            }
        ]
        
        for field_data in welding_fields:
            field, created = ServiceField.objects.get_or_create(
                service=drawing_service,
                tab=welding_tab,
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
                print(f"✅ Created welding drawing field: {field.name}")
            else:
                print(f"ℹ️ Field already exists: {field.name}")
    
    # Exploded Drawing fields
    exploded_tab = next((tab for tab in drawing_tabs if tab.name == 'exploded_drawing'), None)
    if exploded_tab:
        exploded_fields = [
            {
                'name': 'آپلود فایل مدل',
                'field_key': 'exploded_model_file',
                'type': 'file',
                'is_required': True,
                'order': 1,
                'help_text': 'فایل مدل سه بعدی خود را ارسال کنید (sldprt, sldasm, ipt, iam, stp)'
            },
            {
                'name': 'توضیحات تکمیلی',
                'field_key': 'exploded_additional_notes',
                'type': 'textarea',
                'is_required': False,
                'order': 2,
                'help_text': 'اگر مجموعه شما خود متشکل از مجموعه‌هایی است، در فایل کلی مجموعه به صورت زیر مجموعه‌هایی (assembly) قرار گرفته و در بخش توضیحات نیز این موضوع به تفکیک اسم مجموعه و قطعات ذکر شوند'
            }
        ]
        
        for field_data in exploded_fields:
            field, created = ServiceField.objects.get_or_create(
                service=drawing_service,
                tab=exploded_tab,
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
                print(f"✅ Created exploded drawing field: {field.name}")
            else:
                print(f"ℹ️ Field already exists: {field.name}")
    
    # Manufacturing Drawing fields
    manufacturing_tab = next((tab for tab in drawing_tabs if tab.name == 'manufacturing_drawing'), None)
    if manufacturing_tab:
        manufacturing_fields = [
            {
                'name': 'آپلود فایل مدل',
                'field_key': 'manufacturing_model_file',
                'type': 'file',
                'is_required': True,
                'order': 1,
                'help_text': 'فایل مدل سه بعدی خود را ارسال کنید (sldprt, sldasm, ipt, iam, stp)'
            },
            {
                'name': 'جنس قطعه',
                'field_key': 'material',
                'type': 'text',
                'is_required': False,
                'order': 2,
                'help_text': 'نوع ماده مورد استفاده'
            },
            {
                'name': 'سختی قطعه',
                'field_key': 'hardness',
                'type': 'text',
                'is_required': False,
                'order': 3,
                'help_text': 'سختی مورد نظر قطعه'
            },
            {
                'name': 'نوع عملیات پوشش‌دهی',
                'field_key': 'coating_type',
                'type': 'text',
                'is_required': False,
                'order': 4,
                'help_text': 'در صورت لزوم'
            },
            {
                'name': 'ضخامت پوشش',
                'field_key': 'coating_thickness',
                'type': 'text',
                'is_required': False,
                'order': 5,
                'help_text': 'انتخاب واحد و مقدار عددی'
            },
            {
                'name': 'کیفیت سطح',
                'field_key': 'surface_quality',
                'type': 'textarea',
                'is_required': False,
                'order': 6,
                'help_text': 'میزان کیفیت سطح در سطوح مدنظر طراح - راهنما: به سایر سطوح، صافی سطح عمومی 1.6 با استاندارد DIN ISO 1302 تعلق می‌گیرد'
            },
            {
                'name': 'تلرانس‌های عددی',
                'field_key': 'manufacturing_dimensional_tolerance',
                'type': 'text',
                'is_required': False,
                'order': 7,
                'help_text': 'انتخاب واحد و مقدار عددی'
            },
            {
                'name': 'تلرانس‌های هندسی',
                'field_key': 'manufacturing_geometric_tolerance',
                'type': 'text',
                'is_required': False,
                'order': 8,
                'help_text': 'انتخاب واحد و مقدار عددی'
            }
        ]
        
        for field_data in manufacturing_fields:
            field, created = ServiceField.objects.get_or_create(
                service=drawing_service,
                tab=manufacturing_tab,
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
                print(f"✅ Created manufacturing drawing field: {field.name}")
            else:
                print(f"ℹ️ Field already exists: {field.name}")


def create_manufacturing_fields(manufacturing_service):
    """Create fields for Manufacturing service (no tabs)"""
    print("🏭 Creating Manufacturing service fields...")
    
    fields_data = [
        {
            'name': 'کلاس کارگاه هدف',
            'field_key': 'workshop_class',
            'type': 'select',
            'options': [
                {'value': 'class_a', 'label': 'کلاس A'},
                {'value': 'class_b', 'label': 'کلاس B'},
                {'value': 'class_c', 'label': 'کلاس C'},
                {'value': 'all', 'label': 'همه کارگاه‌ها'},
            ],
            'is_required': True,
            'order': 1,
            'help_text': 'سفارش به کدام دسته کارگاه‌ها ارسال شود؟'
        },
        {
            'name': 'فرآیندهای ساخت',
            'field_key': 'manufacturing_processes',
            'type': 'multiselect',
            'options': [
                {'value': 'machining', 'label': 'تراشکاری'},
                {'value': 'milling', 'label': 'فرزکاری'},
                {'value': 'welding', 'label': 'جوشکاری'},
                {'value': 'coating', 'label': 'پوشش دهی'},
                {'value': 'grinding', 'label': 'سنگ زنی'},
                {'value': 'prototyping', 'label': 'نمونه سازی'},
                {'value': 'metallurgy', 'label': 'فرآیندهای متالوژی'},
            ],
            'is_required': True,
            'order': 2,
            'help_text': 'فرآیندهای ساخت مورد نیاز خود را انتخاب کنید'
        },
        {
            'name': 'فایل‌های نقشه/مدل',
            'field_key': 'drawing_files',
            'type': 'file',
            'is_required': True,
            'order': 3,
            'help_text': 'امکان آپلود چند فایل - فرمت‌های مجاز: PDF, DWG, DXF, STEP, STP, IGES, SLDPRT, SLDASM, IPT, IAM, JPG, JPEG, PNG'
        },
        {
            'name': 'جنس (متریال) قطعات',
            'field_key': 'material_specification',
            'type': 'textarea',
            'is_required': True,
            'order': 4,
            'help_text': 'مشخصات متریال مورد نیاز برای ساخت قطعات'
        },
        {
            'name': 'توضیحات تکمیلی',
            'field_key': 'additional_notes',
            'type': 'textarea',
            'is_required': False,
            'order': 5,
            'help_text': 'هر توضیح اضافی که لازم است'
        },
    ]
    
    for field_data in fields_data:
        field, created = ServiceField.objects.get_or_create(
            service=manufacturing_service,
            tab=None,
            field_key=field_data['field_key'],
            defaults={
                'name': field_data['name'],
                'type': field_data['type'],
                'options': field_data.get('options'),
                'is_required': field_data['is_required'],
                'order': field_data['order'],
                'help_text': field_data.get('help_text', ''),
            }
        )
        if created:
            print(f"✅ Created manufacturing field: {field.name}")
        else:
            print(f"ℹ️ Field already exists: {field.name}")


def create_documentation_fields(documentation_service):
    """Create fields for Documentation service (12 checkbox fields + 1 text field)"""
    print("📚 Creating Documentation service fields...")
    
    fields_data = [
        {
            'name': 'شرح عملکرد قطعات/سامانه',
            'field_key': 'function_description',
            'type': 'checkbox',
            'is_required': False,
            'order': 1,
            'help_text': 'توضیح کامل نحوه عملکرد و کاربرد قطعات'
        },
        {
            'name': 'دستورالعمل مونتاژ قطعات/سامانه',
            'field_key': 'assembly_instructions',
            'type': 'checkbox',
            'is_required': False,
            'order': 2,
            'help_text': 'راهنمای گام به گام مونتاژ و نصب'
        },
        {
            'name': 'سند متالورژیکی قطعات',
            'field_key': 'metallurgical_document',
            'type': 'checkbox',
            'is_required': False,
            'order': 3,
            'help_text': 'تحلیل و مشخصات مواد و خواص متالورژیکی'
        },
        {
            'name': 'سند عملیات حرارتی قطعات',
            'field_key': 'heat_treatment_document',
            'type': 'checkbox',
            'is_required': False,
            'order': 4,
            'help_text': 'فرآیندهای حرارتی و عملیات گرمایی'
        },
        {
            'name': 'گزارش آزمون آنالیز',
            'field_key': 'test_analysis_report',
            'type': 'checkbox',
            'is_required': False,
            'order': 5,
            'help_text': 'نتایج آزمایشات و تحلیل‌های انجام شده'
        },
        {
            'name': 'سند پوشش دهی قطعات',
            'field_key': 'coating_document',
            'type': 'checkbox',
            'is_required': False,
            'order': 6,
            'help_text': 'مشخصات پوشش‌ها و فرآیندهای پوشش‌دهی'
        },
        {
            'name': 'سند BOM (لیست قطعات و مواد)',
            'field_key': 'bom_document',
            'type': 'checkbox',
            'is_required': False,
            'order': 7,
            'help_text': 'فهرست کامل قطعات، مواد و مقادیر مورد نیاز'
        },
        {
            'name': 'سند عملیات فرآیند ساخت (OPC)',
            'field_key': 'opc_document',
            'type': 'checkbox',
            'is_required': False,
            'order': 8,
            'help_text': 'راهنمای عملیات و فرآیندهای ساخت'
        },
        {
            'name': 'سند فرآیند جریان ساخت (FPC)',
            'field_key': 'fpc_document',
            'type': 'checkbox',
            'is_required': False,
            'order': 9,
            'help_text': 'نمودار جریان فرآیندهای ساخت'
        },
        {
            'name': 'چک لیست کنترل ابعادی (QC)',
            'field_key': 'qc_checklist',
            'type': 'checkbox',
            'is_required': False,
            'order': 10,
            'help_text': 'لیست کنترل کیفیت و اندازه‌گیری ابعاد'
        },
        {
            'name': 'سند توانایی پیمانکار',
            'field_key': 'contractor_capability',
            'type': 'checkbox',
            'is_required': False,
            'order': 11,
            'help_text': 'مشخصات توانمندی‌ها و تجهیزات پیمانکار'
        },
        {
            'name': 'درخت طراحی',
            'field_key': 'design_tree',
            'type': 'checkbox',
            'is_required': False,
            'order': 12,
            'help_text': 'ساختار سلسله‌مراتبی طراحی و وابستگی‌ها'
        },
        {
            'name': 'توضیحات',
            'field_key': 'documentation_notes',
            'type': 'textarea',
            'is_required': False,
            'order': 13,
            'help_text': 'اگر مستند بخشی از قطعات این سفارش را می‌خواهید، قطعه مورد نظر را مشخص کنید'
        }
    ]
    
    for field_data in fields_data:
        field, created = ServiceField.objects.get_or_create(
            service=documentation_service,
            tab=None,
            field_key=field_data['field_key'],
            defaults={
                'name': field_data['name'],
                'type': field_data['type'],
                'options': field_data.get('options'),
                'is_required': field_data['is_required'],
                'order': field_data['order'],
                'help_text': field_data.get('help_text', ''),
            }
        )
        if created:
            print(f"✅ Created documentation field: {field.name}")
        else:
            print(f"ℹ️ Field already exists: {field.name}")


def main():
    """Main function to create all sample data"""
    print("🚀 Starting MechCraft Hub Sample Data Creation...")
    print("=" * 60)
    
    try:
        # Clear existing data
        clear_existing_data()
        
        # Create scope
        scope = create_scope()
        
        # Create services
        design_service = create_design_service(scope)
        analysis_service = create_analysis_service(scope)
        drawing_service = create_drawing_service(scope)
        manufacturing_service = create_manufacturing_service(scope)
        documentation_service = create_documentation_service(scope)
        
        # Create tabs for services that have them
        analysis_tabs = create_analysis_tabs(analysis_service)
        drawing_tabs = create_drawing_tabs(drawing_service)
        
        # Create fields for all services
        create_design_fields(design_service)
        create_analysis_fields(analysis_service, analysis_tabs)
        create_drawing_fields(drawing_service, drawing_tabs)
        create_manufacturing_fields(manufacturing_service)
        create_documentation_fields(documentation_service)
        
        print("=" * 60)
        print("🎉 Sample data creation completed successfully!")
        print(f"✅ Created scope: {scope.display_name}")
        print(f"✅ Created services: {design_service.name}, {analysis_service.name}, {drawing_service.name}, {manufacturing_service.name}, {documentation_service.name}")
        print(f"✅ Created tabs: {len(analysis_tabs)} for Analysis, {len(drawing_tabs)} for Drawing")
        print("✅ All fields created successfully")
        
    except Exception as e:
        print(f"❌ Error creating sample data: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
