#!/usr/bin/env python
"""
Simple security test script to verify security headers and configurations
"""
import os
import sys
import django
from django.conf import settings
from django.test import Client

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def test_security_headers():
    """Test that security headers are present"""
    print("Testing security headers...")
    
    client = Client()
    
    # Test with HTTPS to avoid redirect
    response = client.get('/api/health/', **{'wsgi.url_scheme': 'https'})
    
    # If we get a redirect, follow it
    if response.status_code == 301:
        print("Following redirect...")
        response = client.get('/api/health/', follow=True, **{'wsgi.url_scheme': 'https'})
    
    # Check security headers
    headers_to_check = {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
    }
    
    print(f"Response status: {response.status_code}")
    
    for header, expected_value in headers_to_check.items():
        if header in response:
            actual_value = response[header]
            if actual_value == expected_value:
                print(f"✓ {header}: {actual_value}")
            else:
                print(f"✗ {header}: Expected '{expected_value}', got '{actual_value}'")
        else:
            print(f"✗ {header}: Missing")
    
    # Check CSP header
    if 'Content-Security-Policy' in response:
        csp = response['Content-Security-Policy']
        print(f"✓ Content-Security-Policy: {csp[:100]}...")
    else:
        print("✗ Content-Security-Policy: Missing")
    
    # Check HSTS header
    if 'Strict-Transport-Security' in response:
        hsts = response['Strict-Transport-Security']
        print(f"✓ Strict-Transport-Security: {hsts}")
    else:
        print("✗ Strict-Transport-Security: Missing")
    
    return response.status_code == 200

def test_security_settings():
    """Test security settings configuration"""
    print("\nTesting security settings...")
    
    # Check password hashers
    hashers = settings.PASSWORD_HASHERS
    if hashers[0] == 'django.contrib.auth.hashers.Argon2PasswordHasher':
        print("✓ Argon2 is the primary password hasher")
    else:
        print(f"✗ Argon2 is not the primary hasher. First hasher: {hashers[0]}")
    
    # Check security settings
    security_settings = {
        'SECURE_SSL_REDIRECT': True,
        'SESSION_COOKIE_SECURE': True,
        'CSRF_COOKIE_SECURE': True,
        'SESSION_COOKIE_HTTPONLY': True,
        'SECURE_HSTS_SECONDS': 31536000,
        'SECURE_HSTS_INCLUDE_SUBDOMAINS': True,
        'SECURE_HSTS_PRELOAD': True,
        'SECURE_CONTENT_TYPE_NOSNIFF': True,
        'SECURE_BROWSER_XSS_FILTER': True,
        'X_FRAME_OPTIONS': 'DENY',
    }
    
    for setting, expected_value in security_settings.items():
        actual_value = getattr(settings, setting, None)
        if actual_value == expected_value:
            print(f"✓ {setting}: {actual_value}")
        else:
            print(f"✗ {setting}: Expected '{expected_value}', got '{actual_value}'")
    
    # Check axes configuration
    axes_settings = {
        'AXES_ENABLED': True,
        'AXES_FAILURE_LIMIT': 5,
        'AXES_COOLOFF_TIME': 1,
    }
    
    for setting, expected_value in axes_settings.items():
        actual_value = getattr(settings, setting, None)
        if actual_value == expected_value:
            print(f"✓ {setting}: {actual_value}")
        else:
            print(f"✗ {setting}: Expected '{expected_value}', got '{actual_value}'")
    
    # Check CSP configuration
    if hasattr(settings, 'CONTENT_SECURITY_POLICY'):
        csp = settings.CONTENT_SECURITY_POLICY
        if 'DIRECTIVES' in csp:
            print("✓ CSP configuration is properly structured")
            directives = csp['DIRECTIVES']
            if 'default-src' in directives and "'self'" in directives['default-src']:
                print("✓ CSP default-src is set to 'self'")
            else:
                print("✗ CSP default-src is not properly configured")
        else:
            print("✗ CSP configuration is missing DIRECTIVES")
    else:
        print("✗ CONTENT_SECURITY_POLICY is not configured")

def test_throttling_config():
    """Test throttling configuration"""
    print("\nTesting throttling configuration...")
    
    if hasattr(settings, 'REST_FRAMEWORK'):
        rf_settings = settings.REST_FRAMEWORK
        if 'DEFAULT_THROTTLE_RATES' in rf_settings:
            rates = rf_settings['DEFAULT_THROTTLE_RATES']
            expected_rates = {
                'anon': '100/hour',
                'user': '1000/hour',
                'login': '5/minute',
                'register': '3/minute',
                'password_reset': '2/minute',
            }
            
            for rate_name, expected_rate in expected_rates.items():
                if rate_name in rates:
                    actual_rate = rates[rate_name]
                    if actual_rate == expected_rate:
                        print(f"✓ {rate_name}: {actual_rate}")
                    else:
                        print(f"✗ {rate_name}: Expected '{expected_rate}', got '{actual_rate}'")
                else:
                    print(f"✗ {rate_name}: Missing from throttle rates")
        else:
            print("✗ DEFAULT_THROTTLE_RATES is not configured")
    else:
        print("✗ REST_FRAMEWORK is not configured")

def main():
    """Run all security tests"""
    print("=" * 60)
    print("Mech Craft Hub Security Configuration Test")
    print("=" * 60)
    
    # Test security headers
    headers_ok = test_security_headers()
    
    # Test security settings
    test_security_settings()
    
    # Test throttling configuration
    test_throttling_config()
    
    print("\n" + "=" * 60)
    if headers_ok:
        print("✓ Security configuration test completed successfully!")
    else:
        print("✗ Some security tests failed. Check the output above.")
    print("=" * 60)

if __name__ == '__main__':
    main()
