# Generated manually for user profile enhancement

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0032_add_conversation_direct_message'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='organization',
            field=models.CharField(blank=True, help_text='سازمان یا شرکت (برای مشتریان)', max_length=200),
        ),
        migrations.AddField(
            model_name='user',
            name='resume_file',
            field=models.CharField(blank=True, help_text='مسیر فایل رزومه', max_length=500),
        ),
    ]
