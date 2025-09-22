"""
File handling utilities for ticket attachments
"""
import os
import uuid
import mimetypes
from typing import Dict, Optional, Tuple
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from PIL import Image
import logging

logger = logging.getLogger(__name__)


class FileTypeManager:
    """Manages allowed file types and their validation"""
    
    # File type definitions
    FILE_TYPES = {
        'image': {
            'extensions': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'],
            'mime_types': ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'],
            'max_size_mb': 10,
            'category': 'image'
        },
        'document': {
            'extensions': ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
            'mime_types': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf'],
            'max_size_mb': 50,
            'category': 'document'
        },
        'cad_3d': {
            'extensions': ['.stl', '.obj', '.stp', '.step', '.iges', '.igs', '.3ds', '.dae', '.fbx'],
            'mime_types': ['application/sla', 'application/octet-stream', 'model/stl', 'model/obj'],
            'max_size_mb': 100,
            'category': 'cad_3d'
        },
        'drawing': {
            'extensions': ['.dwg', '.dxf', '.pdf'],
            'mime_types': ['application/dwg', 'application/dxf', 'application/pdf'],
            'max_size_mb': 100,
            'category': 'drawing'
        },
        'other': {
            'extensions': ['.zip', '.rar', '.7z'],
            'mime_types': ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
            'max_size_mb': 100,
            'category': 'other'
        }
    }
    
    @classmethod
    def get_file_type(cls, filename: str, mime_type: str) -> Optional[Dict]:
        """Determine file type based on extension and MIME type"""
        ext = os.path.splitext(filename.lower())[1]
        
        for file_type, config in cls.FILE_TYPES.items():
            if ext in config['extensions'] or mime_type in config['mime_types']:
                return {
                    'type': file_type,
                    'category': config['category'],
                    'max_size_mb': config['max_size_mb']
                }
        
        return None
    
    @classmethod
    def validate_file(cls, file, filename: str) -> Tuple[bool, str, Optional[Dict]]:
        """Validate uploaded file"""
        # Get MIME type
        mime_type, _ = mimetypes.guess_type(filename)
        if not mime_type:
            mime_type = 'application/octet-stream'
        
        # Get file type
        file_type_info = cls.get_file_type(filename, mime_type)
        if not file_type_info:
            return False, "نوع فایل پشتیبانی نمی‌شود", None
        
        # Check file size
        file_size_mb = file.size / (1024 * 1024)
        if file_size_mb > file_type_info['max_size_mb']:
            return False, f"حجم فایل نباید بیشتر از {file_type_info['max_size_mb']} مگابایت باشد", None
        
        return True, "فایل معتبر است", file_type_info


class FileUploadHandler:
    """Handles file uploads for tickets"""
    
    def __init__(self):
        self.upload_path = 'ticket_attachments'
        self.max_file_size = 100 * 1024 * 1024  # 100MB
    
    def generate_filename(self, original_filename: str) -> str:
        """Generate unique filename"""
        ext = os.path.splitext(original_filename)[1]
        unique_id = str(uuid.uuid4())
        return f"{unique_id}{ext}"
    
    def get_upload_path(self, ticket_id: str, message_id: str) -> str:
        """Get upload path for ticket attachment"""
        return os.path.join(self.upload_path, str(ticket_id), str(message_id))
    
    def save_file(self, file, ticket_id: str, message_id: str) -> Dict:
        """Save uploaded file and return file info"""
        try:
            # Validate file
            is_valid, message, file_type_info = FileTypeManager.validate_file(file, file.name)
            if not is_valid:
                return {
                    'success': False,
                    'error': message,
                    'file_info': None
                }
            
            # Generate filename and path
            filename = self.generate_filename(file.name)
            upload_path = self.get_upload_path(ticket_id, message_id)
            full_path = os.path.join(upload_path, filename)
            
            # Save file
            file_path = default_storage.save(full_path, ContentFile(file.read()))
            
            # Get file info
            file_info = {
                'filename': filename,
                'original_filename': file.name,
                'file_path': file_path,
                'mime_type': file_type_info.get('mime_type', 'application/octet-stream'),
                'file_size': file.size,
                'file_type': file_type_info['type'],
                'category': file_type_info['category']
            }
            
            return {
                'success': True,
                'error': None,
                'file_info': file_info
            }
            
        except Exception as e:
            logger.error(f"Error saving file: {str(e)}")
            return {
                'success': False,
                'error': f"خطا در ذخیره فایل: {str(e)}",
                'file_info': None
            }
    
    def delete_file(self, file_path: str) -> bool:
        """Delete file from storage"""
        try:
            if default_storage.exists(file_path):
                default_storage.delete(file_path)
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting file {file_path}: {str(e)}")
            return False
    
    def get_file_url(self, file_path: str) -> str:
        """Get URL for file access"""
        if default_storage.exists(file_path):
            return default_storage.url(file_path)
        return None


class ImageProcessor:
    """Handles image processing for thumbnails and optimization"""
    
    @staticmethod
    def create_thumbnail(image_path: str, size: Tuple[int, int] = (200, 200)) -> Optional[str]:
        """Create thumbnail for image"""
        try:
            with Image.open(image_path) as img:
                img.thumbnail(size, Image.Resampling.LANCZOS)
                
                # Generate thumbnail path
                base, ext = os.path.splitext(image_path)
                thumbnail_path = f"{base}_thumb{ext}"
                
                # Save thumbnail
                img.save(thumbnail_path, optimize=True, quality=85)
                return thumbnail_path
                
        except Exception as e:
            logger.error(f"Error creating thumbnail: {str(e)}")
            return None
    
    @staticmethod
    def optimize_image(image_path: str, max_size: int = 1920) -> bool:
        """Optimize image for web display"""
        try:
            with Image.open(image_path) as img:
                # Resize if too large
                if max(img.size) > max_size:
                    img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                
                # Save optimized version
                img.save(image_path, optimize=True, quality=85)
                return True
                
        except Exception as e:
            logger.error(f"Error optimizing image: {str(e)}")
            return False


class OCRProcessor:
    """Handles OCR processing for images and PDFs"""
    
    @staticmethod
    def extract_text_from_image(image_path: str) -> str:
        """Extract text from image using OCR"""
        try:
            # This would integrate with Tesseract or cloud OCR service
            # For now, return empty string
            # In production, you would use:
            # import pytesseract
            # return pytesseract.image_to_string(image_path, lang='fas+eng')
            return ""
        except Exception as e:
            logger.error(f"Error extracting text from image: {str(e)}")
            return ""
    
    @staticmethod
    def extract_text_from_pdf(pdf_path: str) -> str:
        """Extract text from PDF"""
        try:
            # This would integrate with PDF processing library
            # For now, return empty string
            # In production, you would use:
            # import PyPDF2 or pdfplumber
            return ""
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            return ""


# Global instances
file_upload_handler = FileUploadHandler()
image_processor = ImageProcessor()
ocr_processor = OCRProcessor()
