"""
Security middleware for Django
"""
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponse
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class JWTAuthenticationMiddleware(MiddlewareMixin):
    """
    Custom JWT Authentication Middleware
    """
    
    def process_request(self, request):
        # Skip for non-API requests
        if not request.path.startswith('/api/'):
            return None
            
        # Skip for auth endpoints (login, register, etc.)
        if request.path.startswith('/api/v1/auth/'):
            return None
            
        # Get Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None
            
        # Extract token
        token = auth_header.split(' ')[1] if len(auth_header.split(' ')) > 1 else None
        if not token:
            return None
            
        # Validate token and set user
        try:
            from .utils.jwt_utils import JWTManager
            result = JWTManager.get_user_from_token(token)
            
            if result['success']:
                request.user = result['user']
                logger.debug(f"JWT authentication successful for user {result['user'].id}")
            else:
                logger.warning(f"JWT authentication failed: {result.get('message', 'Unknown error')}")
                
        except Exception as e:
            logger.error(f"JWT middleware error: {str(e)}")
            
        return None

class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Middleware to add security headers to all responses
    """
    
    def process_response(self, request, response):
        # Content Security Policy
        csp_policy = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https://challenges.cloudflare.com; "
            "frame-src 'self' https://challenges.cloudflare.com; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "form-action 'self'; "
            "frame-ancestors 'none';"
        )
        response['Content-Security-Policy'] = csp_policy
        
        # X-Frame-Options
        response['X-Frame-Options'] = 'DENY'
        
        # X-Content-Type-Options
        response['X-Content-Type-Options'] = 'nosniff'
        
        # X-XSS-Protection
        response['X-XSS-Protection'] = '1; mode=block'
        
        # Referrer Policy
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Permissions Policy
        permissions_policy = (
            "geolocation=(), "
            "microphone=(), "
            "camera=(), "
            "payment=(), "
            "usb=(), "
            "magnetometer=(), "
            "gyroscope=(), "
            "speaker=(), "
            "vibrate=(), "
            "fullscreen=(self), "
            "sync-xhr=()"
        )
        response['Permissions-Policy'] = permissions_policy
        
        # Strict-Transport-Security (only for HTTPS)
        if request.is_secure():
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
        
        # Cache Control for sensitive endpoints
        if request.path.startswith('/api/v1/auth/'):
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
        
        return response


class CSRFProtectionMiddleware(MiddlewareMixin):
    """
    Enhanced CSRF protection middleware
    """
    
    def process_request(self, request):
        # Skip CSRF for safe methods
        if request.method in ('GET', 'HEAD', 'OPTIONS', 'TRACE'):
            return None
        
        # Skip CSRF for API endpoints that use token authentication
        if request.path.startswith('/api/v1/auth/'):
            # Skip CSRF for all auth endpoints (login, register, etc.)
            return None
        
        # Skip CSRF for file uploads (handled by Django's CSRF middleware)
        if request.path.startswith('/v1/upload/'):
            return None
        
        return None


class RateLimitMiddleware(MiddlewareMixin):
    """
    Rate limiting middleware
    """
    
    def process_request(self, request):
        from django.core.cache import cache
        from django.http import JsonResponse
        
        # Get client IP
        client_ip = self.get_client_ip(request)
        
        # Rate limiting for sensitive endpoints
        if request.path.startswith('/api/v1/auth/'):
            cache_key = f"rate_limit_auth_{client_ip}"
            attempts = cache.get(cache_key, 0)
            
            if attempts >= 10:  # 10 attempts per minute
                logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                return JsonResponse({
                    'error': 'Rate limit exceeded',
                    'message': 'تعداد درخواست‌ها بیش از حد مجاز است'
                }, status=429)
            
            # Increment counter
            cache.set(cache_key, attempts + 1, 60)  # 1 minute
        
        return None
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class SecurityLoggingMiddleware(MiddlewareMixin):
    """
    Security event logging middleware
    """
    
    def process_request(self, request):
        # Log suspicious requests
        if self.is_suspicious_request(request):
            logger.warning(f"Suspicious request detected: {request.method} {request.path} from {self.get_client_ip(request)}")
        
        return None
    
    def process_response(self, request, response):
        # Log security events
        if response.status_code in [401, 403, 429]:
            logger.info(f"Security event: {response.status_code} for {request.method} {request.path} from {self.get_client_ip(request)}")
        
        return response
    
    def is_suspicious_request(self, request):
        """Check if request is suspicious"""
        suspicious_patterns = [
            'admin',
            'wp-admin',
            'phpmyadmin',
            'config',
            'backup',
            'test',
            'debug',
            'shell',
            'cmd',
            'exec',
            'eval',
            'script',
            'javascript:',
            'data:',
            '<script',
            '<?php',
            'SELECT',
            'INSERT',
            'UPDATE',
            'DELETE',
            'DROP',
            'UNION',
            'OR 1=1',
            'AND 1=1'
        ]
        
        path = request.path.lower()
        query = request.GET.urlencode().lower()
        
        for pattern in suspicious_patterns:
            if pattern in path or pattern in query:
                return True
        
        return False
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip