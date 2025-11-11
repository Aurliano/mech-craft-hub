from django.core.management.base import BaseCommand
from api.models import Scope, Service
from django.utils.text import slugify


class Command(BaseCommand):
    help = 'Update scopes and services based on Hero.tsx structure'

    def handle(self, *args, **options):
        self.stdout.write('Updating scopes and services...')
        
        # Define scopes and their services based on Hero.tsx
        scopes_data = {
            'mechanical': {
                'name': 'mechanical_engineering',
                'display_name': 'مهندسی مکانیک',
                'description': 'خدمات مهندسی مکانیک و طراحی صنعتی',
                'services': [
                    {'name': 'طراحی و مدل‌سازی', 'type': 'design'},
                    {'name': 'تحلیل و شبیه‌سازی', 'type': 'analysis'},
                    {'name': 'نقشه‌کشی صنعتی', 'type': 'drawing'},
                    {'name': 'ساخت و تولید', 'type': 'manufacturing'},
                ]
            },
            'computer': {
                'name': 'computer_engineering',
                'display_name': 'مهندسی کامپیوتر',
                'description': 'خدمات مهندسی کامپیوتر و نرم‌افزار',
                'services': [
                    {'name': 'طراحی وب', 'type': 'design'},
                    {'name': 'هوش مصنوعی و علم داده', 'type': 'analysis'},
                    {'name': 'برنامه نویسی', 'type': 'design'},
                    {'name': 'طراحی اپلیکیشن موبایل', 'type': 'design'},
                ]
            },
            'electrical': {
                'name': 'electrical_engineering',
                'display_name': 'مهندسی الکترونیک',
                'description': 'خدمات مهندسی برق و الکترونیک',
                'services': [
                    {'name': 'طراحی سخت‌افزار با FPGA', 'type': 'design'},
                    {'name': 'سیستم‌های کنترل', 'type': 'analysis'},
                    {'name': 'نقشه‌کشی مدارات فرمان و قدرت', 'type': 'drawing'},
                    {'name': 'اتوماسیون صنعتی', 'type': 'manufacturing'},
                ]
            },
            'metaverse': {
                'name': 'metaverse',
                'display_name': 'متاورس',
                'description': 'خدمات متاورس، VR، AR و گرافیک',
                'services': [
                    {'name': 'VR', 'type': 'design'},
                    {'name': 'AR', 'type': 'design'},
                    {'name': 'واقعیت ترکیبی', 'type': 'design'},
                    {'name': 'انیمیشن و گرافیک', 'type': 'design'},
                ]
            },
        }
        
        # Create or update scopes and services
        for scope_key, scope_data in scopes_data.items():
            scope, created = Scope.objects.get_or_create(
                name=scope_data['name'],
                defaults={
                    'display_name': scope_data['display_name'],
                    'description': scope_data['description'],
                    'is_active': True
                }
            )
            
            if not created:
                # Update existing scope
                scope.display_name = scope_data['display_name']
                scope.description = scope_data['description']
                scope.is_active = True
                scope.save()
                self.stdout.write(self.style.SUCCESS(f'Updated scope: {scope.display_name}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Created scope: {scope.display_name}'))
            
            # Create or update services for this scope
            for service_data in scope_data['services']:
                service, service_created = Service.objects.get_or_create(
                    scope=scope,
                    name=service_data['name'],
                    type=service_data['type'],
                    defaults={
                        'description': f'{service_data["name"]} در حوزه {scope.display_name}',
                        'is_active': True,
                        'has_tabs': False,
                        'supports_documentation': False
                    }
                )
                
                if not service_created:
                    # Update existing service
                    service.description = f'{service_data["name"]} در حوزه {scope.display_name}'
                    service.is_active = True
                    service.save()
                    self.stdout.write(self.style.SUCCESS(f'  Updated service: {service.name}'))
                else:
                    self.stdout.write(self.style.SUCCESS(f'  Created service: {service.name}'))
        
        self.stdout.write(self.style.SUCCESS('Successfully updated all scopes and services!'))

