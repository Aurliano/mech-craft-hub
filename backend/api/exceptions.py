from rest_framework.views import exception_handler
from rest_framework import status
from rest_framework.exceptions import ValidationError as DRFValidationError
from django.core.exceptions import ValidationError
from django.db import IntegrityError, OperationalError, DatabaseError
from django.http import Http404
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated, PermissionDenied, NotFound
import logging
import json

logger = logging.getLogger(__name__)


def translate_error_message(error_detail):
    """
    Translate common error messages to Persian
    """
    if isinstance(error_detail, dict):
        translated = {}
        for key, value in error_detail.items():
            if isinstance(value, list):
                translated[key] = [translate_error_message(item) for item in value]
            elif isinstance(value, dict):
                translated[key] = translate_error_message(value)
            else:
                translated[key] = translate_error_message(value)
        return translated
    elif isinstance(error_detail, list):
        return [translate_error_message(item) for item in error_detail]
    elif isinstance(error_detail, str):
        # Translate common English error messages
        translations = {
            'Invalid username or password': 'نام کاربری یا رمز عبور اشتباه است',
            'Invalid credentials': 'نام کاربری یا رمز عبور اشتباه است',
            'Authentication credentials were not provided': 'لطفاً وارد حساب کاربری خود شوید',
            'You do not have permission to perform this action': 'شما مجاز به انجام این عمل نیستید',
            'Not found': 'یافت نشد',
            'This field is required': 'این فیلد الزامی است',
            'This field may not be blank': 'این فیلد نمی‌تواند خالی باشد',
            'Enter a valid email address': 'لطفاً یک ایمیل معتبر وارد کنید',
            'Enter a valid phone number': 'لطفاً یک شماره تلفن معتبر وارد کنید',
            'File upload failed': 'آپلود فایل ناموفق بود',
            'Connection error': 'خطا در اتصال به سرور',
            'Server error': 'خطای سرور',
            'Network error': 'خطا در ارتباط با سرور',
            'Timeout': 'زمان درخواست به پایان رسید',
            'Service temporarily unavailable': 'سرویس موقتاً در دسترس نیست',
            'This feature is under development': 'این بخش در حال توسعه می‌باشد',
        }
        
        # Check for partial matches
        for english_msg, persian_msg in translations.items():
            if english_msg.lower() in error_detail.lower():
                return persian_msg
        
        return error_detail
    return error_detail


def format_validation_errors(error_detail):
    """
    Format validation errors in a user-friendly way
    """
    if isinstance(error_detail, dict):
        messages = []
        for field, errors in error_detail.items():
            if isinstance(errors, list):
                for error in errors:
                    if isinstance(error, dict):
                        messages.append(format_validation_errors(error))
                    else:
                        field_name = field.replace('_', ' ')
                        messages.append(f"{field_name}: {error}")
            elif isinstance(errors, dict):
                messages.append(format_validation_errors(errors))
            else:
                field_name = field.replace('_', ' ')
                messages.append(f"{field_name}: {errors}")
        return ' | '.join(messages)
    elif isinstance(error_detail, list):
        return ' | '.join([str(e) for e in error_detail])
    return str(error_detail)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for better error responses with Persian messages
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        custom_response_data = {
            'error': True,
            'message': 'خطایی رخ داده است',
            'details': '',
            'code': response.status_code
        }
        
        # Get original error detail
        original_detail = response.data.get('detail', response.data) if hasattr(response, 'data') else str(exc)
        
        # Handle different types of errors
        if isinstance(exc, (ValidationError, DRFValidationError)):
            custom_response_data['message'] = 'داده‌های ورودی نامعتبر است'
            if hasattr(exc, 'detail'):
                error_detail = exc.detail
            elif hasattr(exc, 'message_dict'):
                error_detail = exc.message_dict
            else:
                error_detail = str(exc)
            
            formatted_errors = format_validation_errors(error_detail)
            custom_response_data['details'] = translate_error_message(formatted_errors)
            custom_response_data['code'] = 'validation_error'
            
        elif isinstance(exc, IntegrityError):
            error_msg = str(exc)
            if 'foreign key constraint' in error_msg.lower():
                custom_response_data['message'] = 'خطا در ارتباط داده‌ها'
                custom_response_data['details'] = 'اطلاعات ارسالی با داده‌های موجود همخوانی ندارد'
            elif 'unique constraint' in error_msg.lower() or 'duplicate' in error_msg.lower():
                custom_response_data['message'] = 'اطلاعات تکراری'
                custom_response_data['details'] = 'این اطلاعات قبلاً ثبت شده است'
            else:
                custom_response_data['message'] = 'خطای یکپارچگی داده‌ها'
                custom_response_data['details'] = 'داده‌های ارسالی نامعتبر است'
            custom_response_data['code'] = 'integrity_error'
            
        elif isinstance(exc, (OperationalError, DatabaseError)):
            custom_response_data['message'] = 'خطا در اتصال به پایگاه داده'
            custom_response_data['details'] = 'لطفاً دوباره تلاش کنید'
            custom_response_data['code'] = 'database_error'
            
        elif isinstance(exc, Http404) or isinstance(exc, NotFound):
            custom_response_data['message'] = 'منبع مورد نظر یافت نشد'
            custom_response_data['details'] = 'آیتم درخواستی وجود ندارد'
            custom_response_data['code'] = 'not_found'
            
        elif response.status_code == 400:
            custom_response_data['message'] = 'درخواست نامعتبر'
            if hasattr(exc, 'detail'):
                detail = exc.detail
                if isinstance(detail, dict):
                    formatted = format_validation_errors(detail)
                    custom_response_data['details'] = translate_error_message(formatted)
                elif isinstance(detail, list):
                    custom_response_data['details'] = translate_error_message(' | '.join([str(d) for d in detail]))
                else:
                    custom_response_data['details'] = translate_error_message(str(detail))
            else:
                custom_response_data['details'] = 'لطفاً اطلاعات را به درستی وارد کنید'
            custom_response_data['code'] = 'bad_request'
                
        elif response.status_code == 401:
            custom_response_data['message'] = 'احراز هویت مورد نیاز است'
            custom_response_data['details'] = 'لطفاً وارد حساب کاربری خود شوید'
            
            # Handle JWT specific errors
            if isinstance(exc, (InvalidToken, TokenError)):
                custom_response_data['message'] = 'توکن نامعتبر است'
                custom_response_data['details'] = 'لطفاً دوباره وارد شوید'
                custom_response_data['code'] = 'token_invalid'
            elif isinstance(exc, AuthenticationFailed):
                custom_response_data['message'] = 'نام کاربری یا رمز عبور اشتباه است'
                custom_response_data['details'] = 'لطفاً اطلاعات ورود خود را بررسی کنید'
                custom_response_data['code'] = 'authentication_failed'
            elif isinstance(exc, NotAuthenticated):
                custom_response_data['message'] = 'احراز هویت مورد نیاز است'
                custom_response_data['details'] = 'لطفاً وارد حساب کاربری خود شوید'
                custom_response_data['code'] = 'not_authenticated'
            
        elif response.status_code == 403 or isinstance(exc, PermissionDenied):
            custom_response_data['message'] = 'دسترسی غیرمجاز'
            custom_response_data['details'] = 'شما مجاز به انجام این عمل نیستید'
            custom_response_data['code'] = 'permission_denied'
            
        elif response.status_code == 404:
            custom_response_data['message'] = 'منبع یافت نشد'
            custom_response_data['details'] = 'آیتم مورد نظر وجود ندارد'
            custom_response_data['code'] = 'not_found'
            
        elif response.status_code == 405:
            custom_response_data['message'] = 'روش درخواست مجاز نیست'
            custom_response_data['details'] = 'این عملیات برای این منبع پشتیبانی نمی‌شود'
            custom_response_data['code'] = 'method_not_allowed'
            
        elif response.status_code == 408:
            custom_response_data['message'] = 'زمان درخواست به پایان رسید'
            custom_response_data['details'] = 'لطفاً دوباره تلاش کنید'
            custom_response_data['code'] = 'timeout'
            
        elif response.status_code == 413:
            custom_response_data['message'] = 'حجم فایل بیش از حد مجاز است'
            custom_response_data['details'] = 'لطفاً فایل کوچکتری انتخاب کنید'
            custom_response_data['code'] = 'file_too_large'
            
        elif response.status_code == 415:
            custom_response_data['message'] = 'نوع فایل پشتیبانی نمی‌شود'
            custom_response_data['details'] = 'لطفاً فایل با فرمت مناسب ارسال کنید'
            custom_response_data['code'] = 'unsupported_media_type'
            
        elif response.status_code == 422:
            custom_response_data['message'] = 'داده‌های ارسالی قابل پردازش نیست'
            custom_response_data['details'] = 'لطفاً اطلاعات را بررسی و دوباره ارسال کنید'
            custom_response_data['code'] = 'unprocessable_entity'
            
        elif response.status_code == 429:
            custom_response_data['message'] = 'تعداد درخواست‌ها بیش از حد مجاز'
            custom_response_data['details'] = 'لطفاً کمی صبر کنید و دوباره تلاش کنید'
            custom_response_data['code'] = 'rate_limit_exceeded'
            
        elif response.status_code == 503:
            custom_response_data['message'] = 'سرویس موقتاً در دسترس نیست'
            custom_response_data['details'] = 'لطفاً بعداً تلاش کنید'
            custom_response_data['code'] = 'service_unavailable'
            
        elif response.status_code >= 500:
            custom_response_data['message'] = 'خطای سرور'
            custom_response_data['details'] = 'خطای داخلی سرور رخ داده است. لطفاً بعداً تلاش کنید'
            custom_response_data['code'] = 'server_error'
        
        # Handle non_field_errors specially (highest priority - override other messages)
        if isinstance(original_detail, dict) and 'non_field_errors' in original_detail:
            non_field_errors = original_detail['non_field_errors']
            if isinstance(non_field_errors, list) and len(non_field_errors) > 0:
                error_msg = non_field_errors[0]
                # Make sure it's a string and translate it
                if isinstance(error_msg, str):
                    custom_response_data['message'] = translate_error_message(error_msg)
                else:
                    custom_response_data['message'] = translate_error_message(str(error_msg))
                custom_response_data['details'] = ''
        # Also check in response.data directly
        elif isinstance(response.data, dict) and 'non_field_errors' in response.data:
            non_field_errors = response.data['non_field_errors']
            if isinstance(non_field_errors, list) and len(non_field_errors) > 0:
                error_msg = non_field_errors[0]
                if isinstance(error_msg, str):
                    custom_response_data['message'] = translate_error_message(error_msg)
                else:
                    custom_response_data['message'] = translate_error_message(str(error_msg))
                custom_response_data['details'] = ''
        
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
