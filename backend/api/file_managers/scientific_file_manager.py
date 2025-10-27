import os
import hashlib
from datetime import datetime
from django.conf import settings
from django.core.files.base import ContentFile
import logging

from .base_file_manager import BaseFileManager, boto3, BOTO3_AVAILABLE, ClientError

logger = logging.getLogger(__name__)


class ScientificFileManager(BaseFileManager):
    """File manager for scientific content (articles, books) - Uses Liara S3"""
    
    def __init__(self):
        super().__init__()
        self.storage_type = 'liara'
        self.bucket_name = getattr(settings, 'FILE_BUCKET_NAME', 'resources')
        self.region = getattr(settings, 'FILE_REGION', 'iran')
        
        logger.info(f"ScientificFileManager initialized with storage_type: {self.storage_type}, bucket: {self.bucket_name}")
        
        if BOTO3_AVAILABLE:
            # Use Liara credentials
            aws_access_key_id = getattr(settings, 'LIARA_ACCESS_KEY_ID', None)
            aws_secret_access_key = getattr(settings, 'LIARA_SECRET_ACCESS_KEY', None)
            
            # Check if credentials are available
            if not aws_access_key_id or not aws_secret_access_key:
                logger.warning(f"No Liara credentials available, scientific content upload will fail")
                self.s3_client = None
            else:
                self.s3_client = boto3.client(
                    's3',
                    endpoint_url=getattr(settings, 'S3_ENDPOINT_URL', None),
                    aws_access_key_id=aws_access_key_id,
                    aws_secret_access_key=aws_secret_access_key,
                    region_name=self.region
                )
                logger.info(f"S3 client created for Liara bucket: {self.bucket_name}")
        else:
            logger.error("boto3 not available, scientific content upload will fail")
            self.s3_client = None
    
    def generate_file_path(self, file_name, content_type):
        """Generate file path based on content type"""
        timestamp = datetime.now().strftime('%Y/%m/%d')
        file_hash = hashlib.md5(file_name.encode()).hexdigest()[:8]
        
        # Determine folder based on file type
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
        
        # Generate unique filename
        name, ext = os.path.splitext(file_name)
        unique_name = f"{name}_{file_hash}{ext}"
        
        return f"scientific-content/{folder}/{timestamp}/{unique_name}"
    
    def upload_file(self, file_obj, file_name, content_type):
        """Upload file to Liara S3"""
        try:
            if not self.s3_client:
                return {
                    'success': False,
                    'error': 'Liara S3 client not available. Please check credentials.'
                }
            
            logger.info(f"Starting file upload to S3: {file_name}")
            file_path = self.generate_file_path(file_name, content_type)
            logger.info(f"Generated S3 path: {file_path}")
            
            # Upload to S3
            file_obj.seek(0)
            self.s3_client.upload_fileobj(
                file_obj,
                self.bucket_name,
                file_path,
                ExtraArgs={
                    'ContentType': content_type,
                    'ACL': 'public-read'  # Scientific content is public
                }
            )
            
            # Generate public URL
            endpoint_url = getattr(settings, 'S3_ENDPOINT_URL', 'https://storage.c2.liara.space')
            file_url = f"{endpoint_url}/{self.bucket_name}/{file_path}"
            
            return {
                'success': True,
                'file_path': file_path,
                'file_url': file_url,
                'file_size': file_obj.size,
                'storage_type': 's3'
            }
            
        except Exception as e:
            logger.error(f"Error uploading file to S3: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
