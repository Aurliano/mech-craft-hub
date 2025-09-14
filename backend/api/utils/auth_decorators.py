from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .jwt_utils import JWTManager
import logging

logger = logging.getLogger(__name__)

def jwt_required(view_func):
    """
    Decorator to ensure JWT authentication is required
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return Response({
                'error': True,
                'message': 'احراز هویت مورد نیاز است',
                'details': 'لطفاً وارد شوید',
                'code': 'authentication_required'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if token is valid
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            token_validation = JWTManager.validate_token(token)
            
            if not token_validation['valid']:
                return Response({
                    'error': True,
                    'message': 'توکن نامعتبر است',
                    'details': 'لطفاً دوباره وارد شوید',
                    'code': 'invalid_token'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            if token_validation.get('is_expired', False):
                return Response({
                    'error': True,
                    'message': 'توکن منقضی شده است',
                    'details': 'لطفاً دوباره وارد شوید',
                    'code': 'token_expired'
                }, status=status.HTTP_401_UNAUTHORIZED)
        
        return view_func(request, *args, **kwargs)
    
    return wrapper

def optional_jwt_auth(view_func):
    """
    Decorator for optional JWT authentication
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        # Try to authenticate if token is provided
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            token_validation = JWTManager.validate_token(token)
            
            if token_validation['valid'] and not token_validation.get('is_expired', False):
                # Token is valid, set user
                user_result = JWTManager.get_user_from_token(token)
                if user_result['success']:
                    request.user = user_result['user']
        
        return view_func(request, *args, **kwargs)
    
    return wrapper

def handle_jwt_errors(view_func):
    """
    Decorator to handle JWT errors gracefully
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        try:
            return view_func(request, *args, **kwargs)
        except InvalidToken as e:
            logger.warning(f"Invalid token in view {view_func.__name__}: {str(e)}")
            return Response({
                'error': True,
                'message': 'توکن نامعتبر است',
                'details': 'لطفاً دوباره وارد شوید',
                'code': 'invalid_token'
            }, status=status.HTTP_401_UNAUTHORIZED)
        except TokenError as e:
            logger.warning(f"Token error in view {view_func.__name__}: {str(e)}")
            return Response({
                'error': True,
                'message': 'خطا در توکن',
                'details': 'لطفاً دوباره وارد شوید',
                'code': 'token_error'
            }, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            logger.error(f"Unexpected error in view {view_func.__name__}: {str(e)}")
            return Response({
                'error': True,
                'message': 'خطای غیرمنتظره',
                'details': 'خطای داخلی سرور',
                'code': 'unexpected_error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return wrapper
