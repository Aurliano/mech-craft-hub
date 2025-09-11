"""
hCaptcha verification utilities with token replay prevention and fallback support.
"""
import hashlib
import httpx
import logging
from typing import Tuple, Dict, Any, Optional
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone

logger = logging.getLogger('api.hcaptcha')

# Import HCaptchaAttempt for type hints
try:
    from ..models import HCaptchaAttempt
except ImportError:
    # Handle circular import during testing
    HCaptchaAttempt = None

# Configuration
VERIFY_URL = getattr(settings, "HCAPTCHA_VERIFY_URL", "https://hcaptcha.com/siteverify")
SECRET = getattr(settings, "HCAPTCHA_SECRET", None)
TOKEN_TTL_SECONDS = 120  # 2 minutes
FALLBACK_ENABLED = getattr(settings, "HCAPTCHA_FALLBACK_LOCAL", False)


class HCaptchaError(Exception):
    """Base exception for hCaptcha related errors."""
    pass


class HCaptchaVerificationError(HCaptchaError):
    """Raised when hCaptcha verification fails."""
    pass


class HCaptchaTokenReplayError(HCaptchaError):
    """Raised when a token is replayed."""
    pass


class HCaptchaServiceUnavailableError(HCaptchaError):
    """Raised when hCaptcha service is unavailable."""
    pass


async def verify_hcaptcha_token(
    token: str, 
    remoteip: Optional[str] = None, 
    timeout: float = 5.0
) -> Tuple[bool, Dict[str, Any]]:
    """
    Verify hCaptcha token with hCaptcha service.
    
    Args:
        token: The hCaptcha response token
        remoteip: Client's IP address
        timeout: Request timeout in seconds
        
    Returns:
        Tuple of (success: bool, response_data: dict)
        
    Raises:
        HCaptchaTokenReplayError: If token has been used before
        HCaptchaServiceUnavailableError: If hCaptcha service is down
        HCaptchaVerificationError: If verification fails
    """
    if not token:
        return False, {"error": "missing-token"}
    
    if not SECRET:
        logger.warning("HCAPTCHA_SECRET not configured, skipping verification")
        return True, {"success": True, "bypass": True}
    
    # Prevent replay: check cache for used token hash
    token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
    used_key = f"hcaptcha:used:{token_hash}"
    
    if cache.get(used_key):
        logger.warning(f"Token replay detected for hash: {token_hash[:8]}...")
        return False, {"error": "token-replayed"}
    
    # Verify with hCaptcha service
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
            
    except httpx.TimeoutException:
        logger.error("hCaptcha verification timeout")
        return False, {"error": "verify-timeout"}
    except httpx.ConnectError:
        logger.error("hCaptcha service connection failed")
        return False, {"error": "verify-connection-error"}
    except httpx.HTTPStatusError as e:
        logger.error(f"hCaptcha service HTTP error: {e.response.status_code}")
        return False, {"error": "verify-http-error", "status_code": e.response.status_code}
    except Exception as e:
        logger.error(f"Unexpected error during hCaptcha verification: {str(e)}")
        return False, {"error": "verify-failed", "exception": str(e)}
    
    # Check if verification was successful
    success = result.get("success", False)
    
    if success:
        # Mark token as used to prevent replay
        cache.set(used_key, True, TOKEN_TTL_SECONDS)
        logger.info(f"hCaptcha verification successful for IP: {remoteip}")
    else:
        error_codes = result.get("error-codes", [])
        logger.warning(f"hCaptcha verification failed for IP: {remoteip}, errors: {error_codes}")
    
    return success, result


def verify_hcaptcha_token_sync(
    token: str, 
    remoteip: Optional[str] = None, 
    timeout: float = 5.0
) -> Tuple[bool, Dict[str, Any]]:
    """
    Synchronous wrapper for hCaptcha verification.
    
    Args:
        token: The hCaptcha response token
        remoteip: Client's IP address
        timeout: Request timeout in seconds
        
    Returns:
        Tuple of (success: bool, response_data: dict)
    """
    import asyncio
    
    try:
        # Try to get existing event loop
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # If we're in an async context, we need to use a different approach
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(
                    lambda: asyncio.run(verify_hcaptcha_token(token, remoteip, timeout))
                )
                return future.result()
        else:
            return loop.run_until_complete(verify_hcaptcha_token(token, remoteip, timeout))
    except RuntimeError:
        # No event loop exists, create a new one
        return asyncio.run(verify_hcaptcha_token(token, remoteip, timeout))


def check_fallback_available() -> bool:
    """
    Check if fallback captcha is available.
    
    Returns:
        bool: True if fallback is available and enabled
    """
    return FALLBACK_ENABLED


def get_fallback_captcha_data() -> Dict[str, Any]:
    """
    Generate fallback captcha data for local captcha.
    
    Returns:
        Dict containing captcha challenge data
    """
    if not check_fallback_available():
        return {"available": False}
    
    # Generate a simple math challenge
    import random
    a = random.randint(1, 10)
    b = random.randint(1, 10)
    operation = random.choice(['+', '-', '*'])
    
    if operation == '+':
        answer = a + b
        challenge = f"{a} + {b}"
    elif operation == '-':
        # Ensure positive result
        if a < b:
            a, b = b, a
        answer = a - b
        challenge = f"{a} - {b}"
    else:  # multiplication
        answer = a * b
        challenge = f"{a} × {b}"
    
    # Store answer in cache with a unique key
    challenge_id = hashlib.md5(f"{challenge}{timezone.now().timestamp()}".encode()).hexdigest()
    cache.set(f"captcha:fallback:{challenge_id}", str(answer), 300)  # 5 minutes
    
    return {
        "available": True,
        "challenge_id": challenge_id,
        "challenge": challenge,
        "type": "math"
    }


def verify_fallback_captcha(challenge_id: str, answer: str) -> bool:
    """
    Verify fallback captcha answer.
    
    Args:
        challenge_id: The challenge ID
        answer: User's answer
        
    Returns:
        bool: True if answer is correct
    """
    if not check_fallback_available():
        return False
    
    cached_answer = cache.get(f"captcha:fallback:{challenge_id}")
    if not cached_answer:
        return False
    
    # Remove the challenge from cache after verification
    cache.delete(f"captcha:fallback:{challenge_id}")
    
    return cached_answer == answer.strip()


def log_hcaptcha_attempt(
    ip: str,
    user_id: Optional[str],
    endpoint: str,
    success: bool,
    token_hash: str,
    response_data: Optional[Dict[str, Any]] = None
) -> HCaptchaAttempt:
    """
    Log hCaptcha attempt for audit purposes.
    
    Args:
        ip: Client IP address
        user_id: User ID if authenticated
        endpoint: API endpoint
        success: Whether verification was successful
        token_hash: SHA256 hash of the token
        response_data: hCaptcha response data
    
    Returns:
        HCaptchaAttempt: The created attempt record
    """
    from ..models import HCaptchaAttempt
    
    # Get user object if user_id is provided
    user = None
    if user_id:
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            pass
    
    # Create database record
    attempt = HCaptchaAttempt.objects.create(
        ip=ip,
        user=user,
        endpoint=endpoint,
        success=success,
        response_raw=response_data,
        token_hash=token_hash,
        user_agent=None  # Not available in this context
    )
    
    log_data = {
        "timestamp": timezone.now().isoformat(),
        "ip": ip,
        "user_id": user_id,
        "endpoint": endpoint,
        "success": success,
        "token_hash": token_hash[:16] + "...",  # Only log first 16 chars
        "response_data": response_data
    }
    
    if success:
        logger.info(f"hCaptcha attempt successful: {log_data}")
    else:
        logger.warning(f"hCaptcha attempt failed: {log_data}")
    
    return attempt


def get_hcaptcha_stats() -> Dict[str, Any]:
    """
    Get hCaptcha statistics from cache.
    
    Returns:
        Dict containing hCaptcha statistics
    """
    # This would typically query a database for real stats
    # For now, return basic cache info
    return {
        "cache_backend": cache.__class__.__name__,
        "fallback_enabled": FALLBACK_ENABLED,
        "secret_configured": bool(SECRET)
    }
