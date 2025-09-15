"""
Cloudflare Turnstile verification utilities
"""
import requests
import logging
import json
from django.conf import settings
from django.core.cache import cache
from typing import Tuple, Dict, Any, Optional
import time

logger = logging.getLogger(__name__)

class TurnstileError(Exception):
    """Base exception for Turnstile-related errors"""
    pass

class TurnstileVerificationError(TurnstileError):
    """Exception raised when Turnstile verification fails"""
    pass

def verify_turnstile_token(token: str, remote_ip: Optional[str] = None) -> Tuple[bool, Dict[str, Any]]:
    """
    Verify Turnstile token with Cloudflare API
    
    Args:
        token: The Turnstile response token
        remote_ip: Client IP address
        
    Returns:
        Tuple of (success: bool, response_data: dict)
    """
    if not token:
        return False, {"error": "No token provided"}
    
    secret = getattr(settings, 'TURNSTILE_SECRET_KEY', None)
    if not secret:
        logger.warning("TURNSTILE_SECRET_KEY not configured")
        return False, {"error": "Turnstile not configured"}
    
    # Prepare verification request
    data = {
        'secret': secret,
        'response': token,
    }
    
    if remote_ip:
        data['remoteip'] = remote_ip
    
    try:
        # Make request to Cloudflare Turnstile verification endpoint
        response = requests.post(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            data=data,
            timeout=10
        )
        response.raise_for_status()
        
        result = response.json()
        
        # Log the verification attempt
        log_turnstile_attempt(
            token=token,
            remote_ip=remote_ip,
            success=result.get('success', False),
            response_data=result
        )
        
        return result.get('success', False), result
        
    except requests.RequestException as e:
        logger.error(f"Turnstile API request failed: {e}")
        return False, {"error": f"API request failed: {str(e)}"}
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON response from Turnstile API: {e}")
        return False, {"error": "Invalid API response"}
    except Exception as e:
        logger.error(f"Unexpected error during Turnstile verification: {e}")
        return False, {"error": f"Verification error: {str(e)}"}

def verify_turnstile_token_sync(token: str, remote_ip: Optional[str] = None) -> Tuple[bool, Dict[str, Any]]:
    """
    Synchronous wrapper for Turnstile token verification
    Compatible with existing hCaptcha interface
    """
    return verify_turnstile_token(token, remote_ip)

def log_turnstile_attempt(
    token: str, 
    remote_ip: Optional[str] = None, 
    success: bool = False, 
    response_data: Optional[Dict] = None,
    user=None,
    endpoint: str = "unknown"
):
    """
    Log Turnstile verification attempt for audit purposes
    
    Args:
        token: The Turnstile token (will be hashed)
        remote_ip: Client IP address
        success: Whether verification was successful
        response_data: Full response from Turnstile API
        user: User instance if available
        endpoint: API endpoint where verification occurred
    """
    try:
        import hashlib
        from ..models import TurnstileAttempt
        
        # Hash the token for security
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        # Create log entry
        TurnstileAttempt.objects.create(
            token_hash=token_hash,
            ip=remote_ip,
            endpoint=endpoint,
            success=success,
            response_raw=response_data,
            user=user,
            error_message=response_data.get('error-codes') if response_data else None
        )
        
    except Exception as e:
        logger.error(f"Failed to log Turnstile attempt: {e}")

def check_turnstile_available() -> bool:
    """
    Check if Turnstile is properly configured and available
    
    Returns:
        bool: True if Turnstile is available, False if should fallback to local captcha
    """
    # Check if required settings are configured
    site_key = getattr(settings, 'TURNSTILE_SITE_KEY', None)
    secret_key = getattr(settings, 'TURNSTILE_SECRET_KEY', None)
    
    if not site_key or not secret_key:
        return False
    
    # Check if fallback is forced
    force_fallback = getattr(settings, 'TURNSTILE_FALLBACK_LOCAL', False)
    if force_fallback:
        return False
    
    # Check API availability (cached)
    cache_key = 'turnstile_api_available'
    api_available = cache.get(cache_key)
    
    if api_available is None:
        try:
            # Quick health check to Cloudflare
            response = requests.get(
                'https://challenges.cloudflare.com/turnstile/v0/api.js',
                timeout=5
            )
            api_available = response.status_code == 200
            # Cache for 5 minutes
            cache.set(cache_key, api_available, 300)
        except:
            api_available = False
            # Cache failure for 1 minute
            cache.set(cache_key, api_available, 60)
    
    return api_available

def get_captcha_config() -> Dict[str, str]:
    """
    Get captcha configuration for frontend
    
    Returns:
        dict: Configuration indicating which captcha system to use
    """
    if check_turnstile_available():
        return {
            "type": "turnstile",
            "site_key": getattr(settings, 'TURNSTILE_SITE_KEY', ''),
            "fallback": "disabled"
        }
    else:
        return {
            "type": "local",
            "fallback": "local"
        }