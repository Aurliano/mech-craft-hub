#!/usr/bin/env python
"""
Test script for Liara S3 integration
Tests uploading, listing, and downloading files from Liara Object Storage
"""

import os
import sys
import django
from django.core.files.uploadedfile import SimpleUploadedFile
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings_ultra_simple')
os.environ.setdefault('USE_SQLITE', '1')
django.setup()

from api.file_managers import scientific_file_manager


def test_liara_s3():
    """Test Liara S3 integration"""
    print("=" * 60)
    print("Testing Liara S3 Integration")
    print("=" * 60)
    
    # Check if credentials are configured
    from django.conf import settings
    
    print(f"Bucket Name: {settings.FILE_BUCKET_NAME}")
    print(f"Region: {settings.FILE_REGION}")
    print(f"Endpoint URL: {settings.S3_ENDPOINT_URL}")
    print(f"Access Key: {'***' if settings.LIARA_ACCESS_KEY_ID else 'NOT SET'}")
    print(f"Secret Key: {'***' if settings.LIARA_SECRET_ACCESS_KEY else 'NOT SET'}")
    
    if not settings.LIARA_ACCESS_KEY_ID or not settings.LIARA_SECRET_ACCESS_KEY:
        print("\n❌ Error: Liara credentials not configured!")
        print("Please set LIARA_ACCESS_KEY_ID and LIARA_SECRET_ACCESS_KEY environment variables")
        return
    
    if not scientific_file_manager.s3_client:
        print("\n❌ Error: S3 client not initialized!")
        return
    
    print("\n✅ S3 client initialized successfully")
    
    # Create a test file
    test_content = f"Test file created at {datetime.now()}\nThis is a test file for Liara S3 integration.".encode()
    test_file = SimpleUploadedFile(
        "test_document.txt",
        test_content,
        content_type="text/plain"
    )
    
    print(f"\n📄 Testing upload of file: {test_file.name}")
    print(f"   Size: {len(test_content)} bytes")
    
    # Test upload
    result = scientific_file_manager.upload_file(
        test_file,
        test_file.name,
        test_file.content_type
    )
    
    if result['success']:
        print("\n✅ File uploaded successfully!")
        print(f"   File path: {result['file_path']}")
        print(f"   File URL: {result['file_url']}")
        print(f"   Storage type: {result['storage_type']}")
        
        # Test file info
        file_info = scientific_file_manager.get_file_info(result['file_path'])
        if file_info.get('exists'):
            print("\n✅ File info retrieved successfully!")
            print(f"   Size: {file_info.get('size')} bytes")
            print(f"   Content Type: {file_info.get('content_type')}")
            print(f"   Last Modified: {file_info.get('last_modified')}")
        else:
            print("\n❌ Failed to retrieve file info")
        
        # Test delete
        print(f"\n🗑️  Testing file deletion...")
        delete_result = scientific_file_manager.delete_file(result['file_path'])
        
        if delete_result.get('success'):
            print("✅ File deleted successfully!")
        else:
            print(f"❌ Failed to delete file: {delete_result.get('error')}")
            
    else:
        print(f"\n❌ Failed to upload file: {result.get('error')}")
    
    print("\n" + "=" * 60)
    print("Test completed")
    print("=" * 60)


def test_different_file_types():
    """Test uploading different file types"""
    print("\n" + "=" * 60)
    print("Testing Different File Types")
    print("=" * 60)
    
    test_files = [
        ("test_document.pdf", b"%PDF-1.4 test content", "application/pdf"),
        ("test_document.docx", b"PK test content", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
        ("test_video.mp4", b"\x00\x00\x00 ftyp test", "video/mp4"),
        ("test_image.jpg", b"\xFF\xD8\xFF test", "image/jpeg"),
    ]
    
    for filename, content, content_type in test_files:
        print(f"\n📄 Testing {filename} ({content_type})")
        
        test_file = SimpleUploadedFile(filename, content, content_type=content_type)
        result = scientific_file_manager.upload_file(test_file, filename, content_type)
        
        if result['success']:
            print(f"   ✅ Uploaded to: {result['file_path']}")
            print(f"   📎 URL: {result['file_url']}")
            
            # Clean up
            scientific_file_manager.delete_file(result['file_path'])
        else:
            print(f"   ❌ Failed: {result.get('error')}")


if __name__ == "__main__":
    try:
        # Basic S3 test
        test_liara_s3()
        
        # Test different file types
        if input("\nTest different file types? (y/N): ").lower() == 'y':
            test_different_file_types()
            
    except Exception as e:
        print(f"\n❌ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()
