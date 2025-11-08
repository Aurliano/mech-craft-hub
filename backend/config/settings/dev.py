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


