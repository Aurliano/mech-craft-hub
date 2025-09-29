"""
AI Learning System for User Feedback and Response Improvement
This module handles learning from user interactions and feedback to improve AI responses
"""

import json
import logging
from typing import Dict, Any, List, Optional
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from api.models import SupportFeedback, User

logger = logging.getLogger(__name__)


class AIInteractionLog(models.Model):
    """Log AI interactions for learning and improvement"""
    
    INTERACTION_TYPES = [
        ('question', 'سوال'),
        ('feedback', 'بازخورد'),
        ('complaint', 'شکایت'),
        ('compliment', 'تعریف'),
        ('suggestion', 'پیشنهاد'),
    ]
    
    SATISFACTION_LEVELS = [
        ('very_dissatisfied', 'خیلی ناراضی'),
        ('dissatisfied', 'ناراضی'),
        ('neutral', 'خنثی'),
        ('satisfied', 'راضی'),
        ('very_satisfied', 'خیلی راضی'),
    ]
    
    id = models.UUIDField(primary_key=True, default=models.UUIDField().default)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='ai_interactions')
    
    # Interaction details
    user_input = models.TextField(help_text="ورودی کاربر")
    ai_response = models.TextField(help_text="پاسخ هوش مصنوعی")
    interaction_type = models.CharField(max_length=20, choices=INTERACTION_TYPES, default='question')
    
    # Context information
    user_context = models.JSONField(default=dict, help_text="زمینه کاربر")
    prompt_tokens = models.IntegerField(default=0)
    response_tokens = models.IntegerField(default=0)
    
    # User feedback
    user_satisfaction = models.CharField(max_length=20, choices=SATISFACTION_LEVELS, null=True, blank=True)
    user_feedback_text = models.TextField(blank=True, null=True)
    response_helpful = models.BooleanField(null=True, blank=True)
    response_accurate = models.BooleanField(null=True, blank=True)
    
    # Learning data
    keywords_detected = models.JSONField(default=list, help_text="کلمات کلیدی تشخیص داده شده")
    domain_identified = models.CharField(max_length=50, blank=True, help_text="حوزه شناسایی شده")
    response_quality_score = models.FloatField(default=0.0, help_text="امتیاز کیفیت پاسخ")
    
    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    session_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'لاگ تعامل هوش مصنوعی'
        verbose_name_plural = 'لاگ‌های تعامل هوش مصنوعی'
    
    def __str__(self):
        user_info = self.user.username if self.user else "ناشناس"
        return f"تعامل AI - {user_info} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    @classmethod
    def create_interaction(cls, user_input: str, ai_response: str, user_context: Dict[str, Any] = None, 
                          user=None, interaction_type: str = 'question', **kwargs):
        """Create a new AI interaction log"""
        return cls.objects.create(
            user=user,
            user_input=user_input,
            ai_response=ai_response,
            interaction_type=interaction_type,
            user_context=user_context or {},
            **kwargs
        )


class AIResponsePattern(models.Model):
    """Patterns learned from user interactions for improving responses"""
    
    PATTERN_TYPES = [
        ('keyword_response', 'پاسخ بر اساس کلمه کلیدی'),
        ('domain_response', 'پاسخ بر اساس حوزه'),
        ('context_response', 'پاسخ بر اساس زمینه'),
        ('user_type_response', 'پاسخ بر اساس نوع کاربر'),
    ]
    
    id = models.UUIDField(primary_key=True, default=models.UUIDField().default)
    pattern_type = models.CharField(max_length=30, choices=PATTERN_TYPES)
    
    # Pattern definition
    trigger_keywords = models.JSONField(default=list, help_text="کلمات کلیدی محرک")
    trigger_domains = models.JSONField(default=list, help_text="حوزه‌های محرک")
    trigger_context = models.JSONField(default=dict, help_text="زمینه محرک")
    
    # Response template
    response_template = models.TextField(help_text="قالب پاسخ")
    response_examples = models.JSONField(default=list, help_text="نمونه‌های پاسخ")
    
    # Effectiveness metrics
    usage_count = models.PositiveIntegerField(default=0)
    success_rate = models.FloatField(default=0.0)
    average_satisfaction = models.FloatField(default=0.0)
    
    # Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-success_rate', '-usage_count']
        verbose_name = 'الگوی پاسخ هوش مصنوعی'
        verbose_name_plural = 'الگوهای پاسخ هوش مصنوعی'
    
    def __str__(self):
        return f"الگوی {self.pattern_type} - {self.usage_count} استفاده"


class AIFeedbackAnalyzer:
    """Analyze user feedback to improve AI responses"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def analyze_interaction(self, interaction: AIInteractionLog) -> Dict[str, Any]:
        """Analyze a single interaction for learning opportunities"""
        analysis = {
            'keywords_detected': self._extract_keywords(interaction.user_input),
            'domain_identified': self._identify_domain(interaction.user_input),
            'response_quality_score': self._calculate_quality_score(interaction),
            'improvement_suggestions': []
        }
        
        # Update interaction with analysis results
        interaction.keywords_detected = analysis['keywords_detected']
        interaction.domain_identified = analysis['domain_identified']
        interaction.response_quality_score = analysis['response_quality_score']
        interaction.save()
        
        return analysis
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract relevant keywords from user input"""
        # Simple keyword extraction - can be enhanced with NLP libraries
        keywords = []
        text_lower = text.lower()
        
        # Engineering domain keywords
        domain_keywords = {
            'مکاترونیک': ['مکاترونیک', 'ربات', 'کنترل', 'سنسور', 'عملگر', 'اتوماسیون'],
            'مکانیک': ['مکانیک', 'طراحی', 'تحلیل', 'تنش', 'کرنش', 'fea', 'cfd'],
            'کامپیوتر': ['کامپیوتر', 'برنامه‌نویسی', 'شبکه', 'امنیت', 'سیستم'],
            'برق': ['برق', 'الکترونیک', 'مدار', 'قدرت', 'کنترل'],
            'متاورس': ['متاورس', 'vr', 'ar', 'واقعیت مجازی', 'واقعیت افزوده']
        }
        
        for domain, domain_keywords in domain_keywords.items():
            for keyword in domain_keywords:
                if keyword in text_lower:
                    keywords.append(keyword)
        
        return keywords
    
    def _identify_domain(self, text: str) -> str:
        """Identify the engineering domain from user input"""
        text_lower = text.lower()
        
        domain_scores = {
            'مکاترونیک': 0,
            'مکانیک': 0,
            'کامپیوتر': 0,
            'برق': 0,
            'متاورس': 0
        }
        
        domain_keywords = {
            'مکاترونیک': ['مکاترونیک', 'ربات', 'کنترل', 'سنسور', 'عملگر', 'اتوماسیون'],
            'مکانیک': ['مکانیک', 'طراحی', 'تحلیل', 'تنش', 'کرنش', 'fea', 'cfd'],
            'کامپیوتر': ['کامپیوتر', 'برنامه‌نویسی', 'شبکه', 'امنیت', 'سیستم'],
            'برق': ['برق', 'الکترونیک', 'مدار', 'قدرت', 'کنترل'],
            'متاورس': ['متاورس', 'vr', 'ar', 'واقعیت مجازی', 'واقعیت افزوده']
        }
        
        for domain, keywords in domain_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    domain_scores[domain] += 1
        
        # Return domain with highest score
        if max(domain_scores.values()) > 0:
            return max(domain_scores, key=domain_scores.get)
        
        return 'عمومی'
    
    def _calculate_quality_score(self, interaction: AIInteractionLog) -> float:
        """Calculate quality score for AI response"""
        score = 0.5  # Base score
        
        # Adjust based on user feedback
        if interaction.user_satisfaction:
            satisfaction_scores = {
                'very_dissatisfied': 0.0,
                'dissatisfied': 0.25,
                'neutral': 0.5,
                'satisfied': 0.75,
                'very_satisfied': 1.0
            }
            score = satisfaction_scores.get(interaction.user_satisfaction, 0.5)
        
        # Adjust based on helpfulness and accuracy
        if interaction.response_helpful is not None:
            score += 0.1 if interaction.response_helpful else -0.1
        
        if interaction.response_accurate is not None:
            score += 0.1 if interaction.response_accurate else -0.1
        
        return max(0.0, min(1.0, score))
    
    def generate_improvement_suggestions(self, interaction: AIInteractionLog) -> List[str]:
        """Generate suggestions for improving AI responses"""
        suggestions = []
        
        if interaction.response_quality_score < 0.3:
            suggestions.append("پاسخ نیاز به بهبود قابل توجه دارد")
        
        if interaction.user_satisfaction in ['very_dissatisfied', 'dissatisfied']:
            suggestions.append("بازخورد منفی کاربر - بررسی علت نارضایتی")
        
        if not interaction.response_helpful:
            suggestions.append("پاسخ مفید نبوده - بهبود محتوا و راهنمایی")
        
        if not interaction.response_accurate:
            suggestions.append("پاسخ دقیق نبوده - بررسی صحت اطلاعات فنی")
        
        return suggestions


class AIResponseOptimizer:
    """Optimize AI responses based on learned patterns"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.analyzer = AIFeedbackAnalyzer()
    
    def get_optimized_response_template(self, user_input: str, user_context: Dict[str, Any] = None) -> Optional[str]:
        """Get optimized response template based on learned patterns"""
        # Analyze the input
        keywords = self.analyzer._extract_keywords(user_input)
        domain = self.analyzer._identify_domain(user_input)
        
        # Find matching patterns
        patterns = AIResponsePattern.objects.filter(
            is_active=True,
            trigger_keywords__overlap=keywords
        ).order_by('-success_rate', '-usage_count')
        
        if patterns.exists():
            best_pattern = patterns.first()
            best_pattern.usage_count += 1
            best_pattern.save()
            return best_pattern.response_template
        
        return None
    
    def update_pattern_effectiveness(self, pattern: AIResponsePattern, interaction: AIInteractionLog):
        """Update pattern effectiveness based on user feedback"""
        if interaction.user_satisfaction:
            satisfaction_scores = {
                'very_dissatisfied': 0.0,
                'dissatisfied': 0.25,
                'neutral': 0.5,
                'satisfied': 0.75,
                'very_satisfied': 1.0
            }
            
            satisfaction_score = satisfaction_scores.get(interaction.user_satisfaction, 0.5)
            
            # Update average satisfaction
            total_interactions = AIInteractionLog.objects.filter(
                keywords_detected__overlap=pattern.trigger_keywords
            ).count()
            
            if total_interactions > 0:
                pattern.average_satisfaction = (
                    (pattern.average_satisfaction * (total_interactions - 1) + satisfaction_score) / total_interactions
                )
            
            # Update success rate
            successful_interactions = AIInteractionLog.objects.filter(
                keywords_detected__overlap=pattern.trigger_keywords,
                user_satisfaction__in=['satisfied', 'very_satisfied']
            ).count()
            
            pattern.success_rate = successful_interactions / total_interactions if total_interactions > 0 else 0
            pattern.save()


# Global instances
feedback_analyzer = AIFeedbackAnalyzer()
response_optimizer = AIResponseOptimizer()
