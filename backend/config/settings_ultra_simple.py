"""
Ultra-simple Django settings for Liara deployment
"""

import os
import dj_database_url
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-fallback-key-for-testing-only')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = [
    'localhost', 
    '127.0.0.1', 
    '.liara.run',
    '.liara.ir',
    'saydatech.ir',
    'www.saydatech.ir',
    'mech-craft-hub-main.liara.run',
] + (os.getenv('ALLOWED_HOSTS', '').split(',') if os.getenv('ALLOWED_HOSTS') else [])

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sitemaps',  # For SEO sitemap generation
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'django_filters',
    'corsheaders',
    'drf_spectacular',
    'axes',  # For login lockout protection
    'api',
]

MIDDLEWARE = [
    'api.middleware.HealthCheckMiddleware',  # Must be first to bypass DB-dependent middleware for health checks
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'api.middleware.CSRFExemptAPIMiddleware',  # Exempt API endpoints from CSRF (must be before CsrfViewMiddleware)
    'django.middleware.csrf.CsrfViewMiddleware',
    'api.middleware.CSRFProtectionMiddleware',  # Custom CSRF middleware
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'api.middleware.JWTAuthenticationMiddleware',  # Custom JWT middleware
    'axes.middleware.AxesMiddleware',  # Must be after AuthenticationMiddleware
    'api.middleware.SecurityHeadersMiddleware',  # Security headers middleware
    'api.middleware.RateLimitMiddleware',  # Rate limiting middleware
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, '..', 'templates'),
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database configuration
# Support DATABASE_URL for Liara and other providers
DATABASE_URL = os.getenv('DATABASE_URL')

if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    # Fallback to individual environment variables or SQLite
    USE_SQLITE = os.getenv('USE_SQLITE', '0') == '1'
    if USE_SQLITE:
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }
    else:
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': os.getenv('POSTGRES_DB', 'postgres'),
                'USER': os.getenv('POSTGRES_USER', 'root'),
                'PASSWORD': os.getenv('POSTGRES_PASSWORD', ''),
                'HOST': os.getenv('POSTGRES_HOST', 'sayda-db'),
                'PORT': os.getenv('POSTGRES_PORT', '5432'),
                'OPTIONS': {
                    'connect_timeout': int(os.getenv('POSTGRES_CONNECT_TIMEOUT', '10')),
                }
            }
        }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
]

# Password hashing - Use Argon2 for better security
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
# Place collectstatic output in an app-mounted directory inside the container
# so WhiteNoise and the Django static() helper can serve admin assets reliably
STATIC_ROOT = os.getenv('STATIC_ROOT', '/app/staticfiles')
STATICFILES_DIRS = [
    BASE_DIR / 'static',
    os.path.join(BASE_DIR, '..', 'dist'),
]

# Ensure static files are served correctly
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'api.User'

# CORS settings - Specific origins for production
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    'http://saydatech.ir',
    'http://www.saydatech.ir',
    'https://saydatech.ir',
    'https://www.saydatech.ir',
    'https://mech-craft-hub-main.liara.run',
    'https://sayda-engineering-platform.liara.run',
]
CORS_ALLOW_CREDENTIALS = True

# CORS headers
CORS_ALLOWED_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Security settings for production
SECURE_SSL_REDIRECT = False  # Cloudflare handles SSL redirect
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

# Cloudflare proxy settings
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# CSRF settings - Allow HTTP for Cloudflare proxy
CSRF_COOKIE_SECURE = False  # Allow HTTP cookies for Cloudflare
CSRF_COOKIE_HTTPONLY = True
CSRF_USE_SESSIONS = True
CSRF_TRUSTED_ORIGINS = [
    'http://saydatech.ir',
    'http://www.saydatech.ir',
    'https://saydatech.ir',
    'https://www.saydatech.ir',
    'https://mech-craft-hub-main.liara.run',
    'https://sayda-engineering-platform.liara.run',
]

# Session settings - Allow HTTP for Cloudflare proxy
SESSION_COOKIE_SECURE = False  # Allow HTTP cookies for Cloudflare
SESSION_COOKIE_HTTPONLY = True

# Cloudflare proxy settings
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# Authentication backends - Axes must be first
AUTHENTICATION_BACKENDS = [
    'axes.backends.AxesStandaloneBackend',  # Must be first
    'django.contrib.auth.backends.ModelBackend',
]

# django-axes Configuration - Enhanced Security
AXES_ENABLED = True  # Enable axes for production
AXES_FAILURE_LIMIT = 5  # Lock after 5 failed attempts
AXES_COOLOFF_TIME = 1  # 1 hour lockout
AXES_LOCKOUT_TEMPLATE = 'axes/lockout.html'
AXES_VERBOSE = True
AXES_LOCKOUT_PARAMETERS = ['ip_address', 'user_agent']
AXES_RESET_ON_SUCCESS = True
AXES_DISABLE_ACCESS_LOG = False
AXES_HANDLER = 'axes.handlers.database.AxesDatabaseHandler'
AXES_LOCKOUT_URL = '/locked/'
AXES_ENABLE_ADMIN = True
AXES_NEVER_LOCKOUT_WHITELIST = True
AXES_NEVER_LOCKOUT_GET = True
AXES_LOCKOUT_BY_COMBINATION_USER_AND_IP = True

# Payments (BitPay)
BITPAY_API_KEY = os.getenv('BITPAY_API_KEY', '')
BITPAY_BASE_URL = os.getenv('BITPAY_BASE_URL', 'https://api.bitpay.ir')
BITPAY_CALLBACK_URL = os.getenv('BITPAY_CALLBACK_URL', '')
BITPAY_WEBHOOK_SECRET = os.getenv('BITPAY_WEBHOOK_SECRET', '')

# Simple JWT
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
}

# Spectacular settings
SPECTACULAR_SETTINGS = {
    'TITLE': 'Mech Craft Hub API',
    'DESCRIPTION': 'API documentation for the Mech Craft Hub backend',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# Turnstile Configuration
TURNSTILE_SITE_KEY = os.environ.get("TURNSTILE_SITE_KEY")
TURNSTILE_SECRET_KEY = os.environ.get("TURNSTILE_SECRET_KEY")
TURNSTILE_VERIFY_URL = os.environ.get("TURNSTILE_VERIFY_URL", "https://challenges.cloudflare.com/turnstile/v0/siteverify")
TURNSTILE_FALLBACK_LOCAL = os.environ.get("TURNSTILE_FALLBACK_LOCAL", "False").lower() == "true"

# SMS Configuration (SMS.ir)
SMS_KEY = os.getenv('SMS_KEY')
SMS_SENDER = os.getenv('SMS_SENDER')
SMS_TEMPLATE_ID_VERIFICATION = os.getenv('SMS_TEMPLATE_ID_VERIFICATION')
SMS_TEMPLATE_ID_PASSWORD_RESET = os.getenv('SMS_TEMPLATE_ID_PASSWORD_RESET')
SMS_API_BASE_URL = os.getenv('SMS_API_BASE_URL', 'https://api.sms.ir/v1')
SMS_API_TIMEOUT = int(os.getenv('SMS_API_TIMEOUT', '30'))

# File Storage Configuration
# Liara Storage Settings for Scientific Content
FILE_STORAGE_TYPE = os.getenv('FILE_STORAGE_TYPE', 'liara')
FILE_BUCKET_NAME = os.getenv('FILE_BUCKET_NAME', 'resources')
FILE_REGION = os.getenv('FILE_REGION', 'iran')
FILE_PUBLIC_ACCESS = os.getenv('FILE_PUBLIC_ACCESS', 'True').lower() == 'true'
FILE_FALLBACK_TO_LOCAL = os.getenv('FILE_FALLBACK_TO_LOCAL', 'False').lower() == 'true'

# Liara S3 Credentials
# Support both naming conventions for backward compatibility
LIARA_ACCESS_KEY = os.getenv('LIARA_ACCESS_KEY', None)
LIARA_SECRET_KEY = os.getenv('LIARA_SECRET_KEY', None)
LIARA_ACCESS_KEY_ID = os.getenv('LIARA_ACCESS_KEY_ID', None) or LIARA_ACCESS_KEY
LIARA_SECRET_ACCESS_KEY = os.getenv('LIARA_SECRET_ACCESS_KEY', None) or LIARA_SECRET_KEY
# Support both S3_ENDPOINT_URL and LIARA_ENDPOINT_URL for compatibility
# Default to c2 endpoint as per Liara bucket settings
S3_ENDPOINT_URL = os.getenv('S3_ENDPOINT_URL', None) or os.getenv('LIARA_ENDPOINT_URL', 'https://storage.c2.liara.space')
LIARA_ENDPOINT_URL = os.getenv('LIARA_ENDPOINT_URL', None) or S3_ENDPOINT_URL

# User Files Settings (Local Storage)
USER_FILES_STORAGE = 'local'
USER_FILES_MAX_SIZE = int(os.getenv('USER_FILES_MAX_SIZE', str(100 * 1024 * 1024)))  # 100MB default

# File upload limits (used by both managers)
MAX_FILE_SIZE = int(os.getenv('MAX_FILE_SIZE', str(100 * 1024 * 1024)))  # 100MB default
ALLOWED_FILE_TYPES = os.getenv('ALLOWED_FILE_TYPES', 'pdf,image,document,cad,stl,stp,step,iges,dwg,dxf')
# Convert to list if it's a comma-separated string
if isinstance(ALLOWED_FILE_TYPES, str):
    ALLOWED_FILE_TYPES = [t.strip() for t in ALLOWED_FILE_TYPES.split(',') if t.strip()]

# Logging
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
    'loggers': {
        'api.services.sms_service': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}
