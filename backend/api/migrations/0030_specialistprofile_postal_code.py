from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0029_add_job_seeker_hire_request'),
    ]

    operations = [
        migrations.AddField(
            model_name='specialistprofile',
            name='postal_code',
            field=models.CharField(blank=True, help_text='کد پستی', max_length=20),
        ),
    ]

