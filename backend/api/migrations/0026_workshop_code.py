# Generated manually for workshop code field

from django.db import migrations, models
import random


def generate_workshop_codes(apps, schema_editor):
    """Generate codes for existing workshops"""
    Workshop = apps.get_model('api', 'Workshop')
    for workshop in Workshop.objects.all():
        if not workshop.code:
            code = f"WS{random.randint(100000, 999999)}"
            # Ensure uniqueness
            while Workshop.objects.filter(code=code).exists():
                code = f"WS{random.randint(100000, 999999)}"
            workshop.code = code
            workshop.save()


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
        migrations.RunPython(generate_workshop_codes),
        migrations.AlterField(
            model_name='workshop',
            name='code',
            field=models.CharField(max_length=10, unique=True, editable=False, blank=False),
        ),
    ]

