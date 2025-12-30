"""
Test script for BitPay Payment Gateway
Run this script to test payment gateway functionality

Usage:
    cd backend
    python test_payment_gateway.py
"""

import os
import sys
import django
import requests
from decimal import Decimal

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings_ultra_simple')
django.setup()

from api.models import Order, Payment
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()


def print_section(title):
    """Print a formatted section header"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def test_bitpay_configuration():
    """Test BitPay configuration"""
    print_section("1️⃣ بررسی تنظیمات BitPay")
    
    config_ok = True
    
    if settings.BITPAY_API_KEY:
        print("✅ BITPAY_API_KEY: تنظیم شده")
        print(f"   طول کلید: {len(settings.BITPAY_API_KEY)} کاراکتر")
    else:
        print("❌ BITPAY_API_KEY: تنظیم نشده")
        print("   لطفاً BITPAY_API_KEY را در متغیرهای محیطی تنظیم کنید")
        config_ok = False
    
    if settings.BITPAY_BASE_URL:
        print(f"✅ BITPAY_BASE_URL: {settings.BITPAY_BASE_URL}")
    else:
        print("❌ BITPAY_BASE_URL: تنظیم نشده")
        config_ok = False
    
    if settings.BITPAY_CALLBACK_URL:
        print(f"✅ BITPAY_CALLBACK_URL: {settings.BITPAY_CALLBACK_URL}")
    else:
        print("❌ BITPAY_CALLBACK_URL: تنظیم نشده")
        print("   لطفاً BITPAY_CALLBACK_URL را در متغیرهای محیطی تنظیم کنید")
        config_ok = False
    
    if settings.BITPAY_WEBHOOK_SECRET:
        print("✅ BITPAY_WEBHOOK_SECRET: تنظیم شده")
    else:
        print("⚠️  BITPAY_WEBHOOK_SECRET: تنظیم نشده (اختیاری)")
    
    return config_ok


def test_payment_models():
    """Test payment models and database"""
    print_section("2️⃣ بررسی مدل‌های پرداخت")
    
    try:
        # Count payments
        payment_count = Payment.objects.count()
        print(f"✅ تعداد پرداخت‌ها در دیتابیس: {payment_count}")
        
        # Get recent payments
        recent_payments = Payment.objects.all()[:5]
        if recent_payments:
            print("\n📋 آخرین پرداخت‌ها:")
            for payment in recent_payments:
                print(f"   - {payment.id}: {payment.amount:,} تومان - {payment.get_status_display()}")
        else:
            print("   هیچ پرداختی یافت نشد")
        
        return True
    except Exception as e:
        print(f"❌ خطا در بررسی مدل‌ها: {str(e)}")
        return False


def test_order_payment_summary():
    """Test payment summary for orders"""
    print_section("3️⃣ بررسی خلاصه پرداخت‌های سفارش‌ها")
    
    try:
        # Get a test order
        orders = Order.objects.all()[:5]
        
        if not orders:
            print("⚠️  هیچ سفارشی یافت نشد")
            print("   برای تست کامل، ابتدا یک سفارش ایجاد کنید")
            return True
        
        print(f"📦 بررسی {len(orders)} سفارش:")
        
        from api.views import compute_order_payment_summary
        
        for order in orders:
            print(f"\n   سفارش: {order.order_number}")
            summary = compute_order_payment_summary(order)
            
            print(f"   - متریال:")
            print(f"     کل: {summary['material']['total']:,} تومان")
            print(f"     پرداخت شده: {summary['material']['paid']:,} تومان")
            print(f"     باقیمانده: {summary['material']['remaining']:,} تومان")
            
            print(f"   - پروژه:")
            print(f"     کل: {summary['project']['total']:,} تومان")
            print(f"     پیش‌پرداخت (50%): {summary['project']['advance_50']:,} تومان")
            print(f"     تسویه نهایی (50%): {summary['project']['final_50']:,} تومان")
            
            if summary.get('suggested_next_payment'):
                next_payment = summary['suggested_next_payment']
                print(f"   - پیشنهاد بعدی: {next_payment['type']} - {next_payment['amount']:,} تومان")
        
        return True
    except Exception as e:
        print(f"❌ خطا در بررسی خلاصه پرداخت‌ها: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_bitpay_connection():
    """Test connection to BitPay API"""
    print_section("4️⃣ تست اتصال به BitPay API")
    
    if not settings.BITPAY_API_KEY:
        print("⚠️  BITPAY_API_KEY تنظیم نشده - تست اتصال رد می‌شود")
        return False
    
    try:
        # Test API connection (you might need to adjust this based on BitPay API)
        # Note: This is a basic test - actual payment creation requires valid order
        
        print(f"🌐 تست اتصال به: {settings.BITPAY_BASE_URL}")
        print("   (این تست فقط بررسی می‌کند که URL قابل دسترسی است)")
        
        # Simple connectivity test
        response = requests.get(settings.BITPAY_BASE_URL, timeout=10)
        print(f"   وضعیت: {response.status_code}")
        
        if response.status_code < 500:
            print("✅ اتصال به BitPay برقرار است")
            return True
        else:
            print("⚠️  ممکن است مشکلی در اتصال وجود داشته باشد")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ خطا در اتصال: {str(e)}")
        print("   بررسی کنید که:")
        print("   1. اینترنت متصل است")
        print("   2. BITPAY_BASE_URL صحیح است")
        print("   3. فایروال مانع اتصال نمی‌شود")
        return False
    except Exception as e:
        print(f"❌ خطا: {str(e)}")
        return False


def test_payment_flow_simulation():
    """Simulate payment flow (without actual payment)"""
    print_section("5️⃣ شبیه‌سازی جریان پرداخت")
    
    try:
        # Get a test order
        order = Order.objects.first()
        
        if not order:
            print("⚠️  هیچ سفارشی یافت نشد")
            print("   برای تست کامل، ابتدا یک سفارش ایجاد کنید")
            return True
        
        print(f"📦 استفاده از سفارش: {order.order_number}")
        print(f"   مشتری: {order.customer.username}")
        print(f"   مبلغ کل: {order.total_amount:,} تومان")
        
        # Check existing payments
        payments = order.payments.all()
        print(f"\n💳 پرداخت‌های موجود: {payments.count()}")
        
        for payment in payments:
            print(f"   - {payment.get_payment_type_display()}: {payment.amount:,} تومان - {payment.get_status_display()}")
        
        # Calculate what payments are needed
        from api.views import compute_order_payment_summary
        summary = compute_order_payment_summary(order)
        
        print("\n📊 خلاصه پرداخت‌ها:")
        print(f"   متریال باقیمانده: {summary['material']['remaining']:,} تومان")
        print(f"   پیش‌پرداخت باقیمانده: {summary['project']['advance_50']:,} تومان")
        print(f"   تسویه نهایی باقیمانده: {summary['project']['final_50']:,} تومان")
        
        if summary.get('suggested_next_payment'):
            next_payment = summary['suggested_next_payment']
            print(f"\n💡 پیشنهاد بعدی: {next_payment['type']} - {next_payment['amount']:,} تومان")
        
        print("\n✅ شبیه‌سازی جریان پرداخت تکمیل شد")
        print("\n💡 برای تست واقعی:")
        print("   1. از Postman یا Frontend استفاده کنید")
        print("   2. یک پرداخت را شروع کنید")
        print("   3. در درگاه BitPay پرداخت را تکمیل کنید")
        print("   4. وب‌هوک را بررسی کنید")
        
        return True
        
    except Exception as e:
        print(f"❌ خطا: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Main test function"""
    print("\n" + "=" * 60)
    print("  🧪 تست درگاه پرداخت BitPay")
    print("=" * 60)
    
    results = []
    
    # Run tests
    results.append(("تنظیمات BitPay", test_bitpay_configuration()))
    results.append(("مدل‌های پرداخت", test_payment_models()))
    results.append(("خلاصه پرداخت‌ها", test_order_payment_summary()))
    results.append(("اتصال به BitPay", test_bitpay_connection()))
    results.append(("شبیه‌سازی جریان", test_payment_flow_simulation()))
    
    # Summary
    print_section("📊 خلاصه نتایج")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅" if result else "❌"
        print(f"{status} {name}")
    
    print(f"\n✅ موفق: {passed}/{total}")
    print(f"❌ ناموفق: {total - passed}/{total}")
    
    if passed == total:
        print("\n🎉 همه تست‌ها با موفقیت انجام شد!")
    else:
        print("\n⚠️  برخی تست‌ها ناموفق بودند. لطفاً مشکلات را بررسی کنید.")
    
    print("\n" + "=" * 60)
    print("  برای اطلاعات بیشتر، به PAYMENT_GATEWAY_TEST_GUIDE.md مراجعه کنید")
    print("=" * 60 + "\n")


if __name__ == '__main__':
    main()

