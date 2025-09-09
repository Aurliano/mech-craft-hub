from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from django.core.cache import cache
from django.conf import settings
import time


class CustomUserRateThrottle(UserRateThrottle):
    """
    Custom user rate throttle with different rates for different actions
    """
    scope = 'user'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }


class CustomAnonRateThrottle(AnonRateThrottle):
    """
    Custom anonymous rate throttle
    """
    scope = 'anon'
    
    def get_cache_key(self, request, view):
        ident = self.get_ident(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }


class BurstRateThrottle(UserRateThrottle):
    """
    Burst rate throttle for high-frequency operations
    """
    scope = 'burst'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }


class SustainedRateThrottle(UserRateThrottle):
    """
    Sustained rate throttle for long-term operations
    """
    scope = 'sustained'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }


class UploadRateThrottle(UserRateThrottle):
    """
    Special rate throttle for file uploads
    """
    scope = 'upload'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }


class LoginRateThrottle(AnonRateThrottle):
    """
    Special rate throttle for login attempts
    """
    scope = 'login'
    
    def get_cache_key(self, request, view):
        # Use IP address for login throttling
        ident = self.get_ident(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }


class APIRateThrottle(UserRateThrottle):
    """
    General API rate throttle
    """
    scope = 'api'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }
