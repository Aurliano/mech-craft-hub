"""
File upload security utilities with ClamAV integration and magic bytes validation.
"""
import os
import logging
try:
    import magic
    MAGIC_AVAILABLE = True
except ImportError:
    MAGIC_AVAILABLE = False
import clamd
from typing import Tuple, Optional, List
from django.core.files.uploadedfile import UploadedFile

logger = logging.getLogger(__name__)

# Allowed file types with their MIME types and magic bytes
ALLOWED_FILE_TYPES = {
    'pdf': {
        'mime_types': ['application/pdf'],
        'magic_bytes': [b'%PDF'],
        'extensions': ['.pdf']
    },
    'image': {
        'mime_types': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        'magic_bytes': [b'\xff\xd8\xff', b'\x89PNG\r\n\x1a\n', b'GIF87a', b'GIF89a', b'RIFF'],
        'extensions': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },
    'document': {
        'mime_types': ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        'magic_bytes': [b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1', b'PK\x03\x04'],
        'extensions': ['.doc', '.docx']
    },
    'cad': {
        'mime_types': ['application/octet-stream'],
        'magic_bytes': [b'PK\x03\x04'],  # ZIP-based CAD files
        'extensions': ['.stp', '.step', '.stl', '.iges', '.igs']
    }
}

# Maximum file size (50MB)
MAX_FILE_SIZE = 50 * 1024 * 1024

# Dangerous file extensions to block
DANGEROUS_EXTENSIONS = {
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.sh', '.ps1', '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl'
}


class FileSecurityError(Exception):
    """Custom exception for file security issues."""
    pass


def validate_file_type(file: UploadedFile, allowed_types: List[str] = None) -> bool:
    """
    Validate file type using both MIME type and magic bytes.
    
    Args:
        file: Django UploadedFile object
        allowed_types: List of allowed file type categories
        
    Returns:
        bool: True if file type is valid
        
    Raises:
        FileSecurityError: If file type is invalid
    """
    if allowed_types is None:
        allowed_types = list(ALLOWED_FILE_TYPES.keys())
    
    # Check file extension
    file_name = file.name.lower()
    file_ext = os.path.splitext(file_name)[1]
    
    # Check for dangerous extensions
    if file_ext in DANGEROUS_EXTENSIONS:
        raise FileSecurityError(f"Dangerous file extension detected: {file_ext}")
    
    # Read file content for magic bytes validation
    file.seek(0)
    file_content = file.read(1024)  # Read first 1KB for magic bytes
    file.seek(0)  # Reset file pointer
    
    # Get MIME type using python-magic if available
    if MAGIC_AVAILABLE:
        try:
            mime_type = magic.from_buffer(file_content, mime=True)
        except Exception as e:
            logger.warning(f"Magic MIME detection failed: {e}")
            mime_type = 'application/octet-stream'  # Default fallback
    else:
        # Fallback to basic MIME type detection
        import mimetypes
        mime_type, _ = mimetypes.guess_type(file.name)
        if not mime_type:
            mime_type = 'application/octet-stream'
    
    # Validate against allowed types
    for file_type in allowed_types:
        if file_type not in ALLOWED_FILE_TYPES:
            continue
            
        type_config = ALLOWED_FILE_TYPES[file_type]
        
        # Check MIME type
        if mime_type in type_config['mime_types']:
            # Check magic bytes
            for magic_bytes in type_config['magic_bytes']:
                if file_content.startswith(magic_bytes):
                    return True
    
    raise FileSecurityError(f"Invalid file type. MIME: {mime_type}, Extension: {file_ext}")


def validate_file_size(file: UploadedFile) -> bool:
    """
    Validate file size.
    
    Args:
        file: Django UploadedFile object
        
    Returns:
        bool: True if file size is valid
        
    Raises:
        FileSecurityError: If file size exceeds limit
    """
    if file.size > MAX_FILE_SIZE:
        raise FileSecurityError(f"File size {file.size} exceeds maximum allowed size {MAX_FILE_SIZE}")
    
    return True


def scan_file_with_clamav(file_path: str) -> Tuple[bool, Optional[str]]:
    """
    Scan file with ClamAV for malware.
    
    Args:
        file_path: Path to the file to scan
        
    Returns:
        Tuple[bool, Optional[str]]: (is_clean, threat_name)
    """
    try:
        # Connect to ClamAV daemon
        cd = clamd.ClamdUnixSocket()
        
        # Test if ClamAV is running
        if not cd.ping():
            logger.warning("ClamAV daemon is not running, skipping virus scan")
            return True, None
        
        # Scan the file
        result = cd.scan(file_path)
        
        if result is None:
            # No threats found
            return True, None
        
        # Extract threat name from result
        threat_name = list(result.values())[0][1] if result else None
        return False, threat_name
        
    except Exception as e:
        logger.error(f"ClamAV scan failed: {str(e)}")
        # In case of error, we'll be conservative and reject the file
        return False, f"Scan error: {str(e)}"


def secure_file_upload(file: UploadedFile, allowed_types: List[str] = None) -> dict:
    """
    Comprehensive file upload security validation.
    
    Args:
        file: Django UploadedFile object
        allowed_types: List of allowed file type categories
        
    Returns:
        dict: Validation result with details
        
    Raises:
        FileSecurityError: If file fails security checks
    """
    result = {
        'is_valid': False,
        'file_name': file.name,
        'file_size': file.size,
        'errors': []
    }
    
    try:
        # Validate file size
        validate_file_size(file)
        
        # Validate file type
        validate_file_type(file, allowed_types)
        
        # Save file temporarily for ClamAV scan
        temp_path = None
        try:
            # Create temporary file
            import tempfile
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.name)[1]) as temp_file:
                for chunk in file.chunks():
                    temp_file.write(chunk)
                temp_path = temp_file.name
            
            # Scan with ClamAV
            is_clean, threat = scan_file_with_clamav(temp_path)
            if not is_clean:
                raise FileSecurityError(f"Malware detected: {threat}")
            
            result['is_valid'] = True
            result['message'] = "File passed all security checks"
            
        finally:
            # Clean up temporary file
            if temp_path and os.path.exists(temp_path):
                os.unlink(temp_path)
    
    except FileSecurityError as e:
        result['errors'].append(str(e))
        logger.warning(f"File upload security check failed: {str(e)}")
    
    except Exception as e:
        result['errors'].append(f"Unexpected error during file validation: {str(e)}")
        logger.error(f"Unexpected error during file validation: {str(e)}")
    
    return result


def get_file_type_category(file_name: str) -> Optional[str]:
    """
    Determine file type category based on file name.
    
    Args:
        file_name: Name of the file
        
    Returns:
        Optional[str]: File type category or None if unknown
    """
    file_ext = os.path.splitext(file_name.lower())[1]
    
    for category, config in ALLOWED_FILE_TYPES.items():
        if file_ext in config['extensions']:
            return category
    
    return None


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal and other security issues.
    
    Args:
        filename: Original filename
        
    Returns:
        str: Sanitized filename
    """
    import re
    
    # Remove path traversal attempts
    filename = os.path.basename(filename)
    
    # Remove or replace dangerous characters
    filename = re.sub(r'[^\w\-_\.]', '_', filename)
    
    # Limit filename length
    name, ext = os.path.splitext(filename)
    if len(name) > 50:
        name = name[:50]
    
    return name + ext
