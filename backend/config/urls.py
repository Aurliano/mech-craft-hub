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
from django.urls import path, include
from django.http import JsonResponse, HttpResponse
from django.views.generic import RedirectView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from api.monitoring import metrics_view, health_check
import os

def home_view(request):
    return JsonResponse({
        'message': 'MechCraft Hub API',
        'version': '1.0.0',
        'status': 'running',
        'docs': '/api/docs/',
        'admin': '/admin/'
    })

def favicon_view(request):
    favicon_path = os.path.join(settings.BASE_DIR, 'static', 'favicon.ico')
    if os.path.exists(favicon_path):
        with open(favicon_path, 'rb') as f:
            return HttpResponse(f.read(), content_type='image/x-icon')
    return HttpResponse(status=404)

urlpatterns = [
    path('', home_view, name='home'),
    path('favicon.ico', favicon_view, name='favicon'),
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('api.urls')),
    # Monitoring endpoints
    path('health/', health_check, name='health_check'),
    path('metrics/', metrics_view, name='metrics'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
