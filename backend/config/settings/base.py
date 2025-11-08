import os
from pathlib import Path

from dotenv import load_dotenv

# Import existing simple settings to reuse all current configuration safely
# Use try/except to handle cases where settings_ultra_simple might not be available
try:
    from ..settings_ultra_simple import *  # noqa: F401,F403
except ImportError:
    # Fallback: import from main settings if ultra_simple is not available
    from ..settings import *  # noqa: F401,F403

# Resolve repo paths: backend/ directory
ROOT_DIR = Path(__file__).resolve().parents[2]

# Load environment files if present (no effect in Liara unless provided)
load_dotenv(ROOT_DIR / ".env", override=False)
load_dotenv(ROOT_DIR / ".env.development", override=False)


def _to_bool(value: str, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


# Allow overriding common flags via env (keeps defaults from imported settings)
DEBUG = _to_bool(os.getenv("DEBUG"), globals().get("DEBUG", False))

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    globals().get("SECRET_KEY", "dev-insecure-secret-key"),
)

_default_allowed = (
    ",".join(globals()["ALLOWED_HOSTS"]) if "ALLOWED_HOSTS" in globals() else "localhost,127.0.0.1"
)
ALLOWED_HOSTS = [host.strip() for host in os.getenv("ALLOWED_HOSTS", _default_allowed).split(",") if host.strip()]

_csrf_default = ",".join(globals()["CSRF_TRUSTED_ORIGINS"]) if "CSRF_TRUSTED_ORIGINS" in globals() else ""
CSRF_TRUSTED_ORIGINS = [o.strip() for o in os.getenv("CSRF_TRUSTED_ORIGINS", _csrf_default).split(",") if o.strip()]


