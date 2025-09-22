import logging
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)

class JWTAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware to handle JWT token validation and automatic refresh
    """
    
    def process_request(self, request):
        # Skip for non-API requests
        if not request.path.startswith('/api/'):
            return None
            
        # Skip for authentication endpoints
        if request.path in ['/api/token/', '/api/token/refresh/', '/api/v1/auth/login/', '/api/v1/auth/register/']:
            return None
            
        # Check if Authorization header exists
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None
            
        # Extract token
        token = auth_header.split(' ')[1] if len(auth_header.split(' ')) > 1 else None
        if not token:
            return None
            
        try:
            # Try to validate the token
            from rest_framework_simplejwt.authentication import JWTAuthentication
            jwt_auth = JWTAuthentication()
            validated_token = jwt_auth.get_validated_token(token)
            user = jwt_auth.get_user(validated_token)
            
            # Set user on request
            request.user = user
            
        except InvalidToken as e:
            # Log the error but don't block the request
            logger.warning(f"Invalid JWT token: {str(e)}")
            return None
        except TokenError as e:
            # Log the error but don't block the request
            logger.warning(f"JWT token error: {str(e)}")
            return None
        except Exception as e:
            # Log unexpected errors
            logger.error(f"Unexpected JWT error: {str(e)}")
            return None
            
        return None
