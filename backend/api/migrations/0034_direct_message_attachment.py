# Generated manually for direct message attachments

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0033_add_user_organization_resume'),
    ]

    operations = [
        migrations.CreateModel(
            name='DirectMessageAttachment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('file_path', models.CharField(max_length=500)),
                ('file_name', models.CharField(max_length=255)),
                ('content_type', models.CharField(max_length=100)),
                ('file_size', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('message', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attachments', to='api.directmessage')),
            ],
            options={
                'db_table': 'direct_message_attachments',
                'ordering': ['created_at'],
            },
        ),
    ]
