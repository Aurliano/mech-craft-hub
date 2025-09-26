#!/usr/bin/env python
"""
Script to create sample blog posts via API calls
"""

import requests
import json
import time

# API base URL
BASE_URL = "https://mech-craft-hub-main.liara.run/api/v1"

# Sample posts data
posts_data = [
    {
        'title': 'کاربردهای نوین مکاترونیک در رباتیک صنعتی',
        'slug': 'mechatronics-industrial-robotics',
        'excerpt': 'بررسی آخرین پیشرفت‌ها در زمینه مکاترونیک و کاربرد آن در رباتیک صنعتی',
        'content': '''مکاترونیک ترکیبی از مهندسی مکانیک، الکترونیک و کامپیوتر است که در سال‌های اخیر تحولات شگرفی در صنعت رباتیک ایجاد کرده است.

## پیشرفت‌های کلیدی در مکاترونیک

### 1. سیستم‌های کنترل پیشرفته
- کنترلرهای PID هوشمند
- الگوریتم‌های یادگیری ماشین
- سیستم‌های کنترل تطبیقی

### 2. سنسورهای پیشرفته
- سنسورهای LiDAR برای ناوبری
- دوربین‌های سه‌بعدی برای تشخیص اشیاء
- سنسورهای لمسی با حساسیت بالا

### 3. محرک‌های الکترومکانیکی
- موتورهای سروو با دقت بالا
- محرک‌های پنوماتیک هوشمند
- سیستم‌های هیدرولیک کنترل شده

## کاربردهای عملی

### رباتیک صنعتی
- جوشکاری خودکار
- مونتاژ قطعات
- کنترل کیفیت محصولات

### رباتیک خدماتی
- ربات‌های تمیزکاری
- ربات‌های تحویل
- ربات‌های پزشکی

## آینده مکاترونیک

با پیشرفت فناوری‌های هوش مصنوعی و اینترنت اشیاء، انتظار می‌رود که مکاترونیک در آینده نقش کلیدی‌تری در خودکارسازی صنایع ایفا کند.

### چالش‌های پیش رو
- هزینه بالای پیاده‌سازی
- نیاز به نیروی متخصص
- مسائل امنیتی و حریم خصوصی

### فرصت‌های پیش رو
- افزایش بهره‌وری
- کاهش خطای انسانی
- بهبود کیفیت محصولات''',
        'category': 'mechatronics',
        'status': 'published',
        'source_name': 'IEEE Spectrum',
        'source_url': 'https://spectrum.ieee.org/',
        'meta_description': 'بررسی کاربردهای نوین مکاترونیک در رباتیک صنعتی و پیشرفت‌های فناوری',
        'meta_keywords': 'مکاترونیک, رباتیک, صنعت, هوش مصنوعی, خودکارسازی'
    },
    {
        'title': 'ترندهای شبیه‌سازی مهندسی: Digital Twin و CFD',
        'slug': 'engineering-simulation-trends-digital-twin-cfd',
        'excerpt': 'بررسی آخرین ترندها در زمینه شبیه‌سازی مهندسی با تمرکز بر Digital Twin و تحلیل CFD',
        'content': '''شبیه‌سازی مهندسی در سال‌های اخیر با ظهور فناوری‌های جدید مانند Digital Twin و پیشرفت‌های CFD تحولات بزرگی داشته است.

## Digital Twin: آینده شبیه‌سازی

### تعریف Digital Twin
Digital Twin یک کپی دیجیتال دقیق از یک سیستم فیزیکی است که با استفاده از داده‌های real-time به‌روزرسانی می‌شود.

### مزایای Digital Twin
- پیش‌بینی خرابی‌ها
- بهینه‌سازی عملکرد
- کاهش هزینه‌های نگهداری
- بهبود تصمیم‌گیری

### کاربردهای عملی
- موتورهای جت هواپیما
- توربین‌های بادی
- سیستم‌های تولید خودرو
- ساختمان‌های هوشمند

## تحلیل CFD پیشرفته

### پیشرفت‌های محاسباتی
- پردازش موازی GPU
- الگوریتم‌های یادگیری ماشین
- شبیه‌سازی ابری (Cloud Computing)

### کاربردهای جدید CFD
- طراحی خودروهای الکتریکی
- بهینه‌سازی سیستم‌های تهویه
- تحلیل آیرودینامیک هواپیماها
- شبیه‌سازی جریان خون در پزشکی

## چالش‌ها و راه‌حل‌ها

### چالش‌های فنی
- پیچیدگی محاسباتی
- نیاز به داده‌های دقیق
- هزینه‌های بالای نرم‌افزار

### راه‌حل‌های پیشنهادی
- استفاده از هوش مصنوعی
- بهینه‌سازی الگوریتم‌ها
- مدل‌سازی ساده‌تر

## آینده شبیه‌سازی مهندسی

با پیشرفت فناوری‌های محاسباتی و هوش مصنوعی، انتظار می‌رود که شبیه‌سازی مهندسی در آینده دقیق‌تر و سریع‌تر شود.''',
        'category': 'simulation',
        'status': 'published',
        'source_name': 'Siemens Blog',
        'source_url': 'https://blogs.sw.siemens.com/',
        'meta_description': 'بررسی ترندهای شبیه‌سازی مهندسی با تمرکز بر Digital Twin و تحلیل CFD',
        'meta_keywords': 'شبیه‌سازی, Digital Twin, CFD, مهندسی, تحلیل'
    },
    {
        'title': 'هوش مصنوعی در کنترل و بینایی ماشین',
        'slug': 'artificial-intelligence-control-machine-vision',
        'excerpt': 'بررسی کاربردهای هوش مصنوعی در سیستم‌های کنترل و بینایی ماشین در صنعت',
        'content': '''هوش مصنوعی در سال‌های اخیر تحولات بزرگی در سیستم‌های کنترل و بینایی ماشین ایجاد کرده است.

## هوش مصنوعی در سیستم‌های کنترل

### کنترل تطبیقی
- الگوریتم‌های یادگیری تقویتی
- کنترل پیش‌بینانه مدل
- سیستم‌های کنترل فازی

### مزایای کنترل هوشمند
- بهبود دقت کنترل
- کاهش مصرف انرژی
- افزایش پایداری سیستم

## بینایی ماشین پیشرفته

### الگوریتم‌های تشخیص اشیاء
- YOLO (You Only Look Once)
- R-CNN و Fast R-CNN
- SSD (Single Shot Detector)

### کاربردهای عملی
- کنترل کیفیت محصولات
- ناوبری خودکار ربات‌ها
- تشخیص عیوب در تولید
- طبقه‌بندی محصولات

## یادگیری عمیق در کنترل

### شبکه‌های عصبی
- شبکه‌های عصبی بازگشتی (RNN)
- شبکه‌های عصبی کانولوشنی (CNN)
- شبکه‌های عصبی عمیق (DNN)

### الگوریتم‌های بهینه‌سازی
- الگوریتم ژنتیک
- بهینه‌سازی ازدحام ذرات
- الگوریتم کلونی مورچه‌ها

## چالش‌ها و محدودیت‌ها

### چالش‌های فنی
- نیاز به داده‌های آموزشی زیاد
- پیچیدگی پیاده‌سازی
- نیاز به سخت‌افزار قدرتمند

### راه‌حل‌های پیشنهادی
- استفاده از Transfer Learning
- بهینه‌سازی مدل‌ها
- استفاده از Edge Computing

## آینده هوش مصنوعی در کنترل

با پیشرفت فناوری‌های محاسباتی، انتظار می‌رود که هوش مصنوعی نقش کلیدی‌تری در سیستم‌های کنترل ایفا کند.''',
        'category': 'ai',
        'status': 'published',
        'source_name': 'Google Scholar',
        'source_url': 'https://scholar.google.com/',
        'meta_description': 'بررسی کاربردهای هوش مصنوعی در سیستم‌های کنترل و بینایی ماشین',
        'meta_keywords': 'هوش مصنوعی, کنترل, بینایی ماشین, یادگیری عمیق, صنعت'
    },
    {
        'title': 'پر جستجوترین پرسش‌ها درباره نقشه‌کشی صنعتی',
        'slug': 'most-searched-questions-industrial-drawing',
        'excerpt': 'پاسخ به پر جستجوترین سوالات کاربران درباره نقشه‌کشی صنعتی و استانداردهای آن',
        'content': '''نقشه‌کشی صنعتی یکی از مهم‌ترین مهارت‌های مهندسی است که سوالات زیادی در ذهن مهندسان ایجاد می‌کند.

## سوالات متداول درباره نقشه‌کشی

### 1. استانداردهای نقشه‌کشی
**سوال:** کدام استاندارد برای نقشه‌کشی صنعتی استفاده می‌شود؟

**پاسخ:** استانداردهای مختلفی وجود دارد:
- ISO 128 (نمایش هندسی)
- ISO 129 (ابعاد و تلرانس‌ها)
- ISO 1101 (تلرانس‌های هندسی)
- ASME Y14.5 (استاندارد آمریکایی)

### 2. نرم‌افزارهای نقشه‌کشی
**سوال:** بهترین نرم‌افزار برای نقشه‌کشی چیست؟

**پاسخ:** انتخاب نرم‌افزار بستگی به نیاز دارد:
- AutoCAD (برای نقشه‌کشی 2D)
- SolidWorks (برای مدل‌سازی 3D)
- Inventor (برای طراحی مکانیکی)
- CATIA (برای طراحی پیشرفته)

### 3. تلرانس‌های هندسی
**سوال:** چگونه تلرانس‌های هندسی را تعریف کنیم؟

**پاسخ:** تلرانس‌های هندسی شامل:
- تلرانس موقعیت (Position Tolerance)
- تلرانس شکل (Form Tolerance)
- تلرانس جهت (Orientation Tolerance)
- تلرانس حرکت (Runout Tolerance)

## نکات مهم در نقشه‌کشی

### اصول کلی
- وضوح و خوانایی نقشه
- استفاده از خطوط استاندارد
- قرارگیری صحیح ابعاد
- استفاده از نمادهای استاندارد

### خطاهای رایج
- ابعاد تکراری
- خطوط اضافی
- نمادهای نادرست
- عدم رعایت مقیاس

## آینده نقشه‌کشی صنعتی

### فناوری‌های جدید
- نقشه‌کشی سه‌بعدی
- واقعیت مجازی در طراحی
- هوش مصنوعی در نقشه‌کشی
- مدل‌سازی پارامتریک

### چالش‌های پیش رو
- نیاز به مهارت‌های جدید
- هزینه‌های بالای نرم‌افزار
- پیچیدگی فناوری‌های جدید

## منابع یادگیری

### کتاب‌های مفید
- "Engineering Drawing" - N.D. Bhatt
- "Technical Drawing" - F.E. Giesecke
- "Engineering Graphics" - V.R. Lakshmi

### دوره‌های آنلاین
- Coursera
- Udemy
- LinkedIn Learning

## نتیجه‌گیری

نقشه‌کشی صنعتی مهارتی است که نیاز به تمرین مداوم و به‌روزرسانی دانش دارد. با پیشرفت فناوری، روش‌های نقشه‌کشی نیز در حال تغییر است.''',
        'category': 'design',
        'status': 'published',
        'source_name': 'Google Trends',
        'source_url': 'https://trends.google.com/',
        'meta_description': 'پاسخ به پر جستجوترین سوالات درباره نقشه‌کشی صنعتی و استانداردهای آن',
        'meta_keywords': 'نقشه‌کشی, صنعتی, استاندارد, تلرانس, مهندسی'
    }
]

def create_blog_posts():
    """Create blog posts via API"""
    print("Creating sample blog posts...")
    
    created_count = 0
    for post_data in posts_data:
        try:
            # First, try to get existing posts to check if already exists
            response = requests.get(f"{BASE_URL}/blog/posts/")
            if response.status_code == 200:
                existing_posts = response.json()
                if 'results' in existing_posts:
                    existing_slugs = [post['slug'] for post in existing_posts['results']]
                    if post_data['slug'] in existing_slugs:
                        print(f"Post already exists: {post_data['title']}")
                        continue
            
            # Create the post
            response = requests.post(
                f"{BASE_URL}/admin/blog/posts/create/",
                json=post_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 201:
                print(f"✅ Created post: {post_data['title']}")
                created_count += 1
            else:
                print(f"❌ Failed to create post: {post_data['title']}")
                print(f"Status: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Error creating post {post_data['title']}: {str(e)}")
        
        # Small delay between requests
        time.sleep(1)
    
    print(f"\n📊 Summary:")
    print(f"Total posts created: {created_count}")
    print(f"Total posts attempted: {len(posts_data)}")
    
    # Check final count
    try:
        response = requests.get(f"{BASE_URL}/blog/posts/")
        if response.status_code == 200:
            data = response.json()
            if 'results' in data:
                print(f"Total posts in database: {len(data['results'])}")
    except Exception as e:
        print(f"Error checking final count: {str(e)}")

if __name__ == '__main__':
    create_blog_posts()
