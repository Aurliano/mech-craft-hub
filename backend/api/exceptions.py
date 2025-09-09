from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.http import Http404
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for better error responses
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        custom_response_data = {
            'error': True,
            'message': 'خطایی رخ داده است',
            'details': {},
            'code': response.status_code
        }
        
        # Handle different types of errors
        if isinstance(exc, ValidationError):
            custom_response_data['message'] = 'داده‌های ورودی نامعتبر است'
            custom_response_data['details'] = exc.message_dict if hasattr(exc, 'message_dict') else str(exc)
            
        elif isinstance(exc, IntegrityError):
            custom_response_data['message'] = 'خطای یکپارچگی داده‌ها'
            custom_response_data['details'] = 'داده‌های تکراری یا نامعتبر'
            
        elif isinstance(exc, Http404):
            custom_response_data['message'] = 'منبع مورد نظر یافت نشد'
            custom_response_data['details'] = 'آدرس درخواست شده وجود ندارد'
            
        elif response.status_code == 400:
            custom_response_data['message'] = 'درخواست نامعتبر'
            if hasattr(exc, 'detail'):
                custom_response_data['details'] = exc.detail
                
        elif response.status_code == 401:
            custom_response_data['message'] = 'احراز هویت مورد نیاز است'
            custom_response_data['details'] = 'لطفاً وارد شوید'
            
        elif response.status_code == 403:
            custom_response_data['message'] = 'دسترسی غیرمجاز'
            custom_response_data['details'] = 'شما مجاز به انجام این عمل نیستید'
            
        elif response.status_code == 404:
            custom_response_data['message'] = 'منبع یافت نشد'
            custom_response_data['details'] = 'آیتم مورد نظر وجود ندارد'
            
        elif response.status_code == 405:
            custom_response_data['message'] = 'روش درخواست مجاز نیست'
            custom_response_data['details'] = 'این عملیات برای این منبع پشتیبانی نمی‌شود'
            
        elif response.status_code == 429:
            custom_response_data['message'] = 'تعداد درخواست‌ها بیش از حد مجاز'
            custom_response_data['details'] = 'لطفاً کمی صبر کنید و دوباره تلاش کنید'
            
        elif response.status_code >= 500:
            custom_response_data['message'] = 'خطای سرور'
            custom_response_data['details'] = 'خطای داخلی سرور رخ داده است'
            
        # Log the error
        logger.error(f"API Error: {exc}", exc_info=True, extra={'context': context})
        
        # Override the response data
        response.data = custom_response_data
        
    return response


class APIException(Exception):
    """
    Base exception for API errors
    """
    status_code = status.HTTP_400_BAD_REQUEST
    message = 'خطای API'
    details = None
    
    def __init__(self, message=None, details=None, status_code=None):
        if message:
            self.message = message
        if details:
            self.details = details
        if status_code:
            self.status_code = status_code
        super().__init__(self.message)


class ValidationException(APIException):
    """
    Exception for validation errors
    """
    status_code = status.HTTP_400_BAD_REQUEST
    message = 'داده‌های ورودی نامعتبر است'
    
    def __init__(self, message=None, details=None):
        super().__init__(message or self.message, details, self.status_code)


class NotFoundException(APIException):
    """
    Exception for not found errors
    """
    status_code = status.HTTP_404_NOT_FOUND
    message = 'منبع مورد نظر یافت نشد'
    
    def __init__(self, message=None, details=None):
        super().__init__(message or self.message, details, self.status_code)


class PermissionException(APIException):
    """
    Exception for permission errors
    """
    status_code = status.HTTP_403_FORBIDDEN
    message = 'دسترسی غیرمجاز'
    
    def __init__(self, message=None, details=None):
        super().__init__(message or self.message, details, self.status_code)


class BusinessLogicException(APIException):
    """
    Exception for business logic errors
    """
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    message = 'خطای منطق کسب‌وکار'
    
    def __init__(self, message=None, details=None):
        super().__init__(message or self.message, details, self.status_code)


class RateLimitException(APIException):
    """
    Exception for rate limit errors
    """
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    message = 'تعداد درخواست‌ها بیش از حد مجاز'
    
    def __init__(self, message=None, details=None):
        super().__init__(message or self.message, details, self.status_code)
