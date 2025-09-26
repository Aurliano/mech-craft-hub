from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0015_supportfeedback'),
    ]

    operations = [
        migrations.CreateModel(
            name='BlogPost',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(help_text='عنوان مقاله', max_length=200)),
                ('slug', models.SlugField(help_text='آدرس URL مقاله', max_length=200, unique=True)),
                ('excerpt', models.TextField(help_text='خلاصه مقاله', max_length=500)),
                ('content', models.TextField(help_text='محتوای کامل مقاله')),
                ('category', models.CharField(choices=[('mechatronics', 'مکاترونیک'), ('mechanical', 'مهندسی مکانیک'), ('electronics', 'مهندسی الکترونیک'), ('computer', 'مهندسی کامپیوتر'), ('metaverse', 'متاورس'), ('ai', 'هوش مصنوعی'), ('simulation', 'شبیه\u200cسازی'), ('design', 'طراحی'), ('manufacturing', 'ساخت و تولید'), ('general', 'عمومی')], default='general', max_length=20)),
                ('status', models.CharField(choices=[('draft', 'پیش\u200cنویس'), ('published', 'منتشر شده'), ('archived', 'آرشیو شده')], default='draft', max_length=20)),
                ('meta_description', models.CharField(blank=True, help_text='توضیحات متا برای SEO', max_length=160)),
                ('meta_keywords', models.CharField(blank=True, help_text='کلمات کلیدی برای SEO', max_length=200)),
                ('featured_image', models.URLField(blank=True, help_text='تصویر شاخص مقاله', null=True)),
                ('source_url', models.URLField(blank=True, help_text='لینک منبع اصلی', null=True)),
                ('source_name', models.CharField(blank=True, help_text='نام منبع', max_length=100)),
                ('view_count', models.PositiveIntegerField(default=0)),
                ('like_count', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('published_at', models.DateTimeField(blank=True, null=True)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='blog_posts', to='api.user')),
            ],
            options={
                'verbose_name': 'مقاله وبلاگ',
                'verbose_name_plural': 'مقالات وبلاگ',
                'ordering': ['-published_at', '-created_at'],
            },
        ),
        migrations.CreateModel(
            name='BlogComment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('author_name', models.CharField(help_text='نام نویسنده نظر', max_length=100)),
                ('author_email', models.EmailField(help_text='ایمیل نویسنده نظر')),
                ('content', models.TextField(help_text='متن نظر')),
                ('is_approved', models.BooleanField(default=False, help_text='تایید شده')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='api.blogpost')),
            ],
            options={
                'verbose_name': 'نظر وبلاگ',
                'verbose_name_plural': 'نظرات وبلاگ',
                'ordering': ['-created_at'],
            },
        ),
    ]
