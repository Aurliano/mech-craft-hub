# Generated for 4-phase payment (25% each) and project progress

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0034_direct_message_attachment'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='project_progress_phase',
            field=models.PositiveSmallIntegerField(
                default=0,
                help_text='پیشرفت پروژه: 0=شروع نشده، 1-4=مراحل پرداخت انجام شده (قابل ویرایش توسط ادمین)'
            ),
        ),
        migrations.AlterField(
            model_name='payment',
            name='payment_type',
            field=models.CharField(
                choices=[
                    ('material', 'پرداخت متریال'),
                    ('project_advance', 'پیش پرداخت پروژه'),
                    ('project_final', 'تسویه حساب پروژه'),
                    ('project_phase_1', 'مرحله ۱ (۲۵٪)'),
                    ('project_phase_2', 'مرحله ۲ (۲۵٪)'),
                    ('project_phase_3', 'مرحله ۳ (۲۵٪)'),
                    ('project_phase_4', 'مرحله ۴ (۲۵٪)'),
                    ('shipping', 'هزینه ارسال'),
                ],
                default='project_advance',
                max_length=20
            ),
        ),
    ]
