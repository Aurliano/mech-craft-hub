"""
Django settings for Liara deployment
"""

from .settings import *

# Override settings for Liara
DEBUG = False
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-fallback-key')

# Liara specific settings
ALLOWED_HOSTS = [
    'sayda-engineering-platform.liara.run',
    '.liara.run',
    '.liara.ir',
    'saydatech.ir',
    'www.saydatech.ir',
]

# Database configuration for Liara
if os.getenv('DATABASE_URL'):
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.parse(os.getenv('DATABASE_URL'))
    }

# Static files for Liara
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Security settings for Liara with SSL enabled
SECURE_SSL_REDIRECT = True  # Force HTTPS redirect
SESSION_COOKIE_SECURE = True  # Secure cookies for HTTPS
CSRF_COOKIE_SECURE = True  # Secure CSRF cookies

# HSTS settings for enhanced security
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Additional security headers
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

# CORS settings for Liara
CORS_ALLOWED_ORIGINS = [
    'https://sayda-engineering-platform.liara.run',
    'https://saydatech.ir',
    'https://www.saydatech.ir',
]

CORS_ALLOW_CREDENTIALS = True

# CSRF settings
CSRF_TRUSTED_ORIGINS = [
    'https://sayda-engineering-platform.liara.run',
    'https://saydatech.ir',
    'https://www.saydatech.ir',
]

# Logging for Liara
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
