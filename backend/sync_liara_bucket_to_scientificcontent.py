import os
import django
import re
import hashlib
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import ScientificContent, User

# Import boto3 with error handling
try:
    import boto3  # type: ignore
    BOTO3_AVAILABLE = True
except ImportError:
    print("ERROR: boto3 is not installed. Please install it: pip install boto3")
    BOTO3_AVAILABLE = False
    boto3 = None  # type: ignore

# اطلاعات لیارا از تنظیمات Django
AWS_ACCESS_KEY_ID = getattr(settings, 'LIARA_ACCESS_KEY_ID', None) or getattr(settings, 'LIARA_ACCESS_KEY', None)
AWS_SECRET_ACCESS_KEY = getattr(settings, 'LIARA_SECRET_ACCESS_KEY', None) or getattr(settings, 'LIARA_SECRET_KEY', None)
AWS_STORAGE_BUCKET_NAME = getattr(settings, 'FILE_BUCKET_NAME', 'resources')
AWS_S3_ENDPOINT_URL = getattr(settings, 'S3_ENDPOINT_URL', None) or getattr(settings, 'LIARA_ENDPOINT_URL', 'https://storage.c2.liara.space')

# بررسی وجود credentials
if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
    print("ERROR: Liara credentials not found in settings!")
    print("Please set LIARA_ACCESS_KEY_ID and LIARA_SECRET_ACCESS_KEY in your environment or settings.")
    exit(1)

if not BOTO3_AVAILABLE:
    print("ERROR: boto3 is required but not installed.")
    exit(1)

# کاربر ادمین (یا هر کاربر دیگری که برای owner لازم است)
ADMIN_USER = User.objects.filter(is_superuser=True).first()
if not ADMIN_USER:
    print("ERROR: No admin user found. Please create a superuser first.")
    exit(1)

# تابع گرفتن فایل های موجود در باکت
try:
    s3 = boto3.client(
        's3',
        endpoint_url=AWS_S3_ENDPOINT_URL,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    )
except Exception as e:
    print(f"ERROR: Failed to create S3 client: {str(e)}")
    exit(1)

existing_files = set(ScientificContent.objects.values_list('file_name', flat=True))


def guess_type_from_filename(filename: str) -> str:
    ext = filename.split('.')[-1].lower()
    if ext in ['pdf', 'doc', 'docx']: return 'book'
    if ext in ['mp4', 'mov', 'avi']: return 'video'
    if ext in ['exe', 'msi', 'zip', 'rar', '7z']: return 'software'
    return 'article'


def make_human_title_from_filename(filename: str) -> str:
    base = os.path.splitext(os.path.basename(filename))[0]
    # جایگزینی جداکننده‌ها با فاصله و تمیزکاری ساده
    base = re.sub(r'[-_]+', ' ', base).strip()
    # کوتاه‌سازی طبق محدودیت مدل (<=200)
    return base[:200] if len(base) > 200 else base


def make_unique_slug_from_filename(filename: str) -> str:
    base = os.path.splitext(os.path.basename(filename))[0].lower()
    # نگاشت به [a-z0-9-]
    slug = re.sub(r'[^a-z0-9]+', '-', base).strip('-')
    # کوتاه‌سازی اولیه تا 200 کاراکتر
    if len(slug) > 200:
        slug = slug[:200].rstrip('-')
    # یکتا سازی در صورت تکرار یا طول نزدیک سقف
    original = slug
    if ScientificContent.objects.filter(slug=slug).exists() or not slug:
        # پسوند هش کوتاه از نام فایل برای یکتایی
        suffix = hashlib.sha1(filename.encode('utf-8')).hexdigest()[:8]
        # تضمین طول <= 200
        max_base_len = 200 - 1 - len(suffix)
        base_trim = original[:max_base_len].rstrip('-') if original else 'item'
        slug = f"{base_trim}-{suffix}"
    return slug


# دریافت همه فایل‌ها (صفحه اول کافی است؛ در صورت نیاز می‌توان paginated کرد)
response = s3.list_objects_v2(Bucket=AWS_STORAGE_BUCKET_NAME)
files = [obj['Key'] for obj in response.get('Contents', [])]
print(f'Found {len(files)} files in bucket.')

count_new = 0
for file_name in files:
    if file_name in existing_files:
        continue
    content_type = guess_type_from_filename(file_name)
    title = make_human_title_from_filename(file_name)
    slug = make_unique_slug_from_filename(file_name)
    # Generate file URL
    file_url = f'{AWS_S3_ENDPOINT_URL}/{AWS_STORAGE_BUCKET_NAME}/{file_name}'
    
    # For videos, set video_url; for others, set download_url
    video_url = file_url if content_type == 'video' else None
    download_url = file_url if content_type != 'video' else None
    
    sc = ScientificContent.objects.create(
        title=title,
        slug=slug,
        excerpt='Imported from bucket.',
        content='(Imported via sync_liara_bucket_to_scientificcontent.py)',
        content_type=content_type,
        category='general',
        status='published',
        author=ADMIN_USER,
        file_name=file_name,
        file_path=file_name,
        download_url=download_url if download_url else None,
        video_url=video_url if video_url else None,
    )
    print(f'Added: {file_name}')
    count_new += 1
print(f'Total new records added: {count_new}')
