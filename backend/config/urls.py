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
from django.contrib.sitemaps.views import sitemap
from django.urls import path, include, re_path
from django.http import JsonResponse, HttpResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from backend.config.sitemaps import sitemaps
from backend.config.seo_views import robots_txt
import os
from django.views.static import serve as static_serve

# Safe import for contractor check-manufacturing endpoint to prevent runtime issues
try:
    from backend.api.views import check_contractor_manufacturing_service as _check_contractor_manufacturing_service
except Exception:
    _check_contractor_manufacturing_service = None

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

def service_worker_view(request):
    """Serve service worker from public (fallback to dist)"""
    sw_path = os.path.join(settings.BASE_DIR.parent, 'public', 'service-worker.js')
    if not os.path.exists(sw_path):
        sw_path = os.path.join(settings.BASE_DIR.parent, 'dist', 'service-worker.js')
    if os.path.exists(sw_path):
        with open(sw_path, 'r', encoding='utf-8') as f:
            content = f.read()
        response = HttpResponse(content, content_type='application/javascript; charset=utf-8')
        response['Service-Worker-Allowed'] = '/'
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response
    return HttpResponse(status=404)

def manifest_view(request):
    """Serve manifest.json from public (fallback to dist)"""
    manifest_path = os.path.join(settings.BASE_DIR.parent, 'public', 'manifest.json')
    if not os.path.exists(manifest_path):
        manifest_path = os.path.join(settings.BASE_DIR.parent, 'dist', 'manifest.json')
    if os.path.exists(manifest_path):
        with open(manifest_path, 'r', encoding='utf-8') as f:
            content = f.read()
        response = HttpResponse(content, content_type='application/manifest+json; charset=utf-8')
        response['Cache-Control'] = 'public, max-age=31536000'
        return response
    return HttpResponse(status=404)

def icon_view(request, path):
    """Serve PWA icons from public/favicon"""
    icon_path = os.path.join(settings.BASE_DIR.parent, 'public', 'favicon', path)
    if os.path.exists(icon_path):
        with open(icon_path, 'rb') as f:
            content = f.read()
        response = HttpResponse(content, content_type='image/png')
        response['Cache-Control'] = 'public, max-age=31536000'
        return response
    # Fallback: redirect legacy /icons/* requests to available primary icons
    # Map common legacy sizes to apple-touch-icon or 192/512 fallbacks
    fallback_map = {
        'icon-144x144.png': '/favicon/apple-touch-icon.png',
        'icon-152x152.png': '/favicon/apple-touch-icon.png',
        'icon-128x128.png': '/favicon/apple-touch-icon.png',
        'icon-192x192.png': '/favicon/web-app-manifest-192x192.png',
        'icon-512x512.png': '/favicon/web-app-manifest-512x512.png',
    }
    target = fallback_map.get(path)
    if target:
        resp = HttpResponse(status=302)
        resp['Location'] = target
        return resp
    return HttpResponse(status=404)

def screenshot_view(request, path):
    """Serve PWA screenshots from public/screenshots"""
    screenshot_path = os.path.join(settings.BASE_DIR.parent, 'public', 'screenshots', path)
    if os.path.exists(screenshot_path):
        with open(screenshot_path, 'rb') as f:
            content = f.read()
        response = HttpResponse(content, content_type='image/png')
        response['Cache-Control'] = 'public, max-age=31536000'
        return response
    return HttpResponse(status=404)

def favicon_dir_view(request, path):
    """Serve files under /favicon/* from public/favicon"""
    fpath = os.path.join(settings.BASE_DIR.parent, 'public', 'favicon', path)
    if os.path.exists(fpath):
        # Set content type by extension
        if path.endswith('.png'):
            ctype = 'image/png'
        elif path.endswith('.svg'):
            ctype = 'image/svg+xml'
        elif path.endswith('.ico'):
            ctype = 'image/x-icon'
        elif path.endswith('.webmanifest') or path.endswith('.json'):
            ctype = 'application/manifest+json; charset=utf-8'
        else:
            ctype = 'application/octet-stream'
        with open(fpath, 'rb') as f:
            return HttpResponse(f.read(), content_type=ctype)
    return HttpResponse(status=404)

def pwa_debug_script_view(request, filename):
    """Serve PWA debug/test scripts"""
    script_path = os.path.join(settings.BASE_DIR.parent, 'dist', filename)
    if os.path.exists(script_path):
        with open(script_path, 'r', encoding='utf-8') as f:
            content = f.read()
        response = HttpResponse(content, content_type='application/javascript; charset=utf-8')
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        return response
    return HttpResponse(status=404)

urlpatterns = [
    path('', home_view, name='home'),
    path('favicon.ico', favicon_view, name='favicon'),
    path('assets/<path:path>', asset_view, name='assets'),
    
    # PWA endpoints - MUST come before SPA fallback
    path('service-worker.js', service_worker_view, name='service_worker'),
    path('manifest.json', manifest_view, name='manifest'),
    path('pwa-debug.js', lambda r: pwa_debug_script_view(r, 'pwa-debug.js'), name='pwa_debug'),
    path('pwa-test.js', lambda r: pwa_debug_script_view(r, 'pwa-test.js'), name='pwa_test'),
    path('mime-test.js', lambda r: pwa_debug_script_view(r, 'mime-test.js'), name='mime_test'),
    path('icons/<path:path>', icon_view, name='icons'),
    path('favicon/<path:path>', favicon_dir_view, name='favicon_dir'),
    path('screenshots/<path:path>', screenshot_view, name='screenshots'),
    
    # SEO endpoints
    path('robots.txt', robots_txt, name='robots_txt'),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    
    # Health check endpoint - must be before api.urls to bypass middleware
    path('api/health/', lambda r: JsonResponse({'status': 'ok'}), name='health_check'),
    
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('backend.api.urls')),
    
    # SPA fallback (exclude api/admin/static/media/assets/robots/sitemap/pwa files)
    re_path(r'^(?!api/|admin/|static/|media/|assets/|icons/|favicon/|screenshots/|robots\.txt|sitemap\.xml|service-worker\.js|manifest\.json|pwa-debug\.js|pwa-test\.js|mime-test\.js).*$', home_view, name='spa_fallback'),
]

# Serve media subpaths explicitly
urlpatterns += [
    # /media/uploads/* (for UploadView and similar)
    re_path(r'^media/uploads/(?P<path>.*)$', static_serve, {
        'document_root': os.path.join(settings.MEDIA_ROOT, 'uploads')
    }),
    # /media/user-uploads/* (for UserFileManager local files)
    re_path(r'^media/user-uploads/(?P<path>.*)$', static_serve, {
        'document_root': os.path.join(settings.MEDIA_ROOT, 'user-uploads')
    }),
]

# Add explicit alias only if the view import succeeded
if _check_contractor_manufacturing_service:
    urlpatterns.insert(
        -1,
        path(
            'api/v1/contractor/check-manufacturing/',
            _check_contractor_manufacturing_service,
            name='check_contractor_manufacturing_service_alias'
        )
    )

# Serve media files
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Serve static files for frontend (always, not just in DEBUG)
urlpatterns += static('/static/', document_root=settings.STATIC_ROOT)
urlpatterns += static('/assets/', document_root=os.path.join(settings.BASE_DIR.parent, 'dist', 'assets'))
