import os
import mimetypes
import hashlib
from datetime import datetime
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import boto3
from botocore.exceptions import ClientError
import logging

logger = logging.getLogger(__name__)

class FileManager:
    """مدیریت فایل‌ها برای مقالات و کتاب‌ها"""
    
    def __init__(self):
        self.storage_type = getattr(settings, 'FILE_STORAGE_TYPE', 'local')  # local, s3, liara
        self.bucket_name = getattr(settings, 'FILE_BUCKET_NAME', 'mechcraft-files')
        self.region = getattr(settings, 'FILE_REGION', 'iran')
        
        if self.storage_type in ['s3', 'liara']:
            self.s3_client = boto3.client(
                's3',
                endpoint_url=getattr(settings, 'S3_ENDPOINT_URL', None),
                aws_access_key_id=getattr(settings, 'AWS_ACCESS_KEY_ID', None),
                aws_secret_access_key=getattr(settings, 'AWS_SECRET_ACCESS_KEY', None),
                region_name=self.region
            )
    
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
            file_path = self.generate_file_path(file_name, content_type)
            
            if self.storage_type == 'local':
                # آپلود محلی
                full_path = default_storage.save(file_path, ContentFile(file_obj.read()))
                file_obj.seek(0)  # Reset file pointer
                return {
                    'success': True,
                    'file_path': full_path,
                    'file_url': default_storage.url(full_path),
                    'file_size': file_obj.size
                }
            
            elif self.storage_type in ['s3', 'liara']:
                # آپلود به S3/Liara
                file_obj.seek(0)
                self.s3_client.upload_fileobj(
                    file_obj,
                    self.bucket_name,
                    file_path,
                    ExtraArgs={
                        'ContentType': content_type,
                        'ACL': 'public-read' if getattr(settings, 'FILE_PUBLIC_ACCESS', True) else 'private'
                    }
                )
                
                # تولید URL عمومی
                if getattr(settings, 'FILE_PUBLIC_ACCESS', True):
                    if self.storage_type == 'liara':
                        # URL لیارا - استفاده از endpoint اصلی
                        endpoint_url = getattr(settings, 'S3_ENDPOINT_URL', 'https://storage.c2.liara.space')
                        file_url = f"{endpoint_url}/{self.bucket_name}/{file_path}"
                    else:
                        # URL AWS S3
                        file_url = f"https://{self.bucket_name}.{self.region}.amazonaws.com/{file_path}"
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
            
        except Exception as e:
            logger.error(f"Error uploading file: {str(e)}")
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
            
            elif self.storage_type in ['s3', 'liara']:
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
            
            elif self.storage_type in ['s3', 'liara']:
                if is_public and getattr(settings, 'FILE_PUBLIC_ACCESS', True):
                    if self.storage_type == 'liara':
                        endpoint_url = getattr(settings, 'S3_ENDPOINT_URL', 'https://storage.c2.liara.space')
                        return f"{endpoint_url}/{self.bucket_name}/{file_path}"
                    else:
                        return f"https://{self.bucket_name}.{self.region}.amazonaws.com/{file_path}"
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
            
            elif self.storage_type in ['s3', 'liara']:
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
