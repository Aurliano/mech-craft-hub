import logging
from datetime import datetime
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)
User = get_user_model()

class JWTManager:
    """
    Utility class for managing JWT tokens
    """
    
    @staticmethod
    def create_tokens_for_user(user):
        """
        Create access and refresh tokens for a user
        """
        try:
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token
            
            return {
                'access': str(access),
                'refresh': str(refresh),
                'access_expires': access['exp'],
                'refresh_expires': refresh['exp']
            }
        except Exception as e:
            logger.error(f"Error creating tokens for user {user.id}: {str(e)}")
            raise
    
    @staticmethod
    def validate_token(token):
        """
        Validate a JWT token
        """
        try:
            access_token = AccessToken(token)
            return {
                'valid': True,
                'user_id': access_token['user_id'],
                'expires': access_token['exp'],
                'is_expired': access_token['exp'] < datetime.now().timestamp()
            }
        except InvalidToken as e:
            logger.warning(f"Invalid token: {str(e)}")
            return {
                'valid': False,
                'error': 'invalid_token',
                'message': str(e)
            }
        except TokenError as e:
            logger.warning(f"Token error: {str(e)}")
            return {
                'valid': False,
                'error': 'token_error',
                'message': str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected token validation error: {str(e)}")
            return {
                'valid': False,
                'error': 'unexpected_error',
                'message': 'خطای غیرمنتظره در اعتبارسنجی توکن'
            }
    
    @staticmethod
    def refresh_access_token(refresh_token):
        """
        Refresh an access token using refresh token
        """
        try:
            refresh = RefreshToken(refresh_token)
            access = refresh.access_token
            
            return {
                'success': True,
                'access': str(access),
                'access_expires': access['exp']
            }
        except InvalidToken as e:
            logger.warning(f"Invalid refresh token: {str(e)}")
            return {
                'success': False,
                'error': 'invalid_refresh_token',
                'message': 'توکن تازه‌سازی نامعتبر است'
            }
        except TokenError as e:
            logger.warning(f"Refresh token error: {str(e)}")
            return {
                'success': False,
                'error': 'refresh_token_error',
                'message': 'خطا در تازه‌سازی توکن'
            }
        except Exception as e:
            logger.error(f"Unexpected refresh token error: {str(e)}")
            return {
                'success': False,
                'error': 'unexpected_error',
                'message': 'خطای غیرمنتظره در تازه‌سازی توکن'
            }
    
    @staticmethod
    def get_user_from_token(token):
        """
        Get user from JWT token
        """
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            user = User.objects.get(id=user_id)
            return {
                'success': True,
                'user': user
            }
        except User.DoesNotExist:
            logger.warning("User not found for token")
            return {
                'success': False,
                'error': 'user_not_found',
                'message': 'کاربر یافت نشد'
            }
        except InvalidToken as e:
            logger.warning(f"Invalid token for user lookup: {str(e)}")
            return {
                'success': False,
                'error': 'invalid_token',
                'message': 'توکن نامعتبر است'
            }
        except Exception as e:
            logger.error(f"Unexpected error getting user from token: {str(e)}")
            return {
                'success': False,
                'error': 'unexpected_error',
                'message': 'خطای غیرمنتظره در دریافت کاربر'
            }
    
    @staticmethod
    def is_token_expired(token):
        """
        Check if token is expired
        """
        try:
            access_token = AccessToken(token)
            return access_token['exp'] < datetime.now().timestamp()
        except Exception:
            return True
