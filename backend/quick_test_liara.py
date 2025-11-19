#!/usr/bin/env python3
"""
اسکریپت تست سریع اتصال به باکت لیارا
"""

import os
try:
    import boto3  # type: ignore
    from botocore.exceptions import ClientError  # type: ignore
except ImportError:
    print("ERROR: boto3 is not installed. Please install it: pip install boto3")
    exit(1)

def quick_test():
    """تست سریع اتصال"""
    print("🚀 تست سریع اتصال به باکت لیارا")
    print("=" * 40)
    
    # تنظیمات
    endpoint_url = 'https://storage.c2.liara.space'
    bucket_name = 'resources'
    
    # دریافت کلیدها از متغیرهای محیطی
    access_key = os.getenv('LIARA_ACCESS_KEY')
    secret_key = os.getenv('LIARA_SECRET_KEY')
    
    if not access_key or not secret_key:
        print("❌ کلیدهای API تنظیم نشده‌اند!")
        print("لطفاً متغیرهای زیر را تنظیم کنید:")
        print("LIARA_ACCESS_KEY=your-access-key")
        print("LIARA_SECRET_KEY=your-secret-key")
        return False
    
    try:
        # ایجاد کلاینت S3
        s3_client = boto3.client(
            's3',
            endpoint_url=endpoint_url,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name='iran'
        )
        
        print(f"🔗 اتصال به: {endpoint_url}")
        print(f"🪣 باکت: {bucket_name}")
        
        # تست اتصال
        response = s3_client.list_buckets()
        print(f"✅ اتصال موفق! تعداد باکت‌ها: {len(response['Buckets'])}")
        
        # بررسی وجود باکت
        bucket_exists = False
        for bucket in response['Buckets']:
            if bucket['Name'] == bucket_name:
                bucket_exists = True
                print(f"✅ باکت '{bucket_name}' یافت شد")
                break
        
        if not bucket_exists:
            print(f"❌ باکت '{bucket_name}' یافت نشد")
            return False
        
        # تست دسترسی
        try:
            s3_client.head_bucket(Bucket=bucket_name)
            print("✅ دسترسی به باکت: موفق")
        except ClientError as e:
            print(f"❌ دسترسی به باکت: {e}")
            return False
        
        # تست آپلود فایل کوچک
        test_content = "تست اتصال به باکت لیارا"
        test_key = "test-connection.txt"
        
        try:
            s3_client.put_object(
                Bucket=bucket_name,
                Key=test_key,
                Body=test_content.encode('utf-8'),
                ContentType='text/plain'
            )
            print("✅ آپلود فایل تست: موفق")
            
            # حذف فایل تست
            s3_client.delete_object(Bucket=bucket_name, Key=test_key)
            print("✅ حذف فایل تست: موفق")
            
        except ClientError as e:
            print(f"❌ تست آپلود: {e}")
            return False
        
        print("\n🎉 تمام تست‌ها موفق بود!")
        print("✅ باکت لیارا آماده استفاده است")
        return True
        
    except ClientError as e:
        print(f"❌ خطا در اتصال: {e}")
        return False
    except Exception as e:
        print(f"❌ خطای غیرمنتظره: {e}")
        return False

if __name__ == "__main__":
    success = quick_test()
    if success:
        print("\n🚀 می‌توانید پروژه را دیپلوی کنید!")
    else:
        print("\n❌ لطفاً تنظیمات را بررسی کنید")
