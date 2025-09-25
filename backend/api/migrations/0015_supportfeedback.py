# Generated manually for SupportFeedback model

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0014_hcaptchaattempt'),
    ]

    operations = [
        migrations.CreateModel(
            name='SupportFeedback',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('used_services', models.BooleanField(blank=True, help_text='آیا از خدمات و محتوای سایت استفاده کردید؟', null=True)),
                ('satisfaction_rating', models.IntegerField(blank=True, choices=[(0, 'خیلی ضعیف'), (1, 'ضعیف'), (2, 'متوسط'), (3, 'خوب'), (4, 'خیلی خوب'), (5, 'عالی')], help_text='تا چه میزان از کیفیت سایت رضایت دارید؟', null=True)),
                ('personal_feedback', models.TextField(blank=True, help_text='نظر شخصی شما راجع به رابط کاربری و محتوای سایت چیست؟', null=True)),
                ('ai_response', models.TextField(blank=True, help_text='پاسخ هوش مصنوعی', null=True)),
                ('ai_model_used', models.CharField(blank=True, help_text='مدل AI استفاده شده', max_length=100, null=True)),
                ('ai_prompt_tokens', models.IntegerField(blank=True, help_text='تعداد توکن\u200cهای پرسپت', null=True)),
                ('ai_response_tokens', models.IntegerField(blank=True, help_text='تعداد توکن\u200cهای پاسخ', null=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.TextField(blank=True, null=True)),
                ('session_id', models.CharField(blank=True, max_length=100, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='support_feedbacks', to='api.user')),
            ],
            options={
                'verbose_name': 'بازخورد پشتیبانی',
                'verbose_name_plural': 'بازخوردهای پشتیبانی',
                'ordering': ['-created_at'],
            },
        ),
    ]
