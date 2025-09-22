"""
Monitoring and metrics collection for the application.
"""
import logging
import time
from functools import wraps
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
try:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    from sentry_sdk.integrations.redis import RedisIntegration
    SENTRY_AVAILABLE = True
except ImportError:
    SENTRY_AVAILABLE = False

# Celery integration will be imported when needed

logger = logging.getLogger(__name__)

# Prometheus metrics
REQUEST_COUNT = Counter(
    'django_requests_total',
    'Total number of HTTP requests',
    ['method', 'endpoint', 'status_code']
)

REQUEST_DURATION = Histogram(
    'django_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint']
)

ACTIVE_CONNECTIONS = Gauge(
    'django_active_connections',
    'Number of active database connections'
)

FILE_UPLOADS = Counter(
    'django_file_uploads_total',
    'Total number of file uploads',
    ['status', 'file_type']
)

SECURITY_EVENTS = Counter(
    'django_security_events_total',
    'Total number of security events',
    ['event_type', 'severity']
)

DATABASE_OPERATIONS = Counter(
    'django_database_operations_total',
    'Total number of database operations',
    ['operation', 'table']
)


def init_sentry():
    """Initialize Sentry for error tracking and performance monitoring."""
    if not SENTRY_AVAILABLE:
        logger.warning("Sentry SDK not available, skipping Sentry initialization")
        return
        
    if hasattr(settings, 'SENTRY_DSN') and settings.SENTRY_DSN:
        integrations = [
            DjangoIntegration(
                transaction_style='url',
                middleware_spans=True,
                signals_spans=True,
                cache_spans=True,
            ),
            RedisIntegration(),
        ]
        
        # Try to add Celery integration if available
        try:
            from sentry_sdk.integrations.celery import CeleryIntegration
            integrations.append(CeleryIntegration())
        except ImportError:
            pass  # Celery not available, skip integration
            
        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            integrations=integrations,
            traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE if hasattr(settings, 'SENTRY_TRACES_SAMPLE_RATE') else 0.1,
            send_default_pii=False,  # Don't send personally identifiable information
            environment=settings.SENTRY_ENVIRONMENT if hasattr(settings, 'SENTRY_ENVIRONMENT') else 'production',
            release=settings.SENTRY_RELEASE if hasattr(settings, 'SENTRY_RELEASE') else None,
        )
        logger.info("Sentry initialized successfully")
    else:
        logger.warning("Sentry DSN not configured, skipping Sentry initialization")


def track_request_metrics(view_func):
    """Decorator to track request metrics."""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        start_time = time.time()
        
        # Extract endpoint name
        endpoint = request.resolver_match.url_name if request.resolver_match else 'unknown'
        
        try:
            response = view_func(request, *args, **kwargs)
            status_code = response.status_code
        except Exception as e:
            status_code = 500
            raise
        finally:
            # Record metrics
            duration = time.time() - start_time
            REQUEST_COUNT.labels(
                method=request.method,
                endpoint=endpoint,
                status_code=status_code
            ).inc()
            
            REQUEST_DURATION.labels(
                method=request.method,
                endpoint=endpoint
            ).observe(duration)
        
        return response
    return wrapper


def track_file_upload(file_type, status):
    """Track file upload metrics."""
    FILE_UPLOADS.labels(
        status=status,
        file_type=file_type
    ).inc()


def track_security_event(event_type, severity='info'):
    """Track security events."""
    SECURITY_EVENTS.labels(
        event_type=event_type,
        severity=severity
    ).inc()


def track_database_operation(operation, table):
    """Track database operations."""
    DATABASE_OPERATIONS.labels(
        operation=operation,
        table=table
    ).inc()


@require_http_methods(["GET"])
def metrics_view(request):
    """Prometheus metrics endpoint."""
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    
    metrics_data = generate_latest()
    return JsonResponse(
        {'metrics': metrics_data.decode('utf-8')},
        content_type=CONTENT_TYPE_LATEST
    )


@require_http_methods(["GET"])
def health_check(request):
    """Health check endpoint for load balancers."""
    try:
        from django.db import connection
        from django.core.cache import cache
        
        # Check database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        # Check cache connection
        cache.set('health_check', 'ok', 10)
        cache.get('health_check')
        
        return JsonResponse({
            'status': 'healthy',
            'timestamp': time.time(),
            'database': 'ok',
            'cache': 'ok'
        })
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JsonResponse({
            'status': 'unhealthy',
            'timestamp': time.time(),
            'error': str(e)
        }, status=503)


class SecurityLogger:
    """Centralized security event logging."""
    
    @staticmethod
    def log_login_attempt(user, ip_address, success=True):
        """Log login attempts."""
        event_type = 'login_success' if success else 'login_failed'
        severity = 'info' if success else 'warning'
        
        logger.info(
            f"Login attempt: user={user}, ip={ip_address}, success={success}",
            extra={
                'event_type': event_type,
                'user_id': user.id if user and hasattr(user, 'id') else None,
                'ip_address': ip_address,
                'success': success
            }
        )
        
        track_security_event(event_type, severity)
    
    @staticmethod
    def log_file_upload_attempt(user, filename, success=True, reason=None):
        """Log file upload attempts."""
        event_type = 'file_upload_success' if success else 'file_upload_failed'
        severity = 'info' if success else 'warning'
        
        logger.info(
            f"File upload: user={user}, file={filename}, success={success}, reason={reason}",
            extra={
                'event_type': event_type,
                'user_id': user.id if user and hasattr(user, 'id') else None,
                'filename': filename,
                'success': success,
                'reason': reason
            }
        )
        
        track_security_event(event_type, severity)
    
    @staticmethod
    def log_suspicious_activity(user, activity_type, details=None):
        """Log suspicious activities."""
        logger.warning(
            f"Suspicious activity: user={user}, type={activity_type}, details={details}",
            extra={
                'event_type': 'suspicious_activity',
                'user_id': user.id if user and hasattr(user, 'id') else None,
                'activity_type': activity_type,
                'details': details
            }
        )
        
        track_security_event('suspicious_activity', 'warning')
    
    @staticmethod
    def log_api_abuse(user, endpoint, ip_address, reason):
        """Log API abuse attempts."""
        logger.warning(
            f"API abuse: user={user}, endpoint={endpoint}, ip={ip_address}, reason={reason}",
            extra={
                'event_type': 'api_abuse',
                'user_id': user.id if user and hasattr(user, 'id') else None,
                'endpoint': endpoint,
                'ip_address': ip_address,
                'reason': reason
            }
        )
        
        track_security_event('api_abuse', 'warning')


def get_system_metrics():
    """Get current system metrics."""
    import psutil
    
    return {
        'cpu_percent': psutil.cpu_percent(),
        'memory_percent': psutil.virtual_memory().percent,
        'disk_percent': psutil.disk_usage('/').percent,
        'active_connections': ACTIVE_CONNECTIONS._value._value if hasattr(ACTIVE_CONNECTIONS, '_value') else 0,
    }
