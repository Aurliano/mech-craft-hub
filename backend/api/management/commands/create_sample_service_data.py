from django.core.management.base import BaseCommand
from api.models import Scope, Service, ServiceTab, ServiceField
import uuid


class Command(BaseCommand):
    help = 'Create service data for all services with correct structure'

    def handle(self, *args, **options):
        # Clear existing data first
        self.stdout.write('Clearing existing data...')
        ServiceField.objects.all().delete()
        ServiceTab.objects.all().delete()
        Service.objects.all().delete()
        Scope.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Existing data cleared'))
        
        # Create scope
        scope, created = Scope.objects.get_or_create(
            name='مهندسی مکانیک',
            defaults={'description': 'خدمات مهندسی مکانیک و طراحی صنعتی'}
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Created scope: مهندسی مکانیک'))
        
        # 1. Create Design Service (طراحی و مدل‌سازی مهندسی) - No tabs
        design_service, created = Service.objects.get_or_create(
            name='طراحی و مدل‌سازی مهندسی',
            defaults={
                'scope': scope,
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
            self.stdout.write(self.style.SUCCESS('Created service: طراحی و مدل‌سازی مهندسی'))
        
        # Create fields for Design Service (no tabs)
        design_fields = [
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
        
        for field_data in design_fields:
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
                self.stdout.write(self.style.SUCCESS(f'Created design field: {field.name}'))
        
        # 2. Create Analysis & Simulation Service (تحلیل و شبیه‌سازی) - With 3 tabs
        analysis_service, created = Service.objects.get_or_create(
            name='تحلیل و شبیه‌سازی',
            defaults={
                'scope': scope,
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
            self.stdout.write(self.style.SUCCESS('Created service: تحلیل و شبیه‌سازی'))
        
        # Create tabs for Analysis & Simulation Service
        analysis_tabs_data = [
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
        
        created_analysis_tabs = []
        for tab_data in analysis_tabs_data:
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
                created_analysis_tabs.append(tab)
                self.stdout.write(self.style.SUCCESS(f'Created analysis tab: {tab.display_name}'))
        
        # Create fields for Analysis & Simulation Service tabs
        analysis_fields_data = {
            'static_analysis': [
                {
                    'name': 'انتخاب نرم‌افزار',
                    'field_key': 'software_selection',
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
                    'field_key': 'project_files',
                    'type': 'file',
                    'is_required': True,
                    'order': 2,
                    'help_text': 'فایل مدل خود را آپلود کنید (فرمت‌های مجاز: DWG, STEP, STP, IGES, SLDPRT, SLDASM, IPT, IAM)'
                },
                {
                    'name': 'توضیحات تکمیلی',
                    'field_key': 'additional_notes',
                    'type': 'textarea',
                    'is_required': True,
                    'order': 3,
                    'help_text': 'توضیحات کاملی از پروژه خود ارائه دهید'
                }
            ],
            'dynamic_analysis': [
                {
                    'name': 'بارگذاری فایل‌های پروژه',
                    'field_key': 'project_files',
                    'type': 'file',
                    'is_required': True,
                    'order': 1,
                    'help_text': 'فایل مدل خود را آپلود کنید (فرمت‌های مجاز: DWG, STEP, STP, IGES, SLDPRT, SLDASM, IPT, IAM)'
                },
                {
                    'name': 'توضیحات تکمیلی',
                    'field_key': 'additional_notes',
                    'type': 'textarea',
                    'is_required': True,
                    'order': 2,
                    'help_text': 'توضیحات کاملی از پروژه خود ارائه دهید'
                }
            ],
            'coding_solution': [
                {
                    'name': 'انتخاب نرم‌افزار مورد نظر',
                    'field_key': 'software_selection',
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
                    'field_key': 'project_files',
                    'type': 'file',
                    'is_required': False,
                    'order': 2,
                    'help_text': 'فایل‌های پروژه (فرمت‌های مجاز: PDF, DOCX, JPG, JPEG, PNG) - اختیاری'
                },
                {
                    'name': 'توضیحات تکمیلی',
                    'field_key': 'additional_notes',
                    'type': 'textarea',
                    'is_required': True,
                    'order': 3,
                    'help_text': 'توضیحات کاملی از پروژه خود ارائه دهید'
                }
            ]
        }
        
        # Create fields for Analysis & Simulation Service tabs
        for tab in created_analysis_tabs:
            tab_fields = analysis_fields_data.get(tab.name, [])
            for field_data in tab_fields:
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
                        'help_text': field_data.get('help_text', '')
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'Created analysis field: {field.name}'))
        
        # 3. Create Drawing Service (نقشه‌کشی صنعتی) - With 3 tabs
        drawing_service, created = Service.objects.get_or_create(
            name='نقشه‌کشی صنعتی',
            defaults={
                'scope': scope,
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
            self.stdout.write(self.style.SUCCESS('Created service: نقشه‌کشی صنعتی'))
        
        # Create tabs for Drawing Service
        drawing_tabs_data = [
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
        
        created_drawing_tabs = []
        for tab_data in drawing_tabs_data:
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
                created_drawing_tabs.append(tab)
                self.stdout.write(self.style.SUCCESS(f'Created drawing tab: {tab.display_name}'))
        
        # Create fields for Drawing Service tabs
        drawing_fields_data = {
            'welding_drawing': [
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
                    'field_key': 'dimensional_tolerance',
                    'type': 'text',
                    'is_required': False,
                    'order': 4,
                    'help_text': 'انتخاب واحد و مقدار عددی'
                },
                {
                    'name': 'تلرانس‌های هندسی',
                    'field_key': 'geometric_tolerance',
                    'type': 'text',
                    'is_required': False,
                    'order': 5,
                    'help_text': 'انتخاب واحد و مقدار عددی'
                },
                {
                    'name': 'توضیحات تکمیلی',
                    'field_key': 'additional_notes',
                    'type': 'textarea',
                    'is_required': False,
                    'order': 6,
                    'help_text': 'هر توضیح اضافی که لازم است'
                }
            ],
            'exploded_drawing': [
                {
                    'name': 'آپلود فایل مدل',
                    'field_key': 'model_file',
                    'type': 'file',
                    'is_required': True,
                    'order': 1,
                    'help_text': 'فایل مدل سه بعدی خود را ارسال کنید (sldprt, sldasm, ipt, iam, stp)'
                },
                {
                    'name': 'توضیحات تکمیلی',
                    'field_key': 'additional_notes',
                    'type': 'textarea',
                    'is_required': False,
                    'order': 2,
                    'help_text': 'اگر مجموعه شما خود متشکل از مجموعه‌هایی است، در فایل کلی مجموعه به صورت زیر مجموعه‌هایی (assembly) قرار گرفته و در بخش توضیحات نیز این موضوع به تفکیک اسم مجموعه و قطعات ذکر شوند'
                }
            ],
            'manufacturing_drawing': [
                {
                    'name': 'آپلود فایل مدل',
                    'field_key': 'model_file',
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
                    'field_key': 'dimensional_tolerance',
                    'type': 'text',
                    'is_required': False,
                    'order': 7,
                    'help_text': 'انتخاب واحد و مقدار عددی'
                },
                {
                    'name': 'تلرانس‌های هندسی',
                    'field_key': 'geometric_tolerance',
                    'type': 'text',
                    'is_required': False,
                    'order': 8,
                    'help_text': 'انتخاب واحد و مقدار عددی'
                }
            ]
        }
        
        # Create fields for Drawing Service tabs
        for tab in created_drawing_tabs:
            tab_fields = drawing_fields_data.get(tab.name, [])
            for field_data in tab_fields:
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
                    self.stdout.write(self.style.SUCCESS(f'Created drawing field: {field.name}'))
        
        # 4. Create Manufacturing Service (ساخت و تولید) - No tabs
        manufacturing_service, created = Service.objects.get_or_create(
            name='ساخت و تولید',
            defaults={
                'scope': scope,
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
            self.stdout.write(self.style.SUCCESS('Created service: ساخت و تولید'))
        
        # Create fields for Manufacturing Service (no tabs)
        manufacturing_fields = [
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
        
        for field_data in manufacturing_fields:
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
                self.stdout.write(self.style.SUCCESS(f"Created manufacturing field: {field.name}"))
        
        # 5. Create Documentation Service (مستندسازی) - No tabs, 13 fields (12 checkbox + 1 text)
        documentation_service, created = Service.objects.get_or_create(
            name='مستندسازی',
            defaults={
                'scope': scope,
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
            self.stdout.write(self.style.SUCCESS('Created service: مستندسازی'))
        
        # Create fields for Documentation Service (12 checkbox fields + 1 text field)
        documentation_fields = [
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
        
        for field_data in documentation_fields:
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
                self.stdout.write(self.style.SUCCESS(f"Created documentation field: {field.name}"))
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created all services: {design_service.name}, {analysis_service.name}, {drawing_service.name}, {manufacturing_service.name}, and {documentation_service.name}'
            )
        )