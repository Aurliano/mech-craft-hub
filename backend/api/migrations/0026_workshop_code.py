# Generated manually for workshop code field

from django.db import migrations, models
import random


def generate_workshop_codes(apps, schema_editor):
    """Generate codes for existing workshops"""
    Workshop = apps.get_model('api', 'Workshop')
    used_codes = set()
    
    for workshop in Workshop.objects.all():
        if not workshop.code:
            # Generate unique code
            max_attempts = 100
            for _ in range(max_attempts):
                code = f"WS{random.randint(100000, 999999)}"
                if code not in used_codes and not Workshop.objects.filter(code=code).exists():
                    used_codes.add(code)
                    workshop.code = code
                    workshop.save(update_fields=['code'])
                    break
            else:
                # Fallback: use UUID if random generation fails
                from uuid import uuid4
                workshop.code = f"WS{uuid4().hex[:6].upper()}"
                workshop.save(update_fields=['code'])


def reverse_generate_codes(apps, schema_editor):
    """Reverse operation - not needed but good practice"""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0025_add_workforce_models'),
    ]

    operations = [
        migrations.AddField(
            model_name='workshop',
            name='code',
            field=models.CharField(blank=True, max_length=10, null=True, unique=False, editable=False),
        ),
        migrations.RunPython(generate_workshop_codes, reverse_generate_codes),
        migrations.AlterField(
            model_name='workshop',
            name='code',
            field=models.CharField(max_length=10, unique=True, editable=False),
        ),
    ]
