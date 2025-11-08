"""
ASGI config for config project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

# In production (Liara), DJANGO_SETTINGS_MODULE is set via Dockerfile/liara.json
# This setdefault only applies if the env var is not already set (local dev)
# For local dev, manage.py will override this with config.settings.dev
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = get_asgi_application()
