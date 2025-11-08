"""Settings package for environment-specific Django configuration."""

# This package allows using config.settings.dev and config.settings.prod
# For backward compatibility with config.settings, import from the main settings.py file
# This ensures that 'config.settings' works as before while also supporting
# 'config.settings.dev' and 'config.settings.prod'
try:
    from ..settings import *  # noqa: F401,F403
except ImportError:
    # If settings.py doesn't exist, try settings_ultra_simple
    try:
        from ..settings_ultra_simple import *  # noqa: F401,F403
    except ImportError:
        pass

