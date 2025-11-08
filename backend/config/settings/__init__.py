"""Settings package for environment-specific Django configuration."""

# Import the main settings file to maintain backward compatibility
# This allows 'config.settings' to work as before while also supporting
# 'config.settings.dev' and 'config.settings.prod'
try:
    from ..settings import *  # noqa: F401,F403
except ImportError:
    # If settings.py doesn't exist, try settings_ultra_simple
    from ..settings_ultra_simple import *  # noqa: F401,F403

