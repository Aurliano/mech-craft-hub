# Generated migration for Turnstile support

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_service_has_tabs'),
    ]

    operations = [
        migrations.CreateModel(
            name='TurnstileAttempt',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('ip', models.GenericIPAddressField(blank=True, null=True)),
                ('endpoint', models.CharField(max_length=255)),
                ('success', models.BooleanField()),
                ('response_raw', models.JSONField(blank=True, null=True)),
                ('token_hash', models.CharField(db_index=True, max_length=64)),
                ('error_message', models.TextField(blank=True, null=True)),
                ('user_agent', models.TextField(blank=True, null=True)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='turnstile_attempts', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'turnstile_attempts',
                'ordering': ['-created_at'],
                'indexes': [
                    models.Index(fields=['created_at'], name='turnstile_at_created_idx'), 
                    models.Index(fields=['ip'], name='turnstile_at_ip_idx'), 
                    models.Index(fields=['success'], name='turnstile_at_success_idx'), 
                    models.Index(fields=['endpoint'], name='turnstile_at_endpoint_idx')
                ],
            },
        ),
    ]