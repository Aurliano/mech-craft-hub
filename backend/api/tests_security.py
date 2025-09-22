"""
Security tests for Django + DRF application
Tests for security headers, throttling, and django-axes functionality
"""
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.core.cache import cache
from django.conf import settings
import json
import time

User = get_user_model()


class SecurityHeadersTestCase(TestCase):
    """Test security headers are properly set"""
    
    def setUp(self):
        self.client = Client()
    
    def test_security_headers_present(self):
        """Test that security headers are present in responses"""
        response = self.client.get('/api/health/')
        
        # Check security headers
        self.assertIn('X-Frame-Options', response)
        self.assertEqual(response['X-Frame-Options'], 'DENY')
        
        self.assertIn('X-Content-Type-Options', response)
        self.assertEqual(response['X-Content-Type-Options'], 'nosniff')
        
        self.assertIn('X-XSS-Protection', response)
        self.assertEqual(response['X-XSS-Protection'], '1; mode=block')
        
        # Check HSTS header (only in production)
        if not settings.DEBUG:
            self.assertIn('Strict-Transport-Security', response)
            self.assertIn('max-age=31536000', response['Strict-Transport-Security'])
    
    def test_csp_header_present(self):
        """Test that Content Security Policy header is present"""
        response = self.client.get('/api/health/')
        
        # Check CSP header
        self.assertIn('Content-Security-Policy', response)
        csp = response['Content-Security-Policy']
        
        # Check for basic CSP directives
        self.assertIn("default-src 'self'", csp)
        self.assertIn("frame-ancestors 'none'", csp)
        self.assertIn("object-src 'none'", csp)


class ThrottlingTestCase(APITestCase):
    """Test API throttling functionality"""
    
    def setUp(self):
        self.client = Client()
        cache.clear()
    
    def test_login_throttling(self):
        """Test that login endpoint is properly throttled"""
        url = reverse('login')
        
        # Make multiple requests to trigger throttling
        for i in range(6):  # Exceed the 5/minute limit
            response = self.client.post(url, {
                'username': 'testuser',
                'password': 'wrongpassword'
            })
            
            if i < 5:
                # First 5 requests should not be throttled
                self.assertNotEqual(response.status_code, 429)
            else:
                # 6th request should be throttled
                self.assertEqual(response.status_code, 429)
    
    def test_register_throttling(self):
        """Test that registration endpoint is properly throttled"""
        url = reverse('register')
        
        # Make multiple requests to trigger throttling
        for i in range(4):  # Exceed the 3/minute limit
            response = self.client.post(url, {
                'username': f'testuser{i}',
                'email': f'test{i}@example.com',
                'password': 'testpass123',
                'password_confirm': 'testpass123'
            })
            
            if i < 3:
                # First 3 requests should not be throttled
                self.assertNotEqual(response.status_code, 429)
            else:
                # 4th request should be throttled
                self.assertEqual(response.status_code, 429)
    
    def test_password_reset_throttling(self):
        """Test that password reset endpoint is properly throttled"""
        url = reverse('password_reset_request')
        
        # Make multiple requests to trigger throttling
        for i in range(3):  # Exceed the 2/minute limit
            response = self.client.post(url, {
                'email': 'test@example.com'
            })
            
            if i < 2:
                # First 2 requests should not be throttled
                self.assertNotEqual(response.status_code, 429)
            else:
                # 3rd request should be throttled
                self.assertEqual(response.status_code, 429)


class DjangoAxesTestCase(TestCase):
    """Test django-axes functionality"""
    
    def setUp(self):
        self.client = Client()
        cache.clear()
        
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_axes_lockout_after_failed_attempts(self):
        """Test that axes locks out after 5 failed login attempts"""
        url = reverse('login')
        
        # Make 5 failed login attempts
        for i in range(5):
            response = self.client.post(url, {
                'username': 'testuser',
                'password': 'wrongpassword'
            })
            # Should not be locked out yet
            self.assertNotEqual(response.status_code, 403)
        
        # 6th attempt should be locked out
        response = self.client.post(url, {
            'username': 'testuser',
            'password': 'wrongpassword'
        })
        self.assertEqual(response.status_code, 403)
    
    def test_axes_reset_after_successful_login(self):
        """Test that axes resets after successful login"""
        url = reverse('login')
        
        # Make 3 failed attempts
        for i in range(3):
            self.client.post(url, {
                'username': 'testuser',
                'password': 'wrongpassword'
            })
        
        # Successful login should reset the counter
        response = self.client.post(url, {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, 200)
        
        # Now we should be able to make 5 more failed attempts
        for i in range(5):
            response = self.client.post(url, {
                'username': 'testuser',
                'password': 'wrongpassword'
            })
            self.assertNotEqual(response.status_code, 403)


class PasswordHashingTestCase(TestCase):
    """Test password hashing with Argon2"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_password_hashed_with_argon2(self):
        """Test that passwords are hashed with Argon2"""
        # Check that the password is hashed
        self.assertTrue(self.user.password.startswith('argon2'))
        
        # Check that the password can still be verified
        self.assertTrue(self.user.check_password('testpass123'))
        self.assertFalse(self.user.check_password('wrongpassword'))
    
    def test_password_hashers_order(self):
        """Test that Argon2 is the first password hasher"""
        hashers = settings.PASSWORD_HASHERS
        self.assertEqual(hashers[0], 'django.contrib.auth.hashers.Argon2PasswordHasher')


class CSRFTestCase(TestCase):
    """Test CSRF protection"""
    
    def setUp(self):
        self.client = Client()
    
    def test_csrf_cookie_secure(self):
        """Test that CSRF cookie is marked as secure"""
        response = self.client.get('/api/health/')
        
        # Check CSRF cookie settings
        csrf_cookie = response.cookies.get('csrftoken')
        if csrf_cookie:
            self.assertTrue(csrf_cookie.get('secure', False))
            self.assertTrue(csrf_cookie.get('httponly', False))


class SessionSecurityTestCase(TestCase):
    """Test session security settings"""
    
    def setUp(self):
        self.client = Client()
    
    def test_session_cookie_secure(self):
        """Test that session cookie is marked as secure"""
        response = self.client.get('/api/health/')
        
        # Check session cookie settings
        session_cookie = response.cookies.get('sessionid')
        if session_cookie:
            self.assertTrue(session_cookie.get('secure', False))
            self.assertTrue(session_cookie.get('httponly', False))


class RateLimitIntegrationTestCase(APITestCase):
    """Test rate limiting integration with different endpoints"""
    
    def setUp(self):
        self.client = Client()
        cache.clear()
    
    def test_anonymous_rate_limit(self):
        """Test anonymous user rate limiting"""
        # Make requests to trigger anonymous rate limit
        for i in range(101):  # Exceed the 100/hour limit
            response = self.client.get('/api/health/')
            
            if i < 100:
                self.assertNotEqual(response.status_code, 429)
            else:
                self.assertEqual(response.status_code, 429)
                break
    
    def test_authenticated_rate_limit(self):
        """Test authenticated user rate limiting"""
        # Create and authenticate a user
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Login to get authentication
        login_response = self.client.post('/api/v1/auth/login/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        
        if login_response.status_code == 200:
            # Make requests to trigger authenticated rate limit
            for i in range(1001):  # Exceed the 1000/hour limit
                response = self.client.get('/api/health/')
                
                if i < 1000:
                    self.assertNotEqual(response.status_code, 429)
                else:
                    self.assertEqual(response.status_code, 429)
                    break


class SecurityMiddlewareTestCase(TestCase):
    """Test security middleware functionality"""
    
    def setUp(self):
        self.client = Client()
    
    def test_security_middleware_headers(self):
        """Test that security middleware adds proper headers"""
        response = self.client.get('/api/health/')
        
        # Check that security middleware headers are present
        self.assertIn('X-Frame-Options', response)
        self.assertIn('X-Content-Type-Options', response)
        self.assertIn('X-XSS-Protection', response)
    
    def test_csp_middleware_headers(self):
        """Test that CSP middleware adds proper headers"""
        response = self.client.get('/api/health/')
        
        # Check that CSP middleware headers are present
        self.assertIn('Content-Security-Policy', response)
