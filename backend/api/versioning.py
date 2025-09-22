from rest_framework.versioning import URLPathVersioning, AcceptHeaderVersioning, QueryParameterVersioning
from rest_framework.versioning import NamespaceVersioning
from rest_framework.response import Response
from rest_framework import status


class CustomURLPathVersioning(URLPathVersioning):
    """
    Custom URL path versioning with better error handling
    """
    default_version = 'v1'
    allowed_versions = ['v1', 'v2']
    version_param = 'version'
    
    def determine_version(self, request, *args, **kwargs):
        version = super().determine_version(request, *args, **kwargs)
        
        if version not in self.allowed_versions:
            return self.default_version
            
        return version


class CustomAcceptHeaderVersioning(AcceptHeaderVersioning):
    """
    Custom accept header versioning
    """
    default_version = 'v1'
    allowed_versions = ['v1', 'v2']
    version_param = 'version'
    
    def determine_version(self, request, *args, **kwargs):
        version = super().determine_version(request, *args, **kwargs)
        
        if version not in self.allowed_versions:
            return self.default_version
            
        return version


class CustomQueryParameterVersioning(QueryParameterVersioning):
    """
    Custom query parameter versioning
    """
    default_version = 'v1'
    allowed_versions = ['v1', 'v2']
    version_param = 'version'
    
    def determine_version(self, request, *args, **kwargs):
        version = super().determine_version(request, *args, **kwargs)
        
        if version not in self.allowed_versions:
            return self.default_version
            
        return version


class CustomNamespaceVersioning(NamespaceVersioning):
    """
    Custom namespace versioning
    """
    default_version = 'v1'
    allowed_versions = ['v1', 'v2']
    version_param = 'version'
    
    def determine_version(self, request, *args, **kwargs):
        version = super().determine_version(request, *args, **kwargs)
        
        if version not in self.allowed_versions:
            return self.default_version
            
        return version


def get_version_info():
    """
    Get information about available API versions
    """
    return {
        'current_version': 'v1',
        'supported_versions': ['v1', 'v2'],
        'default_version': 'v1',
        'versioning_methods': [
            'URL Path (e.g., /api/v1/orders/)',
            'Query Parameter (e.g., /api/orders/?version=v1)',
            'Accept Header (e.g., Accept: application/json; version=v1)',
            'Namespace (e.g., /api/v1/orders/)'
        ],
        'deprecation_policy': {
            'v1': {
                'status': 'current',
                'deprecated': False,
                'sunset_date': None,
                'migration_guide': None
            },
            'v2': {
                'status': 'development',
                'deprecated': False,
                'sunset_date': None,
                'migration_guide': None
            }
        }
    }


def version_deprecated_response(version, sunset_date=None):
    """
    Create a deprecation warning response
    """
    return Response({
        'warning': f'API version {version} is deprecated',
        'sunset_date': sunset_date,
        'migration_guide': 'Please migrate to the latest version. See /api/version/ for details.',
        'current_version': 'v1'
    }, status=status.HTTP_200_OK, headers={
        'Deprecation': 'true',
        'Sunset': sunset_date or '',
        'API-Version': 'v1'
    })
