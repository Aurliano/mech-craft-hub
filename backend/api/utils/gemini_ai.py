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
        Generate AI response for user input using enhanced system
        
        Args:
            user_input: User's question or feedback
            user_context: Additional context about the user and their feedback
            
        Returns:
            Dict containing response, tokens used, and metadata
        """
        # Import enhanced system
        from .gemini_ai_enhanced import get_enhanced_ai_response
        
        # Use enhanced system for better responses
        return get_enhanced_ai_response(user_input, user_context)
    
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
