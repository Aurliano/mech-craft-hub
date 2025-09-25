"""
Google Generative AI (Gemini) integration for automated support responses
"""

import os
import json
import logging
from typing import Dict, Any, Optional
from django.conf import settings

logger = logging.getLogger(__name__)

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning("Google Generative AI library not installed. Install with: pip install google-generativeai")


class GeminiAISupport:
    """Google Gemini AI integration for automated support responses"""
    
    def __init__(self):
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None)
        self.model_name = getattr(settings, 'GEMINI_MODEL_NAME', 'gemini-1.5-flash')
        self.enabled = GEMINI_AVAILABLE and bool(self.api_key)
        
        if self.enabled:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
        else:
            logger.warning("Gemini AI not configured or not available")
    
    def get_system_prompt(self) -> str:
        """Get the system prompt for the AI assistant"""
        return """
شما یک پشتیبان هوش مصنوعی پلتفرم سایدا هستید. پلتفرم سایدا یک پلتفرم تخصصی برای خدمات مهندسی مکانیک است که شامل:

**خدمات اصلی:**
- طراحی و مدلسازی 3D (CAD)
- تحلیل مهندسی (FEA, CFD)
- شبیه‌سازی و بهینه‌سازی
- خدمات ساخت و تولید
- مشاوره مهندسی

**نرم‌افزارهای پشتیبانی شده:**
- SolidWorks, CATIA, Inventor, AutoCAD
- ANSYS, Abaqus, COMSOL
- MATLAB, Simulink
- ADAMS, MSC Software

**قوانین پاسخ‌دهی:**
1. فقط به سوالات مربوط به پلتفرم سایدا و خدمات مهندسی مکانیک پاسخ دهید
2. خود را به عنوان پشتیبان هوش مصنوعی سایدا معرفی کنید
3. پاسخ‌ها را به فارسی و با لحن دوستانه و حرفه‌ای ارائه دهید
4. برای سوالات غیرمرتبط، مودبانه توضیح دهید که فقط در حوزه تخصصی خود پاسخ می‌دهید
5. در صورت نیاز، کاربر را به تیم پشتیبانی انسانی ارجاع دهید
6. از اطلاعات شخصی یا حساس کاربران استفاده نکنید

**نمونه پاسخ‌ها:**
- برای سوالات طراحی: "برای طراحی 3D، می‌توانید از خدمات مدلسازی ما استفاده کنید..."
- برای سوالات تحلیل: "برای تحلیل مهندسی، پلتفرم ما از نرم‌افزارهای پیشرفته استفاده می‌کند..."
- برای سوالات غیرمرتبط: "متأسفانه من فقط در حوزه خدمات مهندسی مکانیک و پلتفرم سایدا می‌توانم کمک کنم..."
"""

    def generate_response(self, user_input: str, user_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Generate AI response for user input
        
        Args:
            user_input: User's question or feedback
            user_context: Additional context about the user and their feedback
            
        Returns:
            Dict containing response, tokens used, and metadata
        """
        if not self.enabled:
            return {
                'response': 'متأسفانه سرویس پشتیبانی هوش مصنوعی در حال حاضر در دسترس نیست. لطفاً با تیم پشتیبانی تماس بگیرید.',
                'model_used': None,
                'prompt_tokens': 0,
                'response_tokens': 0,
                'error': 'Gemini AI not configured'
            }
        
        try:
            # Build context-aware prompt
            system_prompt = self.get_system_prompt()
            
            # Add user context if available
            context_info = ""
            if user_context:
                if user_context.get('used_services') is not None:
                    service_status = "بله" if user_context['used_services'] else "خیر"
                    context_info += f"کاربر از خدمات سایت استفاده کرده: {service_status}\n"
                
                if user_context.get('satisfaction_rating') is not None:
                    context_info += f"امتیاز رضایت کاربر: {user_context['satisfaction_rating']}/5\n"
                
                if user_context.get('personal_feedback'):
                    context_info += f"نظر شخصی کاربر: {user_context['personal_feedback']}\n"
            
            # Combine prompts
            full_prompt = f"{system_prompt}\n\n{context_info}\n\nسوال یا نظر کاربر: {user_input}"
            
            # Generate response
            response = self.model.generate_content(full_prompt)
            
            # Extract token usage if available
            prompt_tokens = 0
            response_tokens = 0
            
            if hasattr(response, 'usage_metadata'):
                prompt_tokens = response.usage_metadata.prompt_token_count
                response_tokens = response.usage_metadata.candidates_token_count
            
            return {
                'response': response.text,
                'model_used': self.model_name,
                'prompt_tokens': prompt_tokens,
                'response_tokens': response_tokens,
                'error': None
            }
            
        except Exception as e:
            logger.error(f"Error generating Gemini AI response: {str(e)}")
            return {
                'response': 'متأسفانه خطایی در تولید پاسخ رخ داده است. لطفاً دوباره تلاش کنید یا با تیم پشتیبانی تماس بگیرید.',
                'model_used': self.model_name,
                'prompt_tokens': 0,
                'response_tokens': 0,
                'error': str(e)
            }
    
    def is_available(self) -> bool:
        """Check if Gemini AI is available and configured"""
        return self.enabled
    
    def get_model_info(self) -> Dict[str, str]:
        """Get information about the configured model"""
        return {
            'model_name': self.model_name,
            'available': self.enabled,
            'api_configured': bool(self.api_key)
        }


# Global instance
gemini_ai = GeminiAISupport()


def get_ai_response(user_input: str, user_context: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Convenience function to get AI response
    
    Args:
        user_input: User's question or feedback
        user_context: Additional context about the user
        
    Returns:
        Dict containing AI response and metadata
    """
    return gemini_ai.generate_response(user_input, user_context)
