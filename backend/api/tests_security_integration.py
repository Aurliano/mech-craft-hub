"""
Security integration tests for file upload, ClamAV scanning, and backup functionality.
"""
import os
import tempfile
import unittest
from unittest.mock import patch, MagicMock
from django.test import TestCase, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.conf import settings
from api.utils.file_security import (
    validate_file_type,
    validate_file_size,
    scan_file_with_clamav,
    secure_file_upload,
    FileSecurityError
)


class FileSecurityTests(TestCase):
    """Test file upload security features."""
    
    def setUp(self):
        """Set up test data."""
        self.test_pdf_content = b'%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj'
        self.test_image_content = b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00'
        self.test_malicious_content = b'MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00'
        
    def test_validate_file_type_pdf(self):
        """Test PDF file type validation."""
        file = SimpleUploadedFile(
            "test.pdf",
            self.test_pdf_content,
            content_type="application/pdf"
        )
        
        # Should not raise exception
        result = validate_file_type(file, ['pdf'])
        self.assertTrue(result)
    
    def test_validate_file_type_image(self):
        """Test image file type validation."""
        file = SimpleUploadedFile(
            "test.jpg",
            self.test_image_content,
            content_type="image/jpeg"
        )
        
        # Should not raise exception
        result = validate_file_type(file, ['image'])
        self.assertTrue(result)
    
    def test_validate_file_type_dangerous_extension(self):
        """Test rejection of dangerous file extensions."""
        file = SimpleUploadedFile(
            "malicious.exe",
            b"fake executable content",
            content_type="application/octet-stream"
        )
        
        with self.assertRaises(FileSecurityError) as context:
            validate_file_type(file, ['pdf'])
        
        self.assertIn("Dangerous file extension", str(context.exception))
    
    def test_validate_file_type_invalid_mime(self):
        """Test rejection of files with invalid MIME types."""
        file = SimpleUploadedFile(
            "test.txt",
            b"plain text content",
            content_type="text/plain"
        )
        
        with self.assertRaises(FileSecurityError) as context:
            validate_file_type(file, ['pdf'])
        
        self.assertIn("Invalid file type", str(context.exception))
    
    def test_validate_file_size_valid(self):
        """Test valid file size validation."""
        file = SimpleUploadedFile(
            "test.pdf",
            b"small content",
            content_type="application/pdf"
        )
        
        # Should not raise exception
        result = validate_file_size(file)
        self.assertTrue(result)
    
    def test_validate_file_size_too_large(self):
        """Test rejection of oversized files."""
        # Create a file larger than MAX_FILE_SIZE
        large_content = b"x" * (settings.MAX_FILE_SIZE + 1)
        file = SimpleUploadedFile(
            "large.pdf",
            large_content,
            content_type="application/pdf"
        )
        
        with self.assertRaises(FileSecurityError) as context:
            validate_file_size(file)
        
        self.assertIn("exceeds maximum allowed size", str(context.exception))
    
    @patch('api.utils.file_security.clamd.ClamdUnixSocket')
    def test_scan_file_with_clamav_clean(self, mock_clamd_class):
        """Test ClamAV scanning with clean file."""
        # Mock ClamAV response for clean file
        mock_clamd = MagicMock()
        mock_clamd.ping.return_value = True
        mock_clamd.scan.return_value = None  # No threats found
        mock_clamd_class.return_value = mock_clamd
        
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(self.test_pdf_content)
            temp_path = temp_file.name
        
        try:
            is_clean, threat = scan_file_with_clamav(temp_path)
            self.assertTrue(is_clean)
            self.assertIsNone(threat)
        finally:
            os.unlink(temp_path)
    
    @patch('api.utils.file_security.clamd.ClamdUnixSocket')
    def test_scan_file_with_clamav_infected(self, mock_clamd_class):
        """Test ClamAV scanning with infected file."""
        # Mock ClamAV response for infected file
        mock_clamd = MagicMock()
        mock_clamd.ping.return_value = True
        mock_clamd.scan.return_value = {'/path/to/file': ('FOUND', 'EICAR-Test-File')}
        mock_clamd_class.return_value = mock_clamd
        
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(self.test_malicious_content)
            temp_path = temp_file.name
        
        try:
            is_clean, threat = scan_file_with_clamav(temp_path)
            self.assertFalse(is_clean)
            self.assertEqual(threat, 'EICAR-Test-File')
        finally:
            os.unlink(temp_path)
    
    @patch('api.utils.file_security.clamd.ClamdUnixSocket')
    def test_scan_file_with_clamav_unavailable(self, mock_clamd_class):
        """Test ClamAV scanning when daemon is unavailable."""
        # Mock ClamAV daemon not running
        mock_clamd = MagicMock()
        mock_clamd.ping.return_value = False
        mock_clamd_class.return_value = mock_clamd
        
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(self.test_pdf_content)
            temp_path = temp_file.name
        
        try:
            is_clean, threat = scan_file_with_clamav(temp_path)
            self.assertTrue(is_clean)  # Should pass when ClamAV unavailable
            self.assertIsNone(threat)
        finally:
            os.unlink(temp_path)
    
    @patch('api.utils.file_security.scan_file_with_clamav')
    @patch('api.utils.file_security.validate_file_type')
    @patch('api.utils.file_security.validate_file_size')
    def test_secure_file_upload_success(self, mock_validate_size, mock_validate_type, mock_scan):
        """Test successful secure file upload."""
        # Mock all validations to pass
        mock_validate_size.return_value = True
        mock_validate_type.return_value = True
        mock_scan.return_value = (True, None)
        
        file = SimpleUploadedFile(
            "test.pdf",
            self.test_pdf_content,
            content_type="application/pdf"
        )
        
        result = secure_file_upload(file, ['pdf'])
        
        self.assertTrue(result['is_valid'])
        self.assertEqual(result['file_name'], 'test.pdf')
        self.assertEqual(len(result['errors']), 0)
    
    @patch('api.utils.file_security.scan_file_with_clamav')
    def test_secure_file_upload_malware_detected(self, mock_scan):
        """Test secure file upload with malware detection."""
        # Mock malware detection
        mock_scan.return_value = (False, 'EICAR-Test-File')
        
        file = SimpleUploadedFile(
            "malicious.pdf",
            self.test_malicious_content,
            content_type="application/pdf"
        )
        
        result = secure_file_upload(file, ['pdf'])
        
        self.assertFalse(result['is_valid'])
        self.assertIn('Malware detected', result['errors'][0])
    
    def test_secure_file_upload_size_exceeded(self):
        """Test secure file upload with size exceeded."""
        # Create oversized file
        large_content = b"x" * (settings.MAX_FILE_SIZE + 1)
        file = SimpleUploadedFile(
            "large.pdf",
            large_content,
            content_type="application/pdf"
        )
        
        result = secure_file_upload(file, ['pdf'])
        
        self.assertFalse(result['is_valid'])
        self.assertIn('exceeds maximum allowed size', result['errors'][0])


class BackupSecurityTests(TestCase):
    """Test backup and restore security features."""
    
    @patch('subprocess.run')
    def test_backup_script_dry_run(self, mock_subprocess):
        """Test backup script dry run functionality."""
        from api.management.commands.backup_db import Command
        
        command = Command()
        command.handle(dry_run=True)
        
        # Should not call subprocess.run in dry run mode
        mock_subprocess.assert_not_called()
    
    @patch('boto3.client')
    def test_s3_upload_configuration(self, mock_boto3):
        """Test S3 upload configuration."""
        from api.management.commands.backup_db import Command
        
        # Mock S3 client
        mock_s3_client = MagicMock()
        mock_boto3.return_value = mock_s3_client
        
        command = Command()
        
        # Test S3 upload method
        command.upload_to_s3('/fake/backup/file.sql')
        
        # Verify S3 client was called
        mock_s3_client.upload_file.assert_called_once()
    
    def test_backup_metadata_generation(self):
        """Test backup metadata file generation."""
        # This would test the metadata generation in the backup script
        # Implementation depends on the actual backup script structure
        pass


class MonitoringSecurityTests(TestCase):
    """Test monitoring and logging security features."""
    
    def test_security_logger_login_attempt(self):
        """Test security logging for login attempts."""
        from api.monitoring import SecurityLogger
        
        # Mock user object
        user = MagicMock()
        user.id = 1
        
        # Test successful login
        with patch('api.monitoring.logger') as mock_logger:
            SecurityLogger.log_login_attempt(user, '192.168.1.1', success=True)
            mock_logger.info.assert_called()
    
    def test_security_logger_file_upload(self):
        """Test security logging for file uploads."""
        from api.monitoring import SecurityLogger
        
        user = MagicMock()
        user.id = 1
        
        # Test successful file upload
        with patch('api.monitoring.logger') as mock_logger:
            SecurityLogger.log_file_upload_attempt(
                user, 'test.pdf', success=True
            )
            mock_logger.info.assert_called()
    
    def test_security_logger_suspicious_activity(self):
        """Test security logging for suspicious activities."""
        from api.monitoring import SecurityLogger
        
        user = MagicMock()
        user.id = 1
        
        # Test suspicious activity logging
        with patch('api.monitoring.logger') as mock_logger:
            SecurityLogger.log_suspicious_activity(
                user, 'multiple_failed_logins', '5 failed attempts in 1 minute'
            )
            mock_logger.warning.assert_called()
    
    def test_health_check_endpoint(self):
        """Test health check endpoint."""
        from api.monitoring import health_check
        from django.test import RequestFactory
        
        factory = RequestFactory()
        request = factory.get('/health/')
        
        response = health_check(request)
        
        self.assertEqual(response.status_code, 200)
        # JsonResponse has .content which is bytes, need to decode and parse JSON
        import json
        data = json.loads(response.content.decode('utf-8'))
        self.assertEqual(data['status'], 'healthy')
    
    def test_metrics_endpoint_unauthorized(self):
        """Test metrics endpoint requires authentication."""
        from api.monitoring import metrics_view
        from django.test import RequestFactory
        
        factory = RequestFactory()
        request = factory.get('/metrics/')
        request.user = MagicMock()
        request.user.is_authenticated = False
        
        response = metrics_view(request)
        
        self.assertEqual(response.status_code, 403)


@override_settings(
    CLAMAV_ENABLED=True,
    MAX_FILE_SIZE=1024,  # 1KB for testing
    ALLOWED_FILE_TYPES=['pdf', 'image']
)
class FileSecurityIntegrationTests(TestCase):
    """Integration tests for file security features."""
    
    def test_end_to_end_file_upload_security(self):
        """Test complete file upload security flow."""
        # This would test the complete flow from upload to storage
        # including all security checks
        pass
    
    def test_file_type_validation_integration(self):
        """Test file type validation with real file detection."""
        # Test with actual file content and magic bytes
        pass
    
    def test_clamav_integration_mock(self):
        """Test ClamAV integration with mocked responses."""
        # Test the complete ClamAV integration flow
        pass


if __name__ == '__main__':
    unittest.main()
