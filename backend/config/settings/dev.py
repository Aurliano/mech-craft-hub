import os
from pathlib import Path

from .base import *  # noqa: F401,F403

# Ensure development-friendly defaults
DEBUG = True

# Use SQLite database locally
_root_dir = Path(__file__).resolve().parents[2]
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": os.path.join(_root_dir, "db.sqlite3"),
    }
}

# Console email backend for development (can be overridden via env)
EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend",
)

# Allow localhost by default
if "ALLOWED_HOSTS" not in globals() or not ALLOWED_HOSTS:
    ALLOWED_HOSTS = ["localhost", "127.0.0.1", "[::1]"]

# CORS settings for development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",  # Vite default port
    "http://127.0.0.1:5173",
    "http://localhost:3000",  # Alternative dev port
    "http://127.0.0.1:3000",
    "http://localhost:8000",  # Django dev server
    "http://127.0.0.1:8000",
]

CORS_ALLOW_CREDENTIALS = True

# CSRF trusted origins for development
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# CSRF settings for development - exempt API endpoints from CSRF
# This is safe because API uses JWT authentication, not session-based auth
CSRF_COOKIE_SECURE = False  # Allow HTTP in development
CSRF_USE_SESSIONS = False  # Use cookies instead of sessions for CSRF in development
CSRF_COOKIE_HTTPONLY = False  # Allow JavaScript to read CSRF cookie in development
CSRF_COOKIE_SAMESITE = 'Lax'  # Allow cross-site requests in development


