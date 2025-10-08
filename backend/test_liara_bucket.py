#!/usr/bin/env python3
"""
اسکریپت تست اتصال به باکت لیارا
این اسکریپت برای تست کردن اتصال و عملکرد باکت لیارا استفاده می‌شود
"""

import os
import sys
import django
from pathlib import Path

# اضافه کردن مسیر پروژه
sys.path.insert(0, str(Path(__file__).parent))

# تنظیم Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

import boto3
from botocore.exceptions import ClientError
from api.file_manager import file_manager

def test_liara_connection():
    """تست اتصال به باکت لیارا"""
    print("🔍 تست اتصال به باکت لیارا...")
    
    try:
        # تست اتصال مستقیم
        s3_client = boto3.client(
            's3',
            endpoint_url=os.getenv('LIARA_ENDPOINT_URL', 'https://storage.c2.liara.space'),
            aws_access_key_id=os.getenv('LIARA_ACCESS_KEY'),
            aws_secret_access_key=os.getenv('LIARA_SECRET_KEY'),
            region_name='iran'
        )
        
        bucket_name = os.getenv('FILE_BUCKET_NAME', 'resources')
        
        # تست لیست کردن باکت‌ها
        response = s3_client.list_buckets()
        print(f"✅ اتصال موفق! تعداد باکت‌ها: {len(response['Buckets'])}")
        
        # بررسی وجود باکت مورد نظر
        bucket_exists = False
        for bucket in response['Buckets']:
            if bucket['Name'] == bucket_name:
                bucket_exists = True
                print(f"✅ باکت '{bucket_name}' یافت شد")
                break
        
        if not bucket_exists:
            print(f"❌ باکت '{bucket_name}' یافت نشد")
            return False
        
        return True
        
    except ClientError as e:
        print(f"❌ خطا در اتصال: {e}")
        return False
    except Exception as e:
        print(f"❌ خطای غیرمنتظره: {e}")
        return False

def test_file_upload():
    """تست آپلود فایل"""
    print("\n📤 تست آپلود فایل...")
    
    try:
        # ایجاد فایل تست
        test_content = "این یک فایل تست برای بررسی عملکرد باکت لیارا است."
        test_file_path = "test-file.txt"
        
        with open(test_file_path, 'w', encoding='utf-8') as f:
            f.write(test_content)
        
        # آپلود فایل
        with open(test_file_path, 'rb') as f:
            result = file_manager.upload_file(f, "test-file.txt", "text/plain")
        
        if result['success']:
            print(f"✅ آپلود موفق! URL: {result['file_url']}")
            
            # تست دانلود
            print("\n📥 تست دانلود فایل...")
            file_info = file_manager.get_file_info(result['file_path'])
            if file_info['exists']:
                print(f"✅ فایل موجود است! حجم: {file_info['size']} بایت")
                
                # حذف فایل تست
                print("\n🗑️ حذف فایل تست...")
                delete_result = file_manager.delete_file(result['file_path'])
                if delete_result['success']:
                    print("✅ فایل تست حذف شد")
                else:
                    print(f"❌ خطا در حذف فایل: {delete_result['error']}")
            else:
                print("❌ فایل یافت نشد")
        else:
            print(f"❌ خطا در آپلود: {result['error']}")
        
        # حذف فایل محلی
        os.remove(test_file_path)
        
    except Exception as e:
        print(f"❌ خطا در تست آپلود: {e}")

def test_bucket_permissions():
    """تست دسترسی‌های باکت"""
    print("\n🔐 تست دسترسی‌های باکت...")
    
    try:
        bucket_name = os.getenv('FILE_BUCKET_NAME', 'resources')
        
        s3_client = boto3.client(
            's3',
            endpoint_url=os.getenv('LIARA_ENDPOINT_URL', 'https://storage.c2.liara.space'),
            aws_access_key_id=os.getenv('LIARA_ACCESS_KEY'),
            aws_secret_access_key=os.getenv('LIARA_SECRET_KEY'),
            region_name='iran'
        )
        
        # تست دسترسی خواندن
        try:
            s3_client.head_bucket(Bucket=bucket_name)
            print("✅ دسترسی خواندن: موفق")
        except ClientError as e:
            print(f"❌ دسترسی خواندن: {e}")
        
        # تست دسترسی نوشتن
        try:
            s3_client.put_object(
                Bucket=bucket_name,
                Key='test-permission.txt',
                Body=b'test',
                ContentType='text/plain'
            )
            print("✅ دسترسی نوشتن: موفق")
            
            # حذف فایل تست
            s3_client.delete_object(Bucket=bucket_name, Key='test-permission.txt')
            print("✅ دسترسی حذف: موفق")
            
        except ClientError as e:
            print(f"❌ دسترسی نوشتن: {e}")
        
    except Exception as e:
        print(f"❌ خطا در تست دسترسی‌ها: {e}")

def main():
    """تابع اصلی"""
    print("🚀 شروع تست باکت لیارا")
    print("=" * 50)
    
    # بررسی متغیرهای محیطی
    required_vars = [
        'LIARA_ACCESS_KEY',
        'LIARA_SECRET_KEY', 
        'LIARA_ENDPOINT_URL',
        'FILE_BUCKET_NAME'
    ]
    
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        print(f"❌ متغیرهای محیطی زیر تنظیم نشده‌اند:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nلطفاً متغیرهای محیطی را در تنظیمات Liara اضافه کنید.")
        return
    
    print("✅ تمام متغیرهای محیطی تنظیم شده‌اند")
    
    # اجرای تست‌ها
    if test_liara_connection():
        test_bucket_permissions()
        test_file_upload()
    
    print("\n" + "=" * 50)
    print("🏁 تست کامل شد")

if __name__ == "__main__":
    main()
