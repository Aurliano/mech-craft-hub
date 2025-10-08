import os
from pathlib import Path

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# File Storage Settings
# انتخاب نوع storage: local, s3, liara
FILE_STORAGE_TYPE = 'liara'  # یا 'local' یا 's3'

# تنظیمات برای Liara Object Storage
FILE_BUCKET_NAME = 'resources'
FILE_REGION = 'iran'
FILE_PUBLIC_ACCESS = True  # آیا فایل‌ها عمومی باشند یا خصوصی

# تنظیمات Liara
AWS_ACCESS_KEY_ID = os.getenv('LIARA_ACCESS_KEY', '')
AWS_SECRET_ACCESS_KEY = os.getenv('LIARA_SECRET_KEY', '')
S3_ENDPOINT_URL = os.getenv('LIARA_ENDPOINT_URL', 'https://storage.c2.liara.space')

# تنظیمات فایل
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'video/mp4',
    'video/avi',
    'video/mov',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed'
]

# تنظیمات media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# تنظیمات static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
