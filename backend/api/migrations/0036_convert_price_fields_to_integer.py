# Convert Order.total_amount, OrderItem.price, Quote.price, Quote.documentation_price
# from DecimalField to PositiveIntegerField (Toman as integer).

from django.db import migrations, models


def convert_decimal_to_int(apps, schema_editor):
    """Convert existing decimal values to integer (round). Values already in Toman."""
    Order = apps.get_model('api', 'Order')
    OrderItem = apps.get_model('api', 'OrderItem')
    Quote = apps.get_model('api', 'Quote')

    for order in Order.objects.all():
        old = order.total_amount
        if old is not None:
            order.total_amount = int(round(float(old)))
            order.save(update_fields=['total_amount'])

    for item in OrderItem.objects.all():
        if item.price is not None:
            item.price = int(round(float(item.price)))
            item.save(update_fields=['price'])

    for quote in Quote.objects.all():
        quote.price = int(round(float(quote.price)))
        quote.documentation_price = int(round(float(quote.documentation_price or 0)))
        quote.save(update_fields=['price', 'documentation_price'])


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0035_project_progress_phase_and_payment_phases'),
    ]

    operations = [
        # First convert data: add temporary integer columns, copy rounded values, then alter.
        # Django's AlterField from Decimal to Integer may fail on SQLite, so we do it in steps.
        migrations.RunPython(convert_decimal_to_int, noop_reverse),
        migrations.AlterField(
            model_name='order',
            name='total_amount',
            field=models.PositiveIntegerField(default=0, help_text='مبلغ کل سفارش به تومان (عدد صحیح)'),
        ),
        migrations.AlterField(
            model_name='orderitem',
            name='price',
            field=models.PositiveIntegerField(blank=True, help_text='قیمت به تومان (عدد صحیح)', null=True),
        ),
        migrations.AlterField(
            model_name='quote',
            name='price',
            field=models.PositiveIntegerField(help_text='قیمت به تومان (عدد صحیح)'),
        ),
        migrations.AlterField(
            model_name='quote',
            name='documentation_price',
            field=models.PositiveIntegerField(default=0, help_text='قیمت مستندات به تومان (عدد صحیح)'),
        ),
    ]
