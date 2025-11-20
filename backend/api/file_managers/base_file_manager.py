import os
import mimetypes
import hashlib
from datetime import datetime
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import logging
from urllib.parse import quote

# Import boto3 with fallback
try:
    import boto3  # type: ignore
    from botocore.exceptions import ClientError  # type: ignore
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False
    boto3 = None  # type: ignore
    ClientError = Exception

logger = logging.getLogger(__name__)


class BaseFileManager:
    """Base class for file managers"""
    
    def __init__(self):
        self.storage_type = getattr(settings, 'FILE_STORAGE_TYPE', 'local')
        self.bucket_name = None
        self.region = 'iran'
        self.s3_client = None
        
    def generate_file_path(self, file_name, content_type):
        """Generate file path based on content type"""
        raise NotImplementedError("Subclasses must implement generate_file_path")
    
    def upload_file(self, file_obj, file_name, content_type):
        """Upload file"""
        raise NotImplementedError("Subclasses must implement upload_file")
    
    def delete_file(self, file_path):
        """Delete file"""
        try:
            if self.storage_type == 'local':
                if default_storage.exists(file_path):
                    default_storage.delete(file_path)
                    return {'success': True}
            
            elif self.storage_type in ['s3', 'liara'] and self.s3_client:
                self.s3_client.delete_object(Bucket=self.bucket_name, Key=file_path)
                return {'success': True}
            
            return {'success': False, 'error': 'Storage not configured'}
            
        except Exception as e:
            logger.error(f"Error deleting file: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_file_url(self, file_path, is_public=True):
        """Get file URL"""
        try:
            if self.storage_type == 'local':
                return default_storage.url(file_path)
            
            elif self.storage_type in ['s3', 'liara'] and self.s3_client:
                if is_public and getattr(settings, 'FILE_PUBLIC_ACCESS', True):
                    # URL-encode the path to handle spaces and special characters
                    path_parts = file_path.split('/')
                    encoded_parts = [quote(part, safe='') for part in path_parts]
                    encoded_path = '/'.join(encoded_parts)
                    if self.storage_type == 'liara':
                        endpoint_url = getattr(settings, 'S3_ENDPOINT_URL', 'https://storage.c2.liara.space')
                        return f"{endpoint_url}/{self.bucket_name}/{encoded_path}"
                    else:
                        return f"https://{self.bucket_name}.{self.region}.amazonaws.com/{encoded_path}"
                else:
                    # Presigned URL for private files
                    return self.s3_client.generate_presigned_url(
                        'get_object',
                        Params={'Bucket': self.bucket_name, 'Key': file_path},
                        ExpiresIn=3600
                    )
            
        except Exception as e:
            logger.error(f"Error getting file URL: {str(e)}")
            return None
    
    def get_file_info(self, file_path):
        """Get file info"""
        try:
            if self.storage_type == 'local':
                if default_storage.exists(file_path):
                    return {
                        'exists': True,
                        'size': default_storage.size(file_path),
                        'url': default_storage.url(file_path)
                    }
                return {'exists': False}
            
            elif self.storage_type in ['s3', 'liara'] and self.s3_client:
                response = self.s3_client.head_object(Bucket=self.bucket_name, Key=file_path)
                return {
                    'exists': True,
                    'size': response['ContentLength'],
                    'content_type': response.get('ContentType', 'application/octet-stream'),
                    'last_modified': response.get('LastModified'),
                    'url': self.get_file_url(file_path)
                }
            
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return {'exists': False}
            logger.error(f"Error getting file info: {str(e)}")
            return {'exists': False, 'error': str(e)}
        except Exception as e:
            logger.error(f"Error getting file info: {str(e)}")
            return {'exists': False, 'error': str(e)}
