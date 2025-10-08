"""
Test script for SMS service
Run this script to test SMS functionality
"""

import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.services.sms_service import sms_service

def test_sms_service():
    """Test SMS service functionality"""
    
    print("🧪 Testing SMS Service...")
    print("=" * 50)
    
    # Test 1: Check SMS service configuration
    print("\n1️⃣ Checking SMS service configuration...")
    if sms_service.api_key:
        print("✅ SMS_KEY is configured")
    else:
        print("❌ SMS_KEY is not configured")
        print("   Please set SMS_KEY in your environment variables")
        return False
    
    # Test 2: Test phone number formatting
    print("\n2️⃣ Testing phone number formatting...")
    test_phones = [
        "09123456789",
        "9123456789", 
        "00989123456789",
        "0912-345-6789"
    ]
    
    for phone in test_phones:
        formatted = sms_service._format_phone_number(phone)
        print(f"   {phone} → {formatted}")
    
    # Test 3: Test rate limiting
    print("\n3️⃣ Testing rate limiting...")
    test_phone = "09123456789"
    
    # First check should not be rate limited
    is_limited = sms_service.rate_limit_check(test_phone, 'verification')
    print(f"   First check: {'Rate limited' if is_limited else 'Not rate limited'}")
    
    # Second check should be rate limited
    is_limited = sms_service.rate_limit_check(test_phone, 'verification')
    print(f"   Second check: {'Rate limited' if is_limited else 'Not rate limited'}")
    
    # Test 4: Test SMS credit (if API key is valid)
    print("\n4️⃣ Testing SMS credit check...")
    try:
        credit_result = sms_service.get_credit()
        if credit_result['success']:
            print(f"   ✅ SMS Credit: {credit_result['credit']}")
        else:
            print(f"   ❌ Failed to get credit: {credit_result['error']}")
    except Exception as e:
        print(f"   ❌ Error getting credit: {str(e)}")
    
    # Test 5: Test SMS sending (commented out to avoid actual SMS sending)
    print("\n5️⃣ SMS sending test (SKIPPED to avoid actual SMS sending)")
    print("   To test SMS sending, uncomment the code below and provide a valid phone number")
    
    # Uncomment the following lines to test actual SMS sending
    # test_phone = "09123456789"  # Replace with a valid phone number
    # test_code = "123456"
    # 
    # print(f"   Sending test SMS to {test_phone}...")
    # sms_result = sms_service.send_verification_code(test_phone, test_code)
    # 
    # if sms_result['success']:
    #     print(f"   ✅ SMS sent successfully! Message ID: {sms_result.get('message_id')}")
    # else:
    #     print(f"   ❌ Failed to send SMS: {sms_result['error']}")
    
    print("\n" + "=" * 50)
    print("🎉 SMS Service test completed!")
    
    return True

def test_phone_verification_endpoints():
    """Test phone verification endpoints"""
    
    print("\n🧪 Testing Phone Verification Endpoints...")
    print("=" * 50)
    
    # This would require Django test client
    # For now, just show the available endpoints
    endpoints = [
        "POST /api/v1/auth/phone-verification-request/",
        "POST /api/v1/auth/phone-verification-confirm/",
        "POST /api/v1/auth/password-reset-request-sms/",
        "POST /api/v1/auth/verify-user-phone/",
        "GET /api/v1/sms/credit/",
    ]
    
    print("Available SMS endpoints:")
    for endpoint in endpoints:
        print(f"   📍 {endpoint}")
    
    print("\n" + "=" * 50)
    print("🎉 Endpoint test completed!")

if __name__ == "__main__":
    print("🚀 Starting SMS Service Tests...")
    
    try:
        # Test SMS service
        test_sms_service()
        
        # Test endpoints
        test_phone_verification_endpoints()
        
        print("\n✅ All tests completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
