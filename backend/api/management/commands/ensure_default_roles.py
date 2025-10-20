from django.core.management.base import BaseCommand
from api.models import Role


class Command(BaseCommand):
    help = 'Ensure default roles exist (admin, customer, contractor)'

    def handle(self, *args, **options):
        defaults = [
            {
                'name': 'admin',
                'display_name': 'مدیر',
                'description': 'کاربران با دسترسی مدیریتی کامل',
            },
            {
                'name': 'customer',
                'display_name': 'مشتری',
                'description': 'کاربران سفارش‌دهنده خدمات',
            },
            {
                'name': 'contractor',
                'display_name': 'پیمانکار',
                'description': 'پیمانکاران ارائه‌دهنده خدمات',
            },
        ]

        for d in defaults:
            role, created = Role.objects.get_or_create(name=d['name'], defaults={
                'display_name': d['display_name'],
                'description': d['description'],
            })
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created role: {d['name']}"))
            else:
                self.stdout.write(f"Role exists: {d['name']}")

        self.stdout.write(self.style.SUCCESS('Default roles ensured.'))


