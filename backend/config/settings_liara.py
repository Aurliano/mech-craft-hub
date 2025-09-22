"""
Django settings for Liara deployment
"""

from .settings import *

# Override settings for Liara
DEBUG = False
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-fallback-key')

# Liara specific settings
ALLOWED_HOSTS = [
    'mech-craft-hub-main.liara.run',
    '.liara.run',
    '.liara.ir',
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

# Security settings for Liara
SECURE_SSL_REDIRECT = False  # Liara handles SSL
SESSION_COOKIE_SECURE = False  # Liara handles SSL
CSRF_COOKIE_SECURE = False  # Liara handles SSL

# Disable HSTS for now
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False

# CORS settings for Liara
CORS_ALLOWED_ORIGINS = [
    'https://mech-craft-hub-main.liara.run',
]

CORS_ALLOW_CREDENTIALS = True

# CSRF settings
CSRF_TRUSTED_ORIGINS = [
    'https://mech-craft-hub-main.liara.run',
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
