# Generated manually for user-to-user messaging

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0031_orderproposal_documentation_days_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Conversation',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'conversations',
                'ordering': ['-updated_at'],
            },
        ),
        migrations.CreateModel(
            name='ConversationParticipant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('joined_at', models.DateTimeField(auto_now_add=True)),
                ('conversation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='participant_links', to='api.conversation')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='conversation_participations', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'conversation_participants',
                'unique_together': {('conversation', 'user')},
            },
        ),
        migrations.CreateModel(
            name='DirectMessage',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('content', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_read', models.BooleanField(default=False)),
                ('conversation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='api.conversation')),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_direct_messages', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'direct_messages',
                'ordering': ['created_at'],
            },
        ),
        migrations.AddField(
            model_name='conversation',
            name='participants',
            field=models.ManyToManyField(related_name='conversations', through='api.ConversationParticipant', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddIndex(
            model_name='directmessage',
            index=models.Index(fields=['conversation'], name='dm_conv_idx'),
        ),
        migrations.AddIndex(
            model_name='directmessage',
            index=models.Index(fields=['sender'], name='dm_sender_idx'),
        ),
        migrations.AddIndex(
            model_name='directmessage',
            index=models.Index(fields=['created_at'], name='dm_created_idx'),
        ),
        migrations.AddIndex(
            model_name='conversation',
            index=models.Index(fields=['updated_at'], name='conv_updated_idx'),
        ),
    ]
