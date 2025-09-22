"""
Content filtering system for preventing contact information sharing
"""
import re
import hashlib
from typing import List, Tuple
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class FilterResult:
    """Result of content filtering"""
    is_violation: bool
    violation_type: str
    confidence: float
    detected_content: str
    action: str  # 'block', 'quarantine', 'warning', 'allow'
    reason: str


class ContentFilter:
    """Advanced content filtering system"""
    
    def __init__(self):
        self.phone_patterns = self._compile_phone_patterns()
        self.email_patterns = self._compile_email_patterns()
        self.url_patterns = self._compile_url_patterns()
        self.social_patterns = self._compile_social_patterns()
        self.contact_invitation_patterns = self._compile_contact_invitation_patterns()
        
        # Persian to Latin digit mapping
        self.persian_digits = '۰۱۲۳۴۵۶۷۸۹'
        self.latin_digits = '0123456789'
        
        # Homoglyph mapping for obfuscation detection
        self.homoglyphs = {
            '@': ['@', '＠', 'Ⓐ', 'ⓐ'],
            '.': ['.', '。', '·', '•'],
            'a': ['a', 'а', 'α', 'ⓐ'],
            'e': ['e', 'е', 'ε', 'ⓔ'],
            'o': ['o', 'о', 'ο', 'ⓞ'],
        }
    
    def _compile_phone_patterns(self) -> List[re.Pattern]:
        """Compile phone number detection patterns"""
        patterns = [
            # Iranian mobile numbers
            r'(?:\+98|0)?\s*9[0-9۰-۹]{2}\s*[0-9۰-۹]{3}\s*[0-9۰-۹]{4}',
            # International numbers
            r'(?:\+\d{1,3}\s?)?\d{2,4}\s?\d{2,4}\s?\d{2,4}\s?\d{2,4}',
            # Numbers with separators
            r'(?:\+98|0)?\s*9[0-9۰-۹]{2}[-.\s]?[0-9۰-۹]{3}[-.\s]?[0-9۰-۹]{4}',
        ]
        return [re.compile(pattern, re.IGNORECASE) for pattern in patterns]
    
    def _compile_email_patterns(self) -> List[re.Pattern]:
        """Compile email detection patterns"""
        patterns = [
            # Standard email
            r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
            # Obfuscated email patterns
            r'[a-zA-Z0-9._%+-]+\s*(?:@|\(at\)|\[at\]| at |＠)\s*[a-zA-Z0-9.-]+\s*(?:\.|\(dot\)|\[dot\]| dot |。)\s*[a-zA-Z]{2,}',
            # Persian email patterns
            r'[a-zA-Z0-9._%+-]+\s*(?:@|\(at\)|\[at\]| at |＠)\s*[a-zA-Z0-9.-]+\s*(?:\.|\(dot\)|\[dot\]| dot |。)\s*[a-zA-Z]{2,}',
        ]
        return [re.compile(pattern, re.IGNORECASE) for pattern in patterns]
    
    def _compile_url_patterns(self) -> List[re.Pattern]:
        """Compile URL detection patterns"""
        patterns = [
            r'https?://[^\s]+',
            r'www\.[^\s]+',
            r'[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:/[^\s]*)?',
        ]
        return [re.compile(pattern, re.IGNORECASE) for pattern in patterns]
    
    def _compile_social_patterns(self) -> List[re.Pattern]:
        """Compile social media ID patterns"""
        patterns = [
            # Telegram
            r'@[a-zA-Z0-9_]{3,}',
            r't\.me/[a-zA-Z0-9_]+',
            r'telegram\.me/[a-zA-Z0-9_]+',
            # WhatsApp
            r'wa\.me/\d+',
            r'whatsapp\.com/send\?phone=\d+',
            # Instagram
            r'instagram\.com/[a-zA-Z0-9_.]+',
            # Other social platforms
            r'(?:facebook|twitter|linkedin|youtube)\.com/[a-zA-Z0-9_.]+',
        ]
        return [re.compile(pattern, re.IGNORECASE) for pattern in patterns]
    
    def _compile_contact_invitation_patterns(self) -> List[re.Pattern]:
        """Compile contact invitation patterns"""
        patterns = [
            # Persian patterns
            r'(?:شماره|تلفن|موبایل|تماس|پیام|واتساپ|تلگرام|ایمیل|ایمیل|آدرس)',
            r'(?:بدید|بزنید|ارسال|ارسال کنید|بفرستید)',
            r'(?:در|به|با)\s*(?:واتساپ|تلگرام|ایمیل|تلفن)',
            # English patterns
            r'(?:call|text|message|contact|phone|email|whatsapp|telegram)',
            r'(?:me|us|him|her)\s*(?:at|on|via)',
        ]
        return [re.compile(pattern, re.IGNORECASE) for pattern in patterns]
    
    def normalize_text(self, text: str) -> str:
        """Normalize text for better pattern matching"""
        if not text:
            return ""
        
        # Convert Persian digits to Latin
        for persian, latin in zip(self.persian_digits, self.latin_digits):
            text = text.replace(persian, latin)
        
        # Remove zero-width characters
        text = re.sub(r'[\u200B-\u200D\uFEFF]', '', text)
        
        # Normalize homoglyphs
        for standard, variants in self.homoglyphs.items():
            for variant in variants:
                text = text.replace(variant, standard)
        
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Convert to lowercase
        text = text.lower()
        
        # Replace common obfuscations
        text = re.sub(r'\s*\(at\)\s*', '@', text)
        text = re.sub(r'\s*\[at\]\s*', '@', text)
        text = re.sub(r'\s* at \s*', '@', text)
        text = re.sub(r'\s*\(dot\)\s*', '.', text)
        text = re.sub(r'\s*\[dot\]\s*', '.', text)
        text = re.sub(r'\s* dot \s*', '.', text)
        
        return text.strip()
    
    def detect_phone_numbers(self, text: str) -> List[Tuple[str, float]]:
        """Detect phone numbers in text"""
        normalized_text = self.normalize_text(text)
        results = []
        
        for pattern in self.phone_patterns:
            matches = pattern.findall(normalized_text)
            for match in matches:
                # Clean the match
                clean_match = re.sub(r'[^\d+]', '', match)
                if len(clean_match) >= 10:  # Minimum phone number length
                    confidence = 0.9 if len(clean_match) >= 11 else 0.7
                    results.append((match, confidence))
        
        return results
    
    def detect_emails(self, text: str) -> List[Tuple[str, float]]:
        """Detect email addresses in text"""
        normalized_text = self.normalize_text(text)
        results = []
        
        for pattern in self.email_patterns:
            matches = pattern.findall(normalized_text)
            for match in matches:
                confidence = 0.95 if '@' in match and '.' in match else 0.8
                results.append((match, confidence))
        
        return results
    
    def detect_urls(self, text: str) -> List[Tuple[str, float]]:
        """Detect URLs in text"""
        normalized_text = self.normalize_text(text)
        results = []
        
        for pattern in self.url_patterns:
            matches = pattern.findall(normalized_text)
            for match in matches:
                # Skip common false positives
                if any(domain in match.lower() for domain in ['yourdomain.com', 'localhost', '127.0.0.1']):
                    continue
                confidence = 0.9 if match.startswith('http') else 0.7
                results.append((match, confidence))
        
        return results
    
    def detect_social_ids(self, text: str) -> List[Tuple[str, float]]:
        """Detect social media IDs in text"""
        normalized_text = self.normalize_text(text)
        results = []
        
        for pattern in self.social_patterns:
            matches = pattern.findall(normalized_text)
            for match in matches:
                confidence = 0.9 if '@' in match or 't.me' in match or 'wa.me' in match else 0.7
                results.append((match, confidence))
        
        return results
    
    def detect_contact_invitations(self, text: str) -> List[Tuple[str, float]]:
        """Detect contact invitation patterns in text"""
        normalized_text = self.normalize_text(text)
        results = []
        
        for pattern in self.contact_invitation_patterns:
            matches = pattern.findall(normalized_text)
            for match in matches:
                confidence = 0.8
                results.append((match, confidence))
        
        return results
    
    def filter_content(self, text: str, user_id: str = None) -> FilterResult:
        """Main content filtering function"""
        if not text or not text.strip():
            return FilterResult(
                is_violation=False,
                violation_type='',
                confidence=0.0,
                detected_content='',
                action='allow',
                reason='Empty content'
            )
        
        # Check for phone numbers
        phone_matches = self.detect_phone_numbers(text)
        if phone_matches:
            highest_confidence = max(phone_matches, key=lambda x: x[1])
            return FilterResult(
                is_violation=True,
                violation_type='phone',
                confidence=highest_confidence[1],
                detected_content=highest_confidence[0],
                action='block' if highest_confidence[1] > 0.8 else 'quarantine',
                reason='Phone number detected'
            )
        
        # Check for emails
        email_matches = self.detect_emails(text)
        if email_matches:
            highest_confidence = max(email_matches, key=lambda x: x[1])
            return FilterResult(
                is_violation=True,
                violation_type='email',
                confidence=highest_confidence[1],
                detected_content=highest_confidence[0],
                action='block' if highest_confidence[1] > 0.8 else 'quarantine',
                reason='Email address detected'
            )
        
        # Check for URLs
        url_matches = self.detect_urls(text)
        if url_matches:
            highest_confidence = max(url_matches, key=lambda x: x[1])
            return FilterResult(
                is_violation=True,
                violation_type='url',
                confidence=highest_confidence[1],
                detected_content=highest_confidence[0],
                action='quarantine',
                reason='URL detected'
            )
        
        # Check for social media IDs
        social_matches = self.detect_social_ids(text)
        if social_matches:
            highest_confidence = max(social_matches, key=lambda x: x[1])
            return FilterResult(
                is_violation=True,
                violation_type='social_id',
                confidence=highest_confidence[1],
                detected_content=highest_confidence[0],
                action='quarantine',
                reason='Social media ID detected'
            )
        
        # Check for contact invitations
        invitation_matches = self.detect_contact_invitations(text)
        if invitation_matches:
            highest_confidence = max(invitation_matches, key=lambda x: x[1])
            return FilterResult(
                is_violation=True,
                violation_type='contact_invitation',
                confidence=highest_confidence[1],
                detected_content=highest_confidence[0],
                action='warning',
                reason='Contact invitation detected'
            )
        
        return FilterResult(
            is_violation=False,
            violation_type='',
            confidence=0.0,
            detected_content='',
            action='allow',
            reason='No violations detected'
        )
    
    def get_content_hash(self, content: str) -> str:
        """Generate hash for content to detect duplicates"""
        normalized = self.normalize_text(content)
        return hashlib.sha256(normalized.encode()).hexdigest()


# Global instance
content_filter = ContentFilter()
