from django.core.management.base import BaseCommand
from api.models import Scope, Service, ServiceTab, ServiceField
import uuid


class Command(BaseCommand):
    help = 'Create sample service data for testing dynamic forms'

    def handle(self, *args, **options):
        # Create scope if not exists
        scope, created = Scope.objects.get_or_create(
            name='مهندسی مکانیک',
            defaults={'description': 'خدمات مهندسی مکانیک و طراحی صنعتی'}
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Created scope: مهندسی مکانیک'))
        
        # Create service if not exists
        service, created = Service.objects.get_or_create(
            name='نقشه‌کشی صنعتی',
            defaults={
                'scope': scope,
                'type': 'design',
                'description': 'خدمات نقشه‌کشی و طراحی صنعتی',
                'base_price': 500000,
                'estimated_delivery_days': 7,
                'supports_documentation': True,
                'has_tabs': True,
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Created service: نقشه‌کشی صنعتی'))
        
        # Create service tabs
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
                'description': 'طراحی نقشه‌های ساخت و تولید',
                'order': 3
            }
        ]
        
        created_tabs = []
        for tab_data in tabs_data:
            tab, created = ServiceTab.objects.get_or_create(
                service=service,
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
        
        # Create service fields for each tab
        fields_data = {
            'welding_drawing': [
                {
                    'name': 'نوع جوش',
                    'field_key': 'weld_type',
                    'type': 'select',
                    'options': [
                        {'value': 'butt', 'label': 'جوش لب به لب'},
                        {'value': 'fillet', 'label': 'جوش گوشه'},
                        {'value': 'plug', 'label': 'جوش سوراخی'}
                    ],
                    'is_required': True,
                    'order': 1,
                    'help_text': 'نوع جوش مورد نیاز را انتخاب کنید'
                },
                {
                    'name': 'ضخامت ورق',
                    'field_key': 'sheet_thickness',
                    'type': 'number',
                    'is_required': True,
                    'order': 2,
                    'help_text': 'ضخامت ورق به میلی‌متر'
                },
                {
                    'name': 'فایل نقشه',
                    'field_key': 'drawing_file',
                    'type': 'file',
                    'is_required': True,
                    'order': 3,
                    'help_text': 'فایل نقشه اولیه را آپلود کنید'
                }
            ],
            'exploded_drawing': [
                {
                    'name': 'تعداد قطعات',
                    'field_key': 'part_count',
                    'type': 'number',
                    'is_required': True,
                    'order': 1,
                    'help_text': 'تعداد کل قطعات محصول'
                },
                {
                    'name': 'مقیاس نقشه',
                    'field_key': 'drawing_scale',
                    'type': 'select',
                    'options': [
                        {'value': '1:1', 'label': '1:1'},
                        {'value': '1:2', 'label': '1:2'},
                        {'value': '1:5', 'label': '1:5'},
                        {'value': '1:10', 'label': '1:10'}
                    ],
                    'is_required': True,
                    'order': 2
                },
                {
                    'name': 'توضیحات اضافی',
                    'field_key': 'additional_notes',
                    'type': 'textarea',
                    'is_required': False,
                    'order': 3,
                    'help_text': 'هر توضیح اضافی که لازم است'
                }
            ],
            'manufacturing_drawing': [
                {
                    'name': 'روش تولید',
                    'field_key': 'manufacturing_method',
                    'type': 'multiselect',
                    'options': [
                        {'value': 'machining', 'label': 'ماشینکاری'},
                        {'value': 'casting', 'label': 'ریخته‌گری'},
                        {'value': 'forging', 'label': 'آهنگری'},
                        {'value': 'welding', 'label': 'جوشکاری'}
                    ],
                    'is_required': True,
                    'order': 1
                },
                {
                    'name': 'تلرانس ابعادی',
                    'field_key': 'dimensional_tolerance',
                    'type': 'text',
                    'is_required': True,
                    'order': 2,
                    'help_text': 'مثال: ±0.1mm'
                },
                {
                    'name': 'تاریخ تحویل مورد نظر',
                    'field_key': 'desired_delivery_date',
                    'type': 'date',
                    'is_required': False,
                    'order': 3
                }
            ]
        }
        
        for tab in created_tabs:
            tab_fields = fields_data.get(tab.name, [])
            for field_data in tab_fields:
                field, created = ServiceField.objects.get_or_create(
                    service=service,
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
        
        # Create some general fields for the service (without tab)
        general_fields = [
            {
                'name': 'نام پروژه',
                'field_key': 'project_name',
                'type': 'text',
                'is_required': True,
                'order': 1,
                'help_text': 'نام پروژه یا محصول'
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
                'order': 2
            }
        ]
        
        for field_data in general_fields:
            field, created = ServiceField.objects.get_or_create(
                service=service,
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
                self.stdout.write(self.style.SUCCESS(f'Created general field: {field.name}'))
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created sample data for service: {service.name}'
            )
        )
