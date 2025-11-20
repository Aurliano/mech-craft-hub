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

class FileManager:
    """مدیریت فایل‌ها برای مقالات و کتاب‌ها"""
    
    def __init__(self):
        self.storage_type = getattr(settings, 'FILE_STORAGE_TYPE', 'liara')  # Default to liara instead of local
        self.bucket_name = getattr(settings, 'FILE_BUCKET_NAME', 'resources')
        self.region = getattr(settings, 'FILE_REGION', 'iran')
        
        logger.info(f"FileManager initialized with storage_type: {self.storage_type}, bucket: {self.bucket_name}")
        
        if self.storage_type in ['s3', 'liara'] and BOTO3_AVAILABLE:
            # Use Liara credentials for scientific content storage
            if self.storage_type == 'liara':
                # Try both naming conventions for backward compatibility
                aws_access_key_id = getattr(settings, 'LIARA_ACCESS_KEY_ID', None) or getattr(settings, 'LIARA_ACCESS_KEY', None)
                aws_secret_access_key = getattr(settings, 'LIARA_SECRET_ACCESS_KEY', None) or getattr(settings, 'LIARA_SECRET_KEY', None)
            else:
                aws_access_key_id = getattr(settings, 'AWS_ACCESS_KEY_ID', None)
                aws_secret_access_key = getattr(settings, 'AWS_SECRET_ACCESS_KEY', None)
            
            # Check if credentials are available
            if not aws_access_key_id or not aws_secret_access_key:
                logger.warning(f"No credentials available for {self.storage_type}, falling back to local storage")
                self.storage_type = 'local'
                self.s3_client = None
            else:
                endpoint_url = getattr(settings, 'S3_ENDPOINT_URL', None) or getattr(settings, 'LIARA_ENDPOINT_URL', None)
                if not endpoint_url and self.storage_type == 'liara':
                    endpoint_url = 'https://storage.iran.liara.space'
                
                self.s3_client = boto3.client(
                    's3',
                    endpoint_url=endpoint_url,
                    aws_access_key_id=aws_access_key_id,
                    aws_secret_access_key=aws_secret_access_key,
                    region_name=self.region
                )
            
                # Skip connection test to avoid startup crashes
                logger.info(f"S3/Liara client created for {self.storage_type} bucket: {self.bucket_name}, endpoint: {endpoint_url}")
                logger.warning("Connection test skipped to prevent startup crashes")
        else:
            self.s3_client = None
            if self.storage_type in ['s3', 'liara'] and not BOTO3_AVAILABLE:
                logger.warning("boto3 not available, falling back to local storage")
                self.storage_type = 'local'
    
    def generate_file_path(self, file_name, content_type):
        """تولید مسیر فایل بر اساس نوع محتوا"""
        timestamp = datetime.now().strftime('%Y/%m/%d')
        file_hash = hashlib.md5(file_name.encode()).hexdigest()[:8]
        
        # تعیین پوشه بر اساس نوع فایل
        if content_type.startswith('application/pdf'):
            folder = 'books'
        elif content_type.startswith('application/vnd.openxmlformats') or content_type.startswith('application/msword'):
            folder = 'documents'
        elif content_type.startswith('video/'):
            folder = 'videos'
        elif content_type.startswith('application/'):
            folder = 'software'
        else:
            folder = 'others'
        
        # تولید نام فایل منحصر به فرد
        name, ext = os.path.splitext(file_name)
        unique_name = f"{name}_{file_hash}{ext}"
        
        return f"scientific-content/{folder}/{timestamp}/{unique_name}"
    
    def upload_file(self, file_obj, file_name, content_type):
        """آپلود فایل"""
        try:
            logger.info(f"Starting file upload: {file_name}, storage_type: {self.storage_type}, s3_client: {self.s3_client is not None}")
            file_path = self.generate_file_path(file_name, content_type)
            logger.info(f"Generated file path: {file_path}")
            
            if self.storage_type == 'local':
                # آپلود محلی - ایجاد پوشه‌ها در صورت عدم وجود
                try:
                    # اطمینان از وجود پوشه‌های مورد نیاز
                    os.makedirs(os.path.join(settings.MEDIA_ROOT, 'scientific-content'), exist_ok=True)
                    os.makedirs(os.path.join(settings.MEDIA_ROOT, os.path.dirname(file_path)), exist_ok=True)
                    
                    full_path = default_storage.save(file_path, ContentFile(file_obj.read()))
                    file_obj.seek(0)  # Reset file pointer
                    return {
                        'success': True,
                        'file_path': full_path,
                        'file_url': default_storage.url(full_path),
                        'file_size': file_obj.size
                    }
                except PermissionError as e:
                    logger.error(f"Permission denied creating directory: {str(e)}")
                    return {
                        'success': False,
                        'error': f'Permission denied: {str(e)}'
                    }
            
            elif self.storage_type in ['s3', 'liara']:
                if not self.s3_client:
                    logger.error(f"S3/Liara client not available for storage_type: {self.storage_type}")
                    return {
                        'success': False,
                        'error': f'S3/Liara client not available. Please check credentials and connection.'
                    }
                
                # آپلود به S3/Liara
                file_obj.seek(0)
                try:
                    # Liara doesn't support ACL parameter in the same way as AWS
                    # Remove ACL for Liara compatibility
                    extra_args = {'ContentType': content_type}
                    # Only add ACL for AWS S3, not for Liara
                    if self.storage_type == 's3' and getattr(settings, 'FILE_PUBLIC_ACCESS', True):
                        extra_args['ACL'] = 'public-read'
                    
                    self.s3_client.upload_fileobj(
                        file_obj,
                        self.bucket_name,
                        file_path,
                        ExtraArgs=extra_args
                    )
                    logger.info(f"File uploaded successfully to {self.bucket_name}/{file_path}")
                except ClientError as e:
                    # Log detailed error for debugging
                    error_code = e.response.get('Error', {}).get('Code', 'Unknown')
                    error_message = e.response.get('Error', {}).get('Message', str(e))
                    logger.error(f"S3 upload failed - Code: {error_code}, Message: {error_message}")
                    raise Exception(f"S3 upload error: {error_code} - {error_message}")
                
                # تولید URL عمومی - URL-encode the path to handle spaces and special characters
                if getattr(settings, 'FILE_PUBLIC_ACCESS', True):
                    # URL-encode each path segment separately to preserve directory structure
                    path_parts = file_path.split('/')
                    encoded_parts = [quote(part, safe='') for part in path_parts]
                    encoded_path = '/'.join(encoded_parts)
                    if self.storage_type == 'liara':
                        # URL لیارا - استفاده از endpoint اصلی
                        endpoint_url = getattr(settings, 'S3_ENDPOINT_URL', None) or getattr(settings, 'LIARA_ENDPOINT_URL', 'https://storage.iran.liara.space')
                        file_url = f"{endpoint_url}/{self.bucket_name}/{encoded_path}"
                    else:
                        # URL AWS S3
                        file_url = f"https://{self.bucket_name}.{self.region}.amazonaws.com/{encoded_path}"
                else:
                    # برای فایل‌های خصوصی، URL موقت تولید کنید
                    file_url = self.s3_client.generate_presigned_url(
                        'get_object',
                        Params={'Bucket': self.bucket_name, 'Key': file_path},
                        ExpiresIn=3600  # 1 ساعت
                    )
                
                return {
                    'success': True,
                    'file_path': file_path,
                    'file_url': file_url,
                    'file_size': file_obj.size
                }
            else:
                # Check if fallback to local storage is enabled
                fallback_enabled = getattr(settings, 'FILE_FALLBACK_TO_LOCAL', False)
                if fallback_enabled:
                    logger.warning("S3/Liara not available, using local storage fallback")
                    full_path = default_storage.save(file_path, ContentFile(file_obj.read()))
                    file_obj.seek(0)
                    return {
                        'success': True,
                        'file_path': full_path,
                        'file_url': default_storage.url(full_path),
                        'file_size': file_obj.size
                    }
                else:
                    logger.error("S3/Liara not available and fallback disabled")
                    return {
                        'success': False,
                        'error': 'S3/Liara storage not available. Please contact administrator.'
                    }
            
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            logger.error(f"Error uploading file: {str(e)}\n{error_details}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def delete_file(self, file_path):
        """حذف فایل"""
        try:
            if self.storage_type == 'local':
                if default_storage.exists(file_path):
                    default_storage.delete(file_path)
                    return {'success': True}
            
            elif self.storage_type in ['s3', 'liara'] and self.s3_client:
                self.s3_client.delete_object(Bucket=self.bucket_name, Key=file_path)
                return {'success': True}
            
        except Exception as e:
            logger.error(f"Error deleting file: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_file_url(self, file_path, is_public=True):
        """دریافت URL فایل"""
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
                        endpoint_url = getattr(settings, 'S3_ENDPOINT_URL', None) or getattr(settings, 'LIARA_ENDPOINT_URL', 'https://storage.iran.liara.space')
                        return f"{endpoint_url}/{self.bucket_name}/{encoded_path}"
                    else:
                        return f"https://{self.bucket_name}.{self.region}.amazonaws.com/{encoded_path}"
                else:
                    # URL موقت برای فایل‌های خصوصی
                    return self.s3_client.generate_presigned_url(
                        'get_object',
                        Params={'Bucket': self.bucket_name, 'Key': file_path},
                        ExpiresIn=3600
                    )
            
        except Exception as e:
            logger.error(f"Error getting file URL: {str(e)}")
            return None
    
    def get_file_info(self, file_path):
        """دریافت اطلاعات فایل"""
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


# Instance برای استفاده در سراسر پروژه
file_manager = FileManager()

# Import new managers for gradual migration
from .file_managers import scientific_file_manager, user_file_manager