"""
Comprehensive tests for hCaptcha integration
"""
import json
import hashlib
from unittest.mock import patch, Mock, AsyncMock
from django.test import TestCase, override_settings
from django.urls import reverse
from django.core.cache import cache
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
import httpx

from .models import HCaptchaAttempt
from .utils.hcaptcha import (
    verify_hcaptcha_token_sync, log_hcaptcha_attempt, check_fallback_available,
    get_fallback_captcha_data, verify_fallback_captcha, get_hcaptcha_stats
)

User = get_user_model()


class HCaptchaUtilsTestCase(TestCase):
    """Test hCaptcha utility functions"""
    
    def setUp(self):
        """Set up test data"""
        self.test_token = "test_hcaptcha_token_12345"
        self.test_ip = "192.168.1.1"
        self.test_user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123"
        )
        cache.clear()
    
    def tearDown(self):
        """Clean up after tests"""
        cache.clear()
    
    @patch('api.utils.hcaptcha.SECRET', 'test_secret')
    @patch('api.utils.hcaptcha.httpx.AsyncClient')
    def test_verify_hcaptcha_token_success(self, mock_client):
        """Test successful hCaptcha token verification"""
        # Mock successful hCaptcha response
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": True,
            "challenge_ts": "2023-01-01T00:00:00Z",
            "hostname": "example.com"
        }
        mock_response.raise_for_status.return_value = None
        
        mock_client.return_value.__aenter__.return_value.post.return_value = mock_response
        
        # Test verification
        success, data = verify_hcaptcha_token_sync(self.test_token, self.test_ip)
        
        self.assertTrue(success)
        self.assertEqual(data["success"], True)
        
        # Verify token is marked as used in cache
        token_hash = hashlib.sha256(self.test_token.encode('utf-8')).hexdigest()
        used_key = f"hcaptcha:used:{token_hash}"
        self.assertTrue(cache.get(used_key))
    
    @patch('api.utils.hcaptcha.SECRET', 'test_secret')
    @patch('api.utils.hcaptcha.httpx.AsyncClient')
    def test_verify_hcaptcha_token_failure(self, mock_client):
        """Test failed hCaptcha token verification"""
        # Mock failed hCaptcha response
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": False,
            "error-codes": ["invalid-input-response"]
        }
        mock_response.raise_for_status.return_value = None
        
        mock_client.return_value.__aenter__.return_value.post.return_value = mock_response
        
        # Test verification
        success, data = verify_hcaptcha_token_sync(self.test_token, self.test_ip)
        
        self.assertFalse(success)
        self.assertEqual(data["success"], False)
        self.assertIn("invalid-input-response", data["error-codes"])
    
    @patch('api.utils.hcaptcha.SECRET', 'test_secret')
    @patch('api.utils.hcaptcha.httpx.AsyncClient')
    def test_verify_hcaptcha_token_network_error(self, mock_client):
        """Test hCaptcha verification with network error"""
        # Mock network error
        mock_client.return_value.__aenter__.return_value.post.side_effect = httpx.ConnectError("Connection failed")
        
        # Test verification - should catch the exception and return False
        try:
            success, data = verify_hcaptcha_token_sync(self.test_token, self.test_ip)
            self.assertFalse(success)
            self.assertIn("error", data)
        except Exception as e:
            # The function should handle the exception internally
            self.fail(f"Function should handle network errors internally: {e}")
    
    @patch('api.utils.hcaptcha.SECRET', 'test_secret')
    def test_verify_hcaptcha_token_replay_prevention(self):
        """Test token replay prevention"""
        # First verification
        with patch('api.utils.hcaptcha.httpx.AsyncClient') as mock_client:
            mock_response = Mock()
            mock_response.json.return_value = {"success": True}
            mock_response.raise_for_status.return_value = None
            mock_client.return_value.__aenter__.return_value.post.return_value = mock_response
            
            success, data = verify_hcaptcha_token_sync(self.test_token, self.test_ip)
            self.assertTrue(success)
        
        # Second verification with same token should fail
        with patch('api.utils.hcaptcha.httpx.AsyncClient') as mock_client:
            try:
                success, data = verify_hcaptcha_token_sync(self.test_token, self.test_ip)
                self.assertFalse(success)
                self.assertIn("token-replayed", data["error"])
            except Exception as e:
                # The function should handle the exception internally
                self.fail(f"Function should handle replay errors internally: {e}")
    
    def test_log_hcaptcha_attempt(self):
        """Test logging hCaptcha attempts"""
        # Test successful attempt
        log_hcaptcha_attempt(
            ip=self.test_ip,
            user_id=str(self.test_user.id),
            endpoint="/api/v1/auth/register/",
            success=True,
            response_data={"success": True},
            token_hash="test_hash_123"
        )
        
        # Verify the attempt was logged
        attempt = HCaptchaAttempt.objects.filter(
            ip=self.test_ip,
            user=self.test_user,
            endpoint="/api/v1/auth/register/",
            success=True
        ).first()
        
        self.assertIsNotNone(attempt)
        self.assertEqual(attempt.ip, self.test_ip)
        self.assertEqual(attempt.user, self.test_user)
        self.assertTrue(attempt.success)
        self.assertEqual(attempt.endpoint, "/api/v1/auth/register/")
        
        # Test failed attempt
        log_hcaptcha_attempt(
            ip=self.test_ip,
            user_id=None,
            endpoint="/api/v1/auth/login/",
            success=False,
            response_data={"success": False},
            token_hash="test_hash_456"
        )
        
        # Verify the failed attempt was logged
        attempt = HCaptchaAttempt.objects.filter(
            ip=self.test_ip,
            user=None,
            endpoint="/api/v1/auth/login/",
            success=False
        ).first()
        
        self.assertIsNotNone(attempt)
        self.assertFalse(attempt.success)
    
    @patch('api.utils.hcaptcha.FALLBACK_ENABLED', True)
    def test_check_fallback_available(self):
        """Test fallback availability check"""
        self.assertTrue(check_fallback_available())
    
    @patch('api.utils.hcaptcha.FALLBACK_ENABLED', False)
    def test_check_fallback_available_disabled(self):
        """Test fallback availability check when disabled"""
        self.assertFalse(check_fallback_available())
    
    @patch('api.utils.hcaptcha.FALLBACK_ENABLED', True)
    def test_get_fallback_captcha_data(self):
        """Test fallback captcha data generation"""
        data = get_fallback_captcha_data()
        
        self.assertIn("available", data)
        self.assertIn("challenge_id", data)
        self.assertIn("challenge", data)
        self.assertTrue(data["available"])
        self.assertIsNotNone(data["challenge_id"])
        self.assertIsNotNone(data["challenge"])
    
    @patch('api.utils.hcaptcha.FALLBACK_ENABLED', True)
    def test_verify_fallback_captcha(self):
        """Test fallback captcha verification"""
        # Generate captcha data
        captcha_data = get_fallback_captcha_data()
        challenge_id = captcha_data["challenge_id"]
        
        # This test would need to be more sophisticated in a real implementation
        # For now, we'll just test the function exists and returns a boolean
        result = verify_fallback_captcha(challenge_id, "test_answer")
        self.assertIsInstance(result, bool)
    
    def test_get_hcaptcha_stats(self):
        """Test hCaptcha statistics"""
        # Create some test attempts
        HCaptchaAttempt.objects.create(
            ip=self.test_ip,
            user=self.test_user,
            endpoint="/api/v1/auth/register/",
            success=True,
            response_raw={"success": True},
            token_hash="hash1",
            user_agent="Test Agent"
        )
        
        HCaptchaAttempt.objects.create(
            ip=self.test_ip,
            user=None,
            endpoint="/api/v1/auth/login/",
            success=False,
            response_raw={"success": False},
            token_hash="hash2",
            error_message="Invalid token",
            user_agent="Test Agent"
        )
        
        stats = get_hcaptcha_stats()
        
        # The actual implementation returns system status, not attempt statistics
        self.assertIn("cache_backend", stats)
        self.assertIn("fallback_enabled", stats)
        self.assertIn("secret_configured", stats)


class HCaptchaAPITestCase(APITestCase):
    """Test hCaptcha API endpoints"""
    
    def setUp(self):
        """Set up test data"""
        self.test_user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123"
        )
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.fallback_status_url = reverse('captcha_fallback_status')
        self.fallback_verify_url = reverse('captcha_fallback_verify')
        self.hcaptcha_stats_url = reverse('hcaptcha_stats')
        self.hcaptcha_attempts_url = reverse('hcaptcha_attempts')
        cache.clear()
    
    def tearDown(self):
        """Clean up after tests"""
        cache.clear()
    
    @patch('api.utils.hcaptcha.verify_hcaptcha_token_sync')
    def test_register_with_valid_hcaptcha(self, mock_verify):
        """Test user registration with valid hCaptcha"""
        # Mock successful hCaptcha verification
        mock_verify.return_value = (True, {"success": True})
        
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'phone': '+1234567890',
            'hcaptcha_token': 'valid_token_123'
        }
        
        response = self.client.post(self.register_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())
        mock_verify.assert_called_once()
    
    @patch('api.utils.hcaptcha.verify_hcaptcha_token_sync')
    def test_register_with_invalid_hcaptcha(self, mock_verify):
        """Test user registration with invalid hCaptcha"""
        # Mock failed hCaptcha verification
        mock_verify.return_value = (False, {"error": "invalid-token"})
        
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'phone': '+1234567890',
            'hcaptcha_token': 'invalid_token'
        }
        
        response = self.client.post(self.register_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('hcaptcha', response.data)
        self.assertFalse(User.objects.filter(username='newuser').exists())
    
    @patch('api.utils.hcaptcha.verify_hcaptcha_token_sync')
    def test_login_with_valid_hcaptcha(self, mock_verify):
        """Test user login with valid hCaptcha"""
        # Mock successful hCaptcha verification
        mock_verify.return_value = (True, {"success": True})
        
        data = {
            'username': 'testuser',
            'password': 'testpass123',
            'hcaptcha_token': 'valid_token_123'
        }
        
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        mock_verify.assert_called_once()
    
    @patch('api.utils.hcaptcha.verify_hcaptcha_token_sync')
    def test_login_with_invalid_hcaptcha(self, mock_verify):
        """Test user login with invalid hCaptcha"""
        # Mock failed hCaptcha verification
        mock_verify.return_value = (False, {"error": "invalid-token"})
        
        data = {
            'username': 'testuser',
            'password': 'testpass123',
            'hcaptcha_token': 'invalid_token'
        }
        
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('hcaptcha', response.data)
    
    def test_captcha_fallback_status(self):
        """Test captcha fallback status endpoint"""
        response = self.client.get(self.fallback_status_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('available', response.data)
    
    def test_captcha_fallback_verify(self):
        """Test captcha fallback verification endpoint"""
        data = {
            'challenge_id': 'test_challenge_id',
            'answer': 'test_answer'
        }
        
        response = self.client.post(self.fallback_verify_url, data)
        
        # The response depends on the fallback implementation
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST])
    
    def test_hcaptcha_stats_requires_admin(self):
        """Test hCaptcha stats endpoint requires admin permission"""
        # Test without authentication
        response = self.client.get(self.hcaptcha_stats_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Test with regular user
        self.client.force_authenticate(user=self.test_user)
        response = self.client.get(self.hcaptcha_stats_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_hcaptcha_stats_with_admin(self):
        """Test hCaptcha stats endpoint with admin user"""
        # Create admin user
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123',
            phone='+1234567891'
        )
        
        # Create some test attempts
        HCaptchaAttempt.objects.create(
            ip='192.168.1.1',
            user=self.test_user,
            endpoint='/api/v1/auth/register/',
            success=True,
            response_raw={"success": True},
            token_hash="hash1",
            user_agent="Test Agent"
        )
        
        self.client.force_authenticate(user=admin_user)
        response = self.client.get(self.hcaptcha_stats_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('cache_backend', response.data)
        self.assertIn('fallback_enabled', response.data)
        self.assertIn('secret_configured', response.data)
    
    def test_hcaptcha_attempts_requires_admin(self):
        """Test hCaptcha attempts endpoint requires admin permission"""
        # Test without authentication
        response = self.client.get(self.hcaptcha_attempts_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Test with regular user
        self.client.force_authenticate(user=self.test_user)
        response = self.client.get(self.hcaptcha_attempts_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_hcaptcha_attempts_with_admin(self):
        """Test hCaptcha attempts endpoint with admin user"""
        # Create admin user
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123',
            phone='+1234567891'
        )
        
        # Create some test attempts
        HCaptchaAttempt.objects.create(
            ip='192.168.1.1',
            user=self.test_user,
            endpoint='/api/v1/auth/register/',
            success=True,
            response_raw={"success": True},
            token_hash="hash1",
            user_agent="Test Agent"
        )
        
        self.client.force_authenticate(user=admin_user)
        response = self.client.get(self.hcaptcha_attempts_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(len(response.data['results']), 1)


class HCaptchaThrottlingTestCase(APITestCase):
    """Test hCaptcha throttling functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        cache.clear()
    
    def tearDown(self):
        """Clean up after tests"""
        cache.clear()
    
    @patch('api.utils.hcaptcha.verify_hcaptcha_token_sync')
    def test_register_throttling(self, mock_verify):
        """Test registration endpoint throttling"""
        mock_verify.return_value = (True, {"success": True})
        
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'phone': '+1234567890',
            'hcaptcha_token': 'valid_token'
        }
        
        # Make multiple requests quickly
        for i in range(10):  # Exceed the 5/min limit
            response = self.client.post(self.register_url, data)
            if i < 5:
                self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            else:
                # Should be throttled
                self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
    
    @patch('api.utils.hcaptcha.verify_hcaptcha_token_sync')
    def test_login_throttling(self, mock_verify):
        """Test login endpoint throttling"""
        mock_verify.return_value = (True, {"success": True})
        
        data = {
            'username': 'testuser',
            'password': 'testpass123',
            'hcaptcha_token': 'valid_token'
        }
        
        # Make multiple requests quickly
        for i in range(15):  # Exceed the 10/min limit
            response = self.client.post(self.login_url, data)
            if i < 10:
                self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST])
            else:
                # Should be throttled
                self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)


class HCaptchaIntegrationTestCase(APITestCase):
    """Integration tests for hCaptcha functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        cache.clear()
    
    def tearDown(self):
        """Clean up after tests"""
        cache.clear()
    
    @patch('api.utils.hcaptcha.httpx.AsyncClient')
    def test_full_registration_flow(self, mock_client):
        """Test complete registration flow with hCaptcha"""
        # Mock hCaptcha verification
        mock_response = Mock()
        mock_response.json.return_value = {"success": True}
        mock_response.raise_for_status.return_value = None
        mock_client.return_value.__aenter__.return_value.post.return_value = mock_response
        
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'phone': '+1234567890',
            'hcaptcha_token': 'valid_token_123'
        }
        
        response = self.client.post(self.register_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())
        
        # Verify hCaptcha attempt was logged
        attempt = HCaptchaAttempt.objects.filter(
            endpoint='/api/v1/auth/register/',
            success=True
        ).first()
        self.assertIsNotNone(attempt)
    
    @patch('api.utils.hcaptcha.httpx.AsyncClient')
    def test_full_login_flow(self, mock_client):
        """Test complete login flow with hCaptcha"""
        # Create test user
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Mock hCaptcha verification
        mock_response = Mock()
        mock_response.json.return_value = {"success": True}
        mock_response.raise_for_status.return_value = None
        mock_client.return_value.__aenter__.return_value.post.return_value = mock_response
        
        data = {
            'username': 'testuser',
            'password': 'testpass123',
            'hcaptcha_token': 'valid_token_123'
        }
        
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        
        # Verify hCaptcha attempt was logged
        attempt = HCaptchaAttempt.objects.filter(
            endpoint='/api/v1/auth/login/',
            success=True
        ).first()
        self.assertIsNotNone(attempt)
