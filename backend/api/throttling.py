"""
Custom throttling classes for API endpoints
"""
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


# Legacy throttle classes for backward compatibility
class CustomAnonRateThrottle(AnonRateThrottle):
    """Custom anonymous rate throttle"""
    scope = 'anon'


class CustomUserRateThrottle(UserRateThrottle):
    """Custom user rate throttle"""
    scope = 'user'


class BurstRateThrottle(AnonRateThrottle):
    """Burst rate throttle for high-frequency operations"""
    scope = 'burst'


class SustainedRateThrottle(AnonRateThrottle):
    """Sustained rate throttle for long-term operations"""
    scope = 'sustained'


class UploadRateThrottle(AnonRateThrottle):
    """Upload rate throttle for file uploads"""
    scope = 'upload'


class LoginRateThrottle(AnonRateThrottle):
    """Login rate throttle for authentication"""
    scope = 'login'


class APIRateThrottle(AnonRateThrottle):
    """General API rate throttle"""
    scope = 'api'


class RegisterThrottle(AnonRateThrottle):
    """
    Throttle for registration endpoint
    - 5 requests per minute for anonymous users
    - 10 requests per minute for authenticated users
    """
    scope = 'register'
    rate = '5/min'
    
    def get_cache_key(self, request, view):
        """Generate cache key for throttling"""
        if request.user and request.user.is_authenticated:
            # Authenticated users get higher rate limit
            return f"throttle_register_user_{request.user.id}"
        else:
            # Anonymous users use IP-based throttling
            return f"throttle_register_anon_{self.get_ident(request)}"


class LoginThrottle(AnonRateThrottle):
    """
    Throttle for login endpoint
    - 10 requests per minute for anonymous users
    - 20 requests per minute for authenticated users
    """
    scope = 'login'
    rate = '10/min'
    
    def get_cache_key(self, request, view):
        """Generate cache key for throttling"""
        if request.user and request.user.is_authenticated:
            # Authenticated users get higher rate limit
            return f"throttle_login_user_{request.user.id}"
        else:
            # Anonymous users use IP-based throttling
            return f"throttle_login_anon_{self.get_ident(request)}"


class FileUploadThrottle(AnonRateThrottle):
    """
    Throttle for file upload endpoints
    - 10 requests per minute for anonymous users
    - 30 requests per minute for authenticated users
    """
    scope = 'file_upload'
    rate = '10/min'
    
    def get_cache_key(self, request, view):
        """Generate cache key for throttling"""
        if request.user and request.user.is_authenticated:
            # Authenticated users get higher rate limit
            return f"throttle_upload_user_{request.user.id}"
        else:
            # Anonymous users use IP-based throttling
            return f"throttle_upload_anon_{self.get_ident(request)}"


class IPBasedThrottle(AnonRateThrottle):
    """
    Generic IP-based throttling for sensitive endpoints
    """
    scope = 'ip_based'
    rate = '5/min'
    
    def get_cache_key(self, request, view):
        """Generate cache key for throttling"""
        return f"throttle_ip_{self.get_ident(request)}"


class PasswordResetThrottle(AnonRateThrottle):
    """
    Throttle for password reset endpoint
    - 2 requests per minute per IP
    - 5 requests per minute per authenticated user
    """
    scope = 'password_reset'
    rate = '2/min'
    
    def get_cache_key(self, request, view):
        """Generate cache key for throttling"""
        if request.user and request.user.is_authenticated:
            return f"throttle_password_reset_user_{request.user.id}"
        else:
            return f"throttle_password_reset_anon_{self.get_ident(request)}"


class SensitiveEndpointThrottle(AnonRateThrottle):
    """
    Throttle for sensitive endpoints (quotes, orders, etc.)
    - 20 requests per minute for anonymous users
    - 100 requests per minute for authenticated users
    """
    scope = 'sensitive'
    rate = '20/min'
    
    def get_cache_key(self, request, view):
        """Generate cache key for throttling"""
        if request.user and request.user.is_authenticated:
            return f"throttle_sensitive_user_{request.user.id}"
        else:
            return f"throttle_sensitive_anon_{self.get_ident(request)}"


def get_throttle_rates():
    """
    Get throttle rates configuration for Django settings
    """
    return {
        'register': '3/min',
        'login': '5/min',
        'password_reset': '2/min',
        'file_upload': '10/min',
        'sensitive': '20/min',
        'ip_based': '5/min',
    }


def check_ip_abuse(ip_address, max_attempts=10, time_window=300):
    """
    Check if an IP address has exceeded abuse thresholds
    
    Args:
        ip_address: IP address to check
        max_attempts: Maximum attempts allowed in time window
        time_window: Time window in seconds (default 5 minutes)
    
    Returns:
        bool: True if IP is considered abusive, False otherwise
    """
    cache_key = f"abuse_check_{ip_address}"
    attempts = cache.get(cache_key, 0)
    
    if attempts >= max_attempts:
        logger.warning(f"IP {ip_address} exceeded abuse threshold: {attempts} attempts in {time_window}s")
        return True
    
    return False


def increment_abuse_counter(ip_address, time_window=300):
    """
    Increment abuse counter for an IP address
    
    Args:
        ip_address: IP address to increment counter for
        time_window: Time window in seconds (default 5 minutes)
    """
    cache_key = f"abuse_check_{ip_address}"
    attempts = cache.get(cache_key, 0)
    cache.set(cache_key, attempts + 1, time_window)
    
    logger.info(f"Incremented abuse counter for IP {ip_address}: {attempts + 1} attempts")


def reset_abuse_counter(ip_address):
    """
    Reset abuse counter for an IP address
    
    Args:
        ip_address: IP address to reset counter for
    """
    cache_key = f"abuse_check_{ip_address}"
    cache.delete(cache_key)
    logger.info(f"Reset abuse counter for IP {ip_address}")


def get_throttle_status(request, throttle_class):
    """
    Get current throttle status for a request
    
    Args:
        request: Django request object
        throttle_class: Throttle class to check
    
    Returns:
        dict: Throttle status information
    """
    throttle = throttle_class()
    cache_key = throttle.get_cache_key(request, None)
    
    # Get current count from cache
    count = cache.get(cache_key, 0)
    
    # Get rate limit info
    rate = throttle.parse_rate(throttle.rate)
    if rate:
        num_requests, duration = rate
        return {
            'current_count': count,
            'max_requests': num_requests,
            'duration_seconds': duration,
            'remaining': max(0, num_requests - count),
            'reset_time': cache.get(f"{cache_key}_reset", None)
        }
    
    return {'current_count': count, 'max_requests': None, 'remaining': None}