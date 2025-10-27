import os
import hashlib
from datetime import datetime
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import logging

from .base_file_manager import BaseFileManager

logger = logging.getLogger(__name__)


class UserFileManager(BaseFileManager):
    """File manager for user uploads (orders, deliveries) - Uses local storage"""
    
    def __init__(self):
        super().__init__()
        self.storage_type = 'local'
        self.base_path = 'user-uploads'
        
        logger.info(f"UserFileManager initialized with storage_type: {self.storage_type}")
    
    def generate_file_path(self, file_name, content_type, user_id=None, order_id=None):
        """Generate file path based on user and order"""
        timestamp = datetime.now().strftime('%Y/%m/%d')
        file_hash = hashlib.md5(f"{file_name}{user_id}{order_id}".encode()).hexdigest()[:8]
        
        # Determine folder structure
        if order_id:
            folder = f"orders/{order_id}"
        elif user_id:
            folder = f"users/{user_id}"
        else:
            folder = "general"
        
        # Generate unique filename
        name, ext = os.path.splitext(file_name)
        unique_name = f"{name}_{file_hash}{ext}"
        
        return f"{self.base_path}/{folder}/{timestamp}/{unique_name}"
    
    def upload_file(self, file_obj, file_name, content_type, user_id=None, order_id=None):
        """Upload file to local storage"""
        try:
            logger.info(f"Starting local file upload: {file_name}")
            file_path = self.generate_file_path(file_name, content_type, user_id, order_id)
            logger.info(f"Generated local path: {file_path}")
            
            # Create directories if they don't exist
            try:
                full_dir = os.path.join(settings.MEDIA_ROOT, os.path.dirname(file_path))
                os.makedirs(full_dir, exist_ok=True)
                
                # Save file
                file_obj.seek(0)
                full_path = default_storage.save(file_path, ContentFile(file_obj.read()))
                file_obj.seek(0)  # Reset file pointer
                
                return {
                    'success': True,
                    'file_path': full_path,
                    'file_url': default_storage.url(full_path),
                    'file_size': file_obj.size,
                    'storage_type': 'local'
                }
                
            except PermissionError as e:
                logger.error(f"Permission denied creating directory: {str(e)}")
                return {
                    'success': False,
                    'error': f'Permission denied: {str(e)}'
                }
            
        except Exception as e:
            logger.error(f"Error uploading file locally: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def generate_delivery_path(self, order_id, file_name):
        """Generate path for delivery files"""
        timestamp = datetime.now().strftime('%Y/%m/%d')
        file_hash = hashlib.md5(f"{file_name}{order_id}".encode()).hexdigest()[:8]
        
        name, ext = os.path.splitext(file_name)
        unique_name = f"{name}_{file_hash}{ext}"
        
        return f"deliveries/{order_id}/{timestamp}/{unique_name}"
    
    def upload_delivery_file(self, file_obj, file_name, content_type, order_id):
        """Upload a delivery file for an order"""
        try:
            logger.info(f"Starting delivery file upload: {file_name} for order {order_id}")
            file_path = self.generate_delivery_path(order_id, file_name)
            logger.info(f"Generated delivery path: {file_path}")
            
            # Create directories if they don't exist
            try:
                full_dir = os.path.join(settings.MEDIA_ROOT, os.path.dirname(file_path))
                os.makedirs(full_dir, exist_ok=True)
                
                # Save file
                file_obj.seek(0)
                full_path = default_storage.save(file_path, ContentFile(file_obj.read()))
                file_obj.seek(0)  # Reset file pointer
                
                return {
                    'success': True,
                    'file_path': full_path,
                    'file_url': None,  # Don't expose URL directly for security
                    'file_size': file_obj.size,
                    'storage_type': 'local',
                    'is_delivery': True
                }
                
            except PermissionError as e:
                logger.error(f"Permission denied creating delivery directory: {str(e)}")
                return {
                    'success': False,
                    'error': f'Permission denied: {str(e)}'
                }
            
        except Exception as e:
            logger.error(f"Error uploading delivery file: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def generate_temporary_download_url(self, file_path, expires_in=3600):
        """Generate a temporary download URL for private files"""
        # For local storage, we'll handle this through Django views with authentication
        # This returns a path that will be used by a secure download view
        return {
            'download_path': file_path,
            'expires_in': expires_in,
            'requires_auth': True
        }
