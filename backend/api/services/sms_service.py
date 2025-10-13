"""
SMS Service for sending verification codes and notifications
Using SMS.ir API for sending SMS messages
"""

import os
import requests
import logging
from typing import Dict, Any
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)


class SMSService:
    """SMS Service using SMS.ir API"""
    
    def __init__(self):
        self.api_key = getattr(settings, 'SMS_KEY', None)
        self.base_url = getattr(settings, 'SMS_API_BASE_URL', 'https://api.sms.ir/v1')
        self.timeout = getattr(settings, 'SMS_API_TIMEOUT', 30)
        self.sender = getattr(settings, 'SMS_SENDER', None)
        
        if not self.api_key:
            logger.error("SMS_KEY not configured in settings")
        
        if not self.sender:
            logger.warning("SMS_SENDER not configured in settings")
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for SMS.ir API requests"""
        return {
            'Accept': 'application/json',
            'X-API-KEY': self.api_key,
            'Content-Type': 'application/json'
        }
    
    def _format_phone_number(self, phone: str) -> str:
        """Format phone number for SMS.ir API"""
        # Remove any non-digit characters
        phone = ''.join(filter(str.isdigit, phone))
        
        # Add country code if not present
        if phone.startswith('0'):
            phone = '98' + phone[1:]
        elif not phone.startswith('98'):
            phone = '98' + phone
            
        return phone
    
    def send_verification_code(self, phone: str, code: str, template_id: int = None) -> Dict[str, Any]:
        """
        Send verification code SMS using SMS.ir verify endpoint
        
        Args:
            phone: Phone number to send SMS to
            code: Verification code to send
            template_id: Template ID from SMS.ir panel (optional)
            
        Returns:
            Dict with success status and response data
        """
        if not self.api_key:
            logger.error("SMS_KEY not configured")
            return {
                'success': False,
                'error': 'SMS service not configured',
                'message': 'سرویس پیامک پیکربندی نشده است'
            }
        
        try:
            formatted_phone = self._format_phone_number(phone)
            
            # Use verify endpoint if template_id is provided
            if template_id:
                return self._send_verify_sms(formatted_phone, code, template_id)
            else:
                # Use regular send endpoint
                return self._send_regular_sms(formatted_phone, code)
                
        except Exception as e:
            logger.error(f"Error sending verification SMS: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'خطا در ارسال پیامک'
            }
    
    def _send_verify_sms(self, phone: str, code: str, template_id: int) -> Dict[str, Any]:
        """Send SMS using verify endpoint with template"""
        url = f"{self.base_url}/send/verify"
        
        payload = {
            "mobile": phone,
            "templateId": template_id,
            "parameters": [
                {
                    "name": "Code",
                    "value": code
                }
            ]
        }
        
        try:
            response = requests.post(
                url,
                json=payload,
                headers=self._get_headers(),
                timeout=self.timeout
            )
            
            response_data = response.json()
            
            if response.status_code == 200 and response_data.get('status') == 1:
                logger.info(f"Verification SMS sent successfully to {phone}")
                return {
                    'success': True,
                    'message_id': response_data.get('data', {}).get('messageId'),
                    'cost': response_data.get('data', {}).get('cost'),
                    'message': 'پیامک با موفقیت ارسال شد'
                }
            elif response.status_code == 400:
                logger.error(f"SMS.ir API logical error: {response_data}")
                return {
                    'success': False,
                    'error': response_data.get('message', 'خطای منطقی'),
                    'message': 'خطای منطقی در ارسال پیامک'
                }
            elif response.status_code == 401:
                logger.error(f"SMS.ir API authentication error: {response_data}")
                return {
                    'success': False,
                    'error': response_data.get('message', 'خطای احراز هویت'),
                    'message': 'خطای احراز هویت در ارسال پیامک'
                }
            elif response.status_code == 429:
                logger.error(f"SMS.ir API rate limit exceeded: {response_data}")
                return {
                    'success': False,
                    'error': response_data.get('message', 'تعداد درخواست غیر مجاز'),
                    'message': 'تعداد درخواست‌های ارسال پیامک بیش از حد مجاز است'
                }
            else:
                logger.error(f"SMS.ir API error: {response_data}")
                return {
                    'success': False,
                    'error': response_data.get('message', 'خطای ناشناخته'),
                    'message': 'خطای سیستمی در ارسال پیامک'
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error sending SMS: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'خطا در ارتباط با سرویس پیامک'
            }
    
    def _send_regular_sms(self, phone: str, code: str) -> Dict[str, Any]:
        """Send SMS using regular send endpoint"""
        url = f"{self.base_url}/send"
        
        # Create message text
        message = f"کد تأیید شما: {code}\nاین کد تا 2 دقیقه معتبر است.\nمک کرفت هاب"
        
        # Get SMS sender line from settings
        line = getattr(settings, 'SMS_SENDER', '')
        
        # According to SMS.ir docs
        payload = {
            "mobile": phone,
            "message": message,
            "lineNumber": line,  # SMS sender number
            "sendDateTime": None  # Send immediately
        }
        
        try:
            response = requests.post(
                url,
                json=payload,
                headers=self._get_headers(),
                timeout=self.timeout
            )
            
            response_data = response.json()
            
            if response.status_code == 200 and response_data.get('status') == 1:
                logger.info(f"Regular SMS sent successfully to {phone}")
                return {
                    'success': True,
                    'message_id': response_data.get('data', {}).get('messageId'),
                    'cost': response_data.get('data', {}).get('cost'),
                    'message': 'پیامک با موفقیت ارسال شد'
                }
            else:
                logger.error(f"SMS.ir API error: {response_data}")
                return {
                    'success': False,
                    'error': response_data.get('message', 'Unknown error'),
                    'message': 'خطا در ارسال پیامک'
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error sending SMS: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'خطا در ارتباط با سرویس پیامک'
            }
    
    def send_password_reset_code(self, phone: str, code: str, template_id: int = None) -> Dict[str, Any]:
        """
        Send password reset code SMS
        
        Args:
            phone: Phone number to send SMS to
            code: Reset code to send
            template_id: Template ID from SMS.ir panel (optional)
            
        Returns:
            Dict with success status and response data
        """
        if not self.api_key:
            logger.error("SMS_KEY not configured")
            return {
                'success': False,
                'error': 'SMS service not configured',
                'message': 'سرویس پیامک پیکربندی نشده است'
            }
        
        try:
            formatted_phone = self._format_phone_number(phone)
            
            if template_id:
                return self._send_password_reset_template(formatted_phone, code, template_id)
            else:
                return self._send_password_reset_regular(formatted_phone, code)
                
        except Exception as e:
            logger.error(f"Error sending password reset SMS: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'خطا در ارسال پیامک'
            }
    
    def _send_password_reset_template(self, phone: str, code: str, template_id: int) -> Dict[str, Any]:
        """Send password reset SMS using template"""
        url = f"{self.base_url}/send/verify"
        
        payload = {
            "mobile": phone,
            "templateId": template_id,
            "parameters": [
                {
                    "name": "Code",
                    "value": code
                }
            ]
        }
        
        try:
            response = requests.post(
                url,
                json=payload,
                headers=self._get_headers(),
                timeout=self.timeout
            )
            
            response_data = response.json()
            
            if response.status_code == 200 and response_data.get('status') == 1:
                logger.info(f"Password reset SMS sent successfully to {phone}")
                return {
                    'success': True,
                    'message_id': response_data.get('data', {}).get('messageId'),
                    'cost': response_data.get('data', {}).get('cost'),
                    'message': 'پیامک بازیابی رمز عبور ارسال شد'
                }
            else:
                logger.error(f"SMS.ir API error: {response_data}")
                return {
                    'success': False,
                    'error': response_data.get('message', 'Unknown error'),
                    'message': 'خطا در ارسال پیامک'
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error sending password reset SMS: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'خطا در ارتباط با سرویس پیامک'
            }
    
    def _send_password_reset_regular(self, phone: str, code: str) -> Dict[str, Any]:
        """Send password reset SMS using regular endpoint"""
        url = f"{self.base_url}/send"
        
        message = f"کد بازیابی رمز عبور: {code}\nاین کد تا 10 دقیقه معتبر است.\nمک کرفت هاب"
        
        # Get SMS sender line from settings
        line = getattr(settings, 'SMS_SENDER', '')
        
        # According to SMS.ir docs
        payload = {
            "mobile": phone,
            "message": message,
            "lineNumber": line,
            "sendDateTime": None  # Send immediately
        }
        
        try:
            response = requests.post(
                url,
                json=payload,
                headers=self._get_headers(),
                timeout=self.timeout
            )
            
            response_data = response.json()
            
            if response.status_code == 200 and response_data.get('status') == 1:
                logger.info(f"Password reset SMS sent successfully to {phone}")
                return {
                    'success': True,
                    'message_id': response_data.get('data', {}).get('messageId'),
                    'cost': response_data.get('data', {}).get('cost'),
                    'message': 'پیامک بازیابی رمز عبور ارسال شد'
                }
            else:
                logger.error(f"SMS.ir API error: {response_data}")
                return {
                    'success': False,
                    'error': response_data.get('message', 'Unknown error'),
                    'message': 'خطا در ارسال پیامک'
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error sending password reset SMS: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'خطا در ارتباط با سرویس پیامک'
            }
    
    def get_credit(self) -> Dict[str, Any]:
        """Get SMS credit balance"""
        if not self.api_key:
            return {
                'success': False,
                'error': 'SMS service not configured'
            }
        
        url = f"{self.base_url}/credit"
        
        try:
            response = requests.get(
                url,
                headers=self._get_headers(),
                timeout=self.timeout
            )
            
            response_data = response.json()
            
            if response.status_code == 200 and response_data.get('status') == 1:
                return {
                    'success': True,
                    'credit': response_data.get('data', {}).get('credit', 0),
                    'message': 'اعتبار دریافت شد'
                }
            else:
                return {
                    'success': False,
                    'error': response_data.get('message', 'Unknown error')
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error getting SMS credit: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def rate_limit_check(self, phone: str, action: str = 'verification') -> bool:
        """
        Check if phone number is rate limited
        
        Args:
            phone: Phone number to check
            action: Type of action (verification, password_reset)
            
        Returns:
            True if rate limited, False otherwise
        """
        cache_key = f"sms_rate_limit_{action}_{phone}"
        
        # Check if phone is rate limited
        if cache.get(cache_key):
            return True
        
        # Set rate limit (5 minutes for verification, 10 minutes for password reset)
        timeout = 300 if action == 'verification' else 600
        cache.set(cache_key, True, timeout)
        
        return False


# Global SMS service instance
sms_service = SMSService()
