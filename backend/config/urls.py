"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.http import JsonResponse, HttpResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
import os

def home_view(request, path=None):
    # Serve the frontend index.html for all routes
    frontend_path = os.path.join(settings.BASE_DIR.parent, 'dist', 'index.html')
    if os.path.exists(frontend_path):
        with open(frontend_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return HttpResponse(content, content_type='text/html')
    else:
        # Fallback to API info if frontend not found
        return JsonResponse({
            'message': 'MechCraft Hub API',
            'version': '1.0.0',
            'status': 'running',
            'docs': '/api/docs/',
            'admin': '/admin/',
            'note': 'Frontend not found, serving API only',
            'requested_path': path
        })

def favicon_view(request):
    favicon_path = os.path.join(settings.BASE_DIR, 'static', 'favicon.ico')
    if os.path.exists(favicon_path):
        with open(favicon_path, 'rb') as f:
            return HttpResponse(f.read(), content_type='image/x-icon')
    return HttpResponse(status=404)

def asset_view(request, path):
    """Serve frontend assets"""
    asset_path = os.path.join(settings.BASE_DIR.parent, 'dist', 'assets', path)
    if os.path.exists(asset_path):
        # Determine content type based on file extension
        if path.endswith('.css'):
            content_type = 'text/css'
        elif path.endswith('.js'):
            content_type = 'application/javascript'
        elif path.endswith('.png'):
            content_type = 'image/png'
        elif path.endswith('.jpg') or path.endswith('.jpeg'):
            content_type = 'image/jpeg'
        elif path.endswith('.svg'):
            content_type = 'image/svg+xml'
        else:
            content_type = 'application/octet-stream'
        
        with open(asset_path, 'rb') as f:
            return HttpResponse(f.read(), content_type=content_type)
    return HttpResponse(status=404)

urlpatterns = [
    path('', home_view, name='home'),
    path('favicon.ico', favicon_view, name='favicon'),
    path('assets/<path:path>', asset_view, name='assets'),
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('api.urls')),
    
    # SPA fallback (exclude api/admin/static/media/assets)
    re_path(r'^(?!api/|admin/|static/|media/|assets/).*$', home_view, name='spa_fallback'),
]

# Serve media files
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Serve static files for frontend (always, not just in DEBUG)
urlpatterns += static('/static/', document_root=settings.STATIC_ROOT)
urlpatterns += static('/assets/', document_root=os.path.join(settings.BASE_DIR.parent, 'dist', 'assets'))
