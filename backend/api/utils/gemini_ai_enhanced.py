"""
Google Generative AI (Gemini) integration for automated support responses
Enhanced with advanced prompt-tuning and context awareness
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List
from django.conf import settings
from django.contrib.auth import get_user_model
from api.models import Service, Scope, Order, OrderItem, Quote, Ticket, BlogPost

logger = logging.getLogger(__name__)
User = get_user_model()

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning("Google Generative AI library not installed. Install with: pip install google-generativeai")


class EnhancedGeminiAISupport:
    """Enhanced Google Gemini AI integration with advanced prompt-tuning and context awareness"""
    
    def __init__(self):
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None)
        self.model_name = getattr(settings, 'GEMINI_MODEL_NAME', 'gemini-1.5-flash')
        self.enabled = GEMINI_AVAILABLE and bool(self.api_key)
        
        if self.enabled:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
        else:
            logger.warning("Gemini AI not configured or not available")
    
    def get_enhanced_system_prompt(self) -> str:
        """Get the enhanced system prompt with specialized knowledge"""
        return """
شما یک پشتیبان هوش مصنوعی پیشرفته پلتفرم MechCraft Hub هستید. این پلتفرم یک اکوسیستم جامع مهندسی است که خدمات تخصصی در حوزه‌های مختلف مهندسی ارائه می‌دهد.

## 🏗️ حوزه‌های تخصصی پلتفرم:

### ۱. مکاترونیک (Mechatronics)
- سیستم‌های کنترل خودکار
- رباتیک و اتوماسیون صنعتی
- سنسورها و عملگرها
- سیستم‌های تعبیه شده
- کنترل حرکت و موقعیت‌یابی

### ۲. مهندسی مکانیک (Mechanical Engineering)
- طراحی و مدلسازی 3D (CAD)
- تحلیل مهندسی (FEA, CFD, Structural Analysis)
- شبیه‌سازی و بهینه‌سازی
- خدمات ساخت و تولید
- طراحی ماشین‌آلات و تجهیزات
- مکانیک سیالات و انتقال حرارت

### ۳. مهندسی کامپیوتر (Computer Engineering)
- طراحی سیستم‌های دیجیتال
- معماری کامپیوتر
- شبکه‌های کامپیوتری
- سیستم‌های تعبیه شده
- برنامه‌نویسی سیستم‌ها
- امنیت سایبری

### ۴. مهندسی برق و الکترونیک (Electrical & Electronics Engineering)
- طراحی مدارهای الکترونیکی
- سیستم‌های قدرت
- الکترونیک قدرت
- سیستم‌های کنترل
- مخابرات و سیگنال‌ها
- سیستم‌های انرژی تجدیدپذیر

### ۵. متاورس (Metaverse)
- واقعیت مجازی (VR) و واقعیت افزوده (AR)
- طراحی محیط‌های مجازی
- شبیه‌سازی تعاملی
- مدلسازی سه‌بعدی برای متاورس
- سیستم‌های تعامل انسان-کامپیوتر

## 🛠️ نرم‌افزارهای پشتیبانی شده:

### طراحی و مدلسازی:
- SolidWorks, CATIA, Inventor, AutoCAD, Fusion 360
- Blender, Maya, 3ds Max (برای متاورس)
- KiCad, Altium Designer (الکترونیک)

### تحلیل و شبیه‌سازی:
- ANSYS (FEA, CFD, Multiphysics)
- Abaqus, COMSOL Multiphysics
- MATLAB, Simulink
- ADAMS, MSC Software
- OpenFOAM (CFD)

### برنامه‌نویسی و توسعه:
- Python, C++, MATLAB
- Arduino, Raspberry Pi
- Unity, Unreal Engine (متاورس)
- ROS (Robot Operating System)

## 🔄 فرآیندهای پلتفرم:

### برای مشتریان (Customers):
1. **ثبت‌نام و احراز هویت**: ثبت‌نام با ایمیل و شماره تلفن
2. **انتخاب سرویس**: انتخاب از خدمات موجود در حوزه‌های مختلف
3. **ثبت سفارش**: پر کردن فرم سفارش با جزئیات پروژه
4. **دریافت پیشنهادات**: دریافت پیشنهادات قیمت از پیمانکاران
5. **انتخاب پیمانکار**: انتخاب بهترین پیشنهاد
6. **پرداخت**: پرداخت آنلاین یا انتقال بانکی
7. **پیگیری پروژه**: پیگیری پیشرفت پروژه از طریق تیکت‌ها
8. **دریافت فایل‌ها**: دریافت فایل‌های اولیه و نهایی
9. **ارزیابی**: ارزیابی کیفیت کار پیمانکار

### برای پیمانکاران (Contractors):
1. **ثبت‌نام پیمانکار**: ثبت‌نام توسط ادمین
2. **انتخاب حوزه تخصص**: انتخاب حوزه‌های کاری
3. **مشاهده سفارشات**: مشاهده سفارشات مرتبط با تخصص
4. **ارسال پیشنهاد**: ارسال پیشنهاد قیمت و زمان تحویل
5. **دریافت پروژه**: دریافت پروژه‌های تایید شده
6. **انجام کار**: انجام پروژه و ارسال فایل‌ها
7. **دریافت بازخورد**: دریافت نظرات و امتیازات

## 📋 انواع سرویس‌ها:

### ۱. طراحی (Design)
- طراحی مفهومی و اولیه
- مدلسازی سه‌بعدی دقیق
- طراحی پارامتری
- بهینه‌سازی طراحی

### ۲. تحلیل و شبیه‌سازی (Analysis & Simulation)
- تحلیل تنش و کرنش
- تحلیل حرارتی
- تحلیل دینامیکی
- شبیه‌سازی جریان سیال
- تحلیل ارتعاشات

### ۳. نقشه‌کشی (Technical Drawing)
- نقشه‌های فنی استاندارد
- نقشه‌های مونتاژ
- نقشه‌های انفجاری
- نقشه‌های جوشکاری
- تلرانس‌های GD&T

### ۴. ساخت و تولید (Manufacturing)
- ماشین‌کاری CNC
- چاپ سه‌بعدی
- قالب‌سازی
- مونتاژ و تست
- کنترل کیفیت

## 🎯 قوانین پاسخ‌دهی:

1. **تخصصی بودن**: فقط به سوالات مربوط به حوزه‌های مهندسی و پلتفرم پاسخ دهید
2. **دقت فنی**: پاسخ‌ها باید از نظر فنی دقیق و قابل اعتماد باشند
3. **راهنمایی عملی**: راهنمایی‌های عملی و قابل اجرا ارائه دهید
4. **آگاهی از پلتفرم**: از قابلیت‌ها و فرآیندهای پلتفرم آگاه باشید
5. **حفظ حریم خصوصی**: از اطلاعات شخصی کاربران استفاده نکنید
6. **ارجاع مناسب**: در صورت نیاز، کاربر را به منابع مناسب ارجاع دهید
7. **زبان فارسی**: پاسخ‌ها را به فارسی و با لحن حرفه‌ای ارائه دهید

## 🔍 نمونه پاسخ‌های تخصصی:

### برای سوالات طراحی مکانیکی:
"برای طراحی قطعه مکانیکی، ابتدا باید مشخصات عملکردی، محدودیت‌های فضایی و شرایط کاری را تعریف کنید. سپس می‌توانید از خدمات طراحی سه‌بعدی ما استفاده کنید که شامل مدلسازی پارامتری، تحلیل تنش و بهینه‌سازی طراحی است."

### برای سوالات تحلیل مهندسی:
"تحلیل مهندسی شامل بررسی رفتار قطعه تحت بارهای مختلف است. ما از نرم‌افزارهای پیشرفته مانند ANSYS و COMSOL استفاده می‌کنیم تا تحلیل‌های FEA، CFD و Multiphysics انجام دهیم."

### برای سوالات متاورس:
"برای پروژه‌های متاورس، می‌توانیم محیط‌های مجازی تعاملی طراحی کنیم، مدل‌های سه‌بعدی بهینه‌سازی شده برای VR/AR ایجاد کنیم و سیستم‌های تعامل کاربر پیاده‌سازی کنیم."

### برای سوالات غیرمرتبط:
"متأسفانه من فقط در حوزه خدمات مهندسی و پلتفرم MechCraft Hub می‌توانم کمک کنم. برای سوالات دیگر، لطفاً با تیم پشتیبانی انسانی تماس بگیرید."
"""

    def get_context_aware_prompt(self, user_context: Dict[str, Any] = None) -> str:
        """Build context-aware prompt based on user information and platform state"""
        context_parts = []
        
        if user_context:
            # User authentication status
            if user_context.get('user_authenticated'):
                context_parts.append("کاربر وارد سیستم شده است.")
            else:
                context_parts.append("کاربر وارد سیستم نشده است.")
            
            # User role information
            if user_context.get('user_role'):
                role = user_context['user_role']
                if role == 'customer':
                    context_parts.append("کاربر یک مشتری است که می‌خواهد خدمات مهندسی سفارش دهد.")
                elif role == 'contractor':
                    context_parts.append("کاربر یک پیمانکار است که خدمات مهندسی ارائه می‌دهد.")
                elif role == 'admin':
                    context_parts.append("کاربر یک مدیر سیستم است.")
            
            # User's service history
            if user_context.get('used_services') is not None:
                if user_context['used_services']:
                    context_parts.append("کاربر قبلاً از خدمات پلتفرم استفاده کرده است.")
                else:
                    context_parts.append("کاربر هنوز از خدمات پلتفرم استفاده نکرده است.")
            
            # User's satisfaction rating
            if user_context.get('satisfaction_rating') is not None:
                rating = user_context['satisfaction_rating']
                context_parts.append(f"امتیاز رضایت کاربر: {rating}/5")
            
            # User's personal feedback
            if user_context.get('personal_feedback'):
                context_parts.append(f"نظر شخصی کاربر: {user_context['personal_feedback']}")
            
            # User's current orders
            if user_context.get('active_orders_count', 0) > 0:
                context_parts.append(f"کاربر {user_context['active_orders_count']} سفارش فعال دارد.")
            
            # User's expertise areas
            if user_context.get('expertise_areas'):
                areas = ', '.join(user_context['expertise_areas'])
                context_parts.append(f"حوزه‌های تخصصی کاربر: {areas}")
        
        # Platform statistics
        try:
            total_services = Service.objects.filter(is_active=True).count()
            total_scopes = Scope.objects.filter(is_active=True).count()
            context_parts.append(f"پلتفرم دارای {total_services} سرویس فعال در {total_scopes} حوزه تخصصی است.")
        except Exception as e:
            logger.warning(f"Could not fetch platform statistics: {e}")
        
        return "\n".join(context_parts) if context_parts else ""

    def get_specialized_knowledge_prompt(self, user_input: str) -> str:
        """Get specialized knowledge based on user input keywords"""
        knowledge_parts = []
        
        # Detect domain from user input
        input_lower = user_input.lower()
        
        # Mechatronics keywords
        if any(keyword in input_lower for keyword in ['مکاترونیک', 'ربات', 'کنترل', 'سنسور', 'عملگر', 'اتوماسیون']):
            knowledge_parts.append("""
## دانش تخصصی مکاترونیک:
- سیستم‌های مکاترونیک ترکیبی از مکانیک، الکترونیک و کامپیوتر هستند
- کنترل PID برای سیستم‌های مکاترونیک بسیار مهم است
- سنسورهای موقعیت، سرعت و نیرو در سیستم‌های مکاترونیک کاربرد دارند
- PLC و میکروکنترلرها برای کنترل سیستم‌های مکاترونیک استفاده می‌شوند
- نرم‌افزارهای MATLAB/Simulink برای شبیه‌سازی سیستم‌های مکاترونیک مناسب هستند
""")
        
        # Mechanical Engineering keywords
        if any(keyword in input_lower for keyword in ['مکانیک', 'طراحی', 'تحلیل', 'تنش', 'کرنش', 'fea', 'cfd']):
            knowledge_parts.append("""
## دانش تخصصی مهندسی مکانیک:
- تحلیل FEA برای بررسی تنش و کرنش در قطعات استفاده می‌شود
- تحلیل CFD برای بررسی جریان سیال و انتقال حرارت کاربرد دارد
- نرم‌افزارهای SolidWorks، ANSYS و COMSOL برای تحلیل مهندسی مناسب هستند
- استانداردهای ISO و ASME برای طراحی مهندسی مهم هستند
- تلرانس‌های GD&T برای کنترل ابعادی و هندسی ضروری هستند
""")
        
        # Computer Engineering keywords
        if any(keyword in input_lower for keyword in ['کامپیوتر', 'برنامه‌نویسی', 'شبکه', 'امنیت', 'سیستم']):
            knowledge_parts.append("""
## دانش تخصصی مهندسی کامپیوتر:
- طراحی سیستم‌های دیجیتال نیاز به دانش VHDL/Verilog دارد
- شبکه‌های کامپیوتری بر اساس پروتکل‌های TCP/IP کار می‌کنند
- امنیت سایبری شامل رمزنگاری، احراز هویت و کنترل دسترسی است
- سیستم‌های تعبیه شده نیاز به برنامه‌نویسی C/C++ دارند
- معماری کامپیوتر شامل CPU، حافظه و سیستم I/O است
""")
        
        # Electrical Engineering keywords
        if any(keyword in input_lower for keyword in ['برق', 'الکترونیک', 'مدار', 'قدرت', 'کنترل']):
            knowledge_parts.append("""
## دانش تخصصی مهندسی برق و الکترونیک:
- طراحی مدارهای الکترونیکی نیاز به دانش الکترونیک دیجیتال و آنالوگ دارد
- سیستم‌های قدرت شامل تولید، انتقال و توزیع انرژی الکتریکی هستند
- الکترونیک قدرت برای کنترل و تبدیل انرژی الکتریکی استفاده می‌شود
- نرم‌افزارهای KiCad، Altium Designer برای طراحی PCB مناسب هستند
- سیستم‌های کنترل برای تنظیم و بهینه‌سازی عملکرد سیستم‌ها کاربرد دارند
""")
        
        # Metaverse keywords
        if any(keyword in input_lower for keyword in ['متاورس', 'vr', 'ar', 'واقعیت مجازی', 'واقعیت افزوده']):
            knowledge_parts.append("""
## دانش تخصصی متاورس:
- واقعیت مجازی (VR) محیط‌های کاملاً مجازی ایجاد می‌کند
- واقعیت افزوده (AR) اطلاعات مجازی را روی دنیای واقعی قرار می‌دهد
- نرم‌افزارهای Unity و Unreal Engine برای توسعه متاورس مناسب هستند
- مدلسازی سه‌بعدی با Blender و Maya برای متاورس ضروری است
- سیستم‌های تعامل کاربر شامل کنترل‌های دستی و صوتی هستند
""")
        
        return "\n".join(knowledge_parts)

    def generate_enhanced_response(self, user_input: str, user_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Generate enhanced AI response with context awareness and specialized knowledge
        
        Args:
            user_input: User's question or feedback
            user_context: Additional context about the user and their situation
            
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
            # Build comprehensive prompt
            system_prompt = self.get_enhanced_system_prompt()
            context_info = self.get_context_aware_prompt(user_context)
            specialized_knowledge = self.get_specialized_knowledge_prompt(user_input)
            
            # Combine all prompt components
            full_prompt = f"""
{system_prompt}

{context_info}

{specialized_knowledge}

سوال یا نظر کاربر: {user_input}

لطفاً پاسخ جامع، دقیق و مفیدی ارائه دهید که:
1. مستقیماً به سوال کاربر پاسخ دهد
2. اطلاعات تخصصی و دقیق ارائه دهد
3. راهنمایی عملی و قابل اجرا بدهد
4. در صورت نیاز، کاربر را به منابع مناسب ارجاع دهد
5. لحن حرفه‌ای و دوستانه داشته باشد
"""
            
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
                'error': None,
                'context_used': bool(context_info),
                'specialized_knowledge_used': bool(specialized_knowledge)
            }
            
        except Exception as e:
            logger.error(f"Error generating enhanced Gemini AI response: {str(e)}")
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
            'api_configured': bool(self.api_key),
            'enhanced_features': True
        }


# Global instance
enhanced_gemini_ai = EnhancedGeminiAISupport()


def get_enhanced_ai_response(user_input: str, user_context: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Convenience function to get enhanced AI response
    
    Args:
        user_input: User's question or feedback
        user_context: Additional context about the user
        
    Returns:
        Dict containing AI response and metadata
    """
    return enhanced_gemini_ai.generate_enhanced_response(user_input, user_context)
