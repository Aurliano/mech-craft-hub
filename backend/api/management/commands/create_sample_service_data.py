from django.core.management.base import BaseCommand
from api.models import Scope, Service, ServiceTab, ServiceField
import uuid


class Command(BaseCommand):
    help = 'Create service data for Design and Drawing services'

    def handle(self, *args, **options):
        # Create scope if not exists
        scope, created = Scope.objects.get_or_create(
            name='مهندسی مکانیک',
            defaults={'description': 'خدمات مهندسی مکانیک و طراحی صنعتی'}
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Created scope: مهندسی مکانیک'))
        
        # Create Design Service (no tabs)
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
        
        # Create Drawing Service (with tabs)
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
        
        # Create tabs for Drawing Service
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
                self.stdout.write(self.style.SUCCESS(f'Created tab: {tab.display_name}'))
        
        # Create fields for each tab
        fields_data = {
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
        
        for tab in created_tabs:
            tab_fields = fields_data.get(tab.name, [])
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
                    self.stdout.write(self.style.SUCCESS(f'Created field: {field.name}'))
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created services: {design_service.name} and {drawing_service.name}'
            )
        )
