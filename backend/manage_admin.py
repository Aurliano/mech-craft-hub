#!/usr/bin/env python
"""
اسکریپت مدیریت کاربر ادمین
برای ایجاد یا تغییر رمز عبور کاربر ادمین در محیط production
"""

import os
import sys
import django

# تنظیم متغیرهای محیطی
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# راه‌اندازی Django
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_or_update_admin():
    """ایجاد یا به‌روزرسانی کاربر ادمین"""
    
    username = 'admin'
    password = 'SaydaTech2024!'  # رمز قوی برای production
    email = 'admin@saydatech.ir'
    
    try:
        # بررسی وجود کاربر
        user = User.objects.get(username=username)
        print(f"✅ کاربر '{username}' موجود است. در حال به‌روزرسانی رمز عبور...")
        
        # به‌روزرسانی اطلاعات
        user.set_password(password)
        user.email = email
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save()
        
        print(f"✅ رمز عبور کاربر '{username}' به‌روزرسانی شد")
        
    except User.DoesNotExist:
        # ایجاد کاربر جدید
        print(f"🆕 ایجاد کاربر ادمین جدید...")
        
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        
        print(f"✅ کاربر ادمین '{username}' ایجاد شد")
    
    print("\n" + "="*50)
    print("📋 اطلاعات ورود به پنل ادمین:")
    print("="*50)
    print(f"🌐 آدرس پنل: https://saydatech.ir/admin/")
    print(f"👤 نام کاربری: {username}")
    print(f"🔑 رمز عبور: {password}")
    print(f"📧 ایمیل: {email}")
    print("="*50)
    print("⚠️  لطفاً این اطلاعات را در جای امنی ذخیره کنید!")
    print("="*50)

def list_admin_users():
    """نمایش لیست کاربران ادمین"""
    admin_users = User.objects.filter(is_superuser=True)
    
    print("\n📋 لیست کاربران ادمین:")
    print("-" * 40)
    
    for user in admin_users:
        status = "فعال" if user.is_active else "غیرفعال"
        print(f"👤 {user.username} ({user.email}) - {status}")
    
    print("-" * 40)

if __name__ == "__main__":
    print("🔧 مدیریت کاربر ادمین")
    print("=" * 30)
    
    if len(sys.argv) > 1 and sys.argv[1] == "list":
        list_admin_users()
    else:
        create_or_update_admin()
