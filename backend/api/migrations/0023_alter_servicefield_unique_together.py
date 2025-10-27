# Generated manually to fix unique_together constraint

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0022_materialestimation'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='servicefield',
            unique_together={('service', 'tab', 'field_key')},
        ),
    ]

