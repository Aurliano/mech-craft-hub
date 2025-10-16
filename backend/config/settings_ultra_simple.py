"""
Ultra-simple Django settings for Liara deployment
"""

import os
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
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'django_filters',
    'corsheaders',
    'drf_spectacular',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'api.middleware.CSRFProtectionMiddleware',  # Custom CSRF middleware
    'django.contrib.auth.middleware.AuthenticationMiddleware',
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

# Database - Force PostgreSQL configuration for Liara
# Override any DATABASE_URL that might be set
os.environ.pop('DATABASE_URL', None)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'postgres',
        'USER': 'root',
        'PASSWORD': 'honm5klCHxMeLN9Rd8vkBegF',
        'HOST': 'sayda-db',
        'PORT': '5432',
        'OPTIONS': {
            'connect_timeout': 10,
        }
    }
}

# Debug: Print database configuration
print("=" * 50)
print("DATABASE CONFIGURATION:")
print(f"User: {DATABASES['default']['USER']}")
print(f"Host: {DATABASES['default']['HOST']}")
print(f"Port: {DATABASES['default']['PORT']}")
print(f"Database: {DATABASES['default']['NAME']}")
print(f"Password: {'***' if DATABASES['default']['PASSWORD'] else 'None'}")
print("=" * 50)

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
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
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

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
