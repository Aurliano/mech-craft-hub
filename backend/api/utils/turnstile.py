"""
Cloudflare Turnstile verification utilities with token replay prevention and fallback support.
"""
import hashlib
import httpx
import logging
from typing import Tuple, Dict, Any, Optional
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone

logger = logging.getLogger('api.turnstile')

# Import TurnstileAttempt for type hints
try:
    from ..models import TurnstileAttempt
except ImportError:
    # Handle circular import during testing
    TurnstileAttempt = None

# Configuration
VERIFY_URL = getattr(settings, "TURNSTILE_VERIFY_URL", "https://challenges.cloudflare.com/turnstile/v0/siteverify")
SECRET = getattr(settings, "TURNSTILE_SECRET", None)
TOKEN_TTL_SECONDS = 120  # 2 minutes
FALLBACK_ENABLED = getattr(settings, "TURNSTILE_FALLBACK_LOCAL", False)


class TurnstileError(Exception):
    """Base exception for Turnstile related errors."""
    pass


class TurnstileVerificationError(TurnstileError):
    """Raised when Turnstile verification fails."""
    pass


class TurnstileTokenReplayError(TurnstileError):
    """Raised when a Turnstile token is reused."""
    pass


class TurnstileServiceUnavailableError(TurnstileError):
    """Raised when Turnstile service is unavailable."""
    pass


async def verify_turnstile_token(
    token: str, 
    remoteip: Optional[str] = None, 
    timeout: float = 5.0
) -> Tuple[bool, Dict[str, Any]]:
    """
    Verify Turnstile token with Cloudflare service.
    
    Args:
        token: The Turnstile response token
        remoteip: Client's IP address
        timeout: Request timeout in seconds
        
    Returns:
        Tuple of (success: bool, response_data: dict)
        
    Raises:
        TurnstileTokenReplayError: If token has been used before
        TurnstileServiceUnavailableError: If Turnstile service is down
        TurnstileVerificationError: If verification fails
    """
    if not token:
        return False, {"error": "missing-token"}
    
    if not SECRET:
        logger.warning("TURNSTILE_SECRET not configured, skipping verification")
        return True, {"success": True, "bypass": True}
    
    # Prevent replay: check cache for used token hash
    token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
    used_key = f"turnstile:used:{token_hash}"
    
    if cache.get(used_key):
        logger.warning(f"Token replay detected for hash: {token_hash[:8]}...")
        return False, {"error": "token-replayed"}
    
    # Verify with Turnstile service
    data = {
        "secret": SECRET,
        "response": token
    }
    if remoteip:
        data["remoteip"] = remoteip
    
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(VERIFY_URL, data=data)
            response.raise_for_status()
            result = response.json()
            
            # Mark token as used to prevent replay
            cache.set(used_key, True, TOKEN_TTL_SECONDS)
            
            if result.get("success"):
                logger.info(f"Turnstile verification successful for IP: {remoteip}")
                return True, result
            else:
                error_codes = result.get("error-codes", [])
                logger.warning(f"Turnstile verification failed: {error_codes}")
                return False, result
                
    except httpx.TimeoutException:
        logger.error("Turnstile verification timeout")
        raise TurnstileServiceUnavailableError("Turnstile service timeout")
    except httpx.RequestError as e:
        logger.error(f"Turnstile verification request error: {e}")
        raise TurnstileServiceUnavailableError(f"Turnstile service error: {e}")
    except Exception as e:
        logger.error(f"Unexpected error during Turnstile verification: {e}")
        raise TurnstileVerificationError(f"Verification failed: {e}")


def verify_turnstile_token_sync(
    token: str, 
    remoteip: Optional[str] = None, 
    timeout: float = 5.0
) -> Tuple[bool, Dict[str, Any]]:
    """
    Synchronous wrapper for Turnstile token verification.
    
    Args:
        token: The Turnstile response token
        remoteip: Client's IP address
        timeout: Request timeout in seconds
        
    Returns:
        Tuple of (success: bool, response_data: dict)
    """
    import asyncio
    
    try:
        loop = asyncio.get_event_loop()
        return loop.run_until_complete(
            verify_turnstile_token(token, remoteip, timeout)
        )
    except RuntimeError:
        # No event loop running, create a new one
        return asyncio.run(
            verify_turnstile_token(token, remoteip, timeout)
        )


def log_turnstile_attempt(
    token: str,
    remoteip: Optional[str],
    user_id: Optional[int],
    endpoint: str,
    success: bool,
    response_data: Optional[Dict[str, Any]] = None,
    error_message: Optional[str] = None
) -> None:
    """
    Log Turnstile verification attempt for audit trail.
    
    Args:
        token: The Turnstile token (will be hashed)
        remoteip: Client's IP address
        user_id: User ID if authenticated
        endpoint: API endpoint where verification occurred
        success: Whether verification was successful
        response_data: Raw response from Turnstile service
        error_message: Error message if verification failed
    """
    if not TurnstileAttempt:
        return  # Skip logging if model not available
    
    try:
        token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
        
        # Store limited response data (remove sensitive info)
        limited_response = None
        if response_data:
            limited_response = {
                "success": response_data.get("success"),
                "challenge_ts": response_data.get("challenge_ts"),
                "hostname": response_data.get("hostname"),
                "error-codes": response_data.get("error-codes", [])
            }
        
        TurnstileAttempt.objects.create(
            ip=remoteip,
            user_id=user_id,
            endpoint=endpoint,
            success=success,
            response_raw=limited_response,
            token_hash=token_hash,
            error_message=error_message
        )
        
    except Exception as e:
        logger.error(f"Failed to log Turnstile attempt: {e}")


def is_turnstile_enabled() -> bool:
    """Check if Turnstile is properly configured."""
    return bool(SECRET and getattr(settings, 'TURNSTILE_SITE_KEY', None))


def get_turnstile_site_key() -> Optional[str]:
    """Get the Turnstile site key for frontend."""
    return getattr(settings, 'TURNSTILE_SITE_KEY', None)


def check_fallback_available() -> bool:
    """Check if fallback captcha is available."""
    return FALLBACK_ENABLED


def get_fallback_captcha_data() -> Dict[str, Any]:
    """Get fallback captcha challenge data."""
    from django.core.cache import cache
    import uuid
    
    challenge_id = str(uuid.uuid4())
    # Simple math challenge
    import random
    a = random.randint(1, 10)
    b = random.randint(1, 10)
    answer = a + b
    challenge = f"{a} + {b} = ?"
    
    # Store answer in cache for verification
    cache.set(f"fallback_captcha:{challenge_id}", answer, 300)  # 5 minutes
    
    return {
        "available": True,
        "challenge_id": challenge_id,
        "challenge": challenge,
        "type": "math"
    }


def verify_fallback_captcha(challenge_id: str, answer: str) -> bool:
    """Verify fallback captcha answer."""
    from django.core.cache import cache
    
    try:
        correct_answer = cache.get(f"fallback_captcha:{challenge_id}")
        if correct_answer is None:
            return False
        
        # Remove from cache after verification
        cache.delete(f"fallback_captcha:{challenge_id}")
        
        return str(answer).strip() == str(correct_answer)
    except Exception:
        return False


def get_turnstile_stats() -> Dict[str, Any]:
    """Get Turnstile system statistics."""
    if not TurnstileAttempt:
        return {"error": "Model not available"}
    
    try:
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        last_24h = now - timedelta(hours=24)
        last_7d = now - timedelta(days=7)
        
        # Basic stats
        total_attempts = TurnstileAttempt.objects.count()
        successful_attempts = TurnstileAttempt.objects.filter(success=True).count()
        failed_attempts = total_attempts - successful_attempts
        
        # Recent activity
        attempts_24h = TurnstileAttempt.objects.filter(created_at__gte=last_24h).count()
        attempts_7d = TurnstileAttempt.objects.filter(created_at__gte=last_7d).count()
        
        return {
            "total_attempts": total_attempts,
            "successful_attempts": successful_attempts,
            "failed_attempts": failed_attempts,
            "success_rate": (successful_attempts / total_attempts * 100) if total_attempts > 0 else 0,
            "attempts_24h": attempts_24h,
            "attempts_7d": attempts_7d,
            "system_enabled": is_turnstile_enabled(),
            "fallback_enabled": FALLBACK_ENABLED
        }
    except Exception as e:
        logger.error(f"Error getting Turnstile stats: {e}")
        return {"error": str(e)}
