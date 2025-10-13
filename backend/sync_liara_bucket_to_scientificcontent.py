import os
import django
import boto3

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import ScientificContent, User

# اطلاعات لیارا
AWS_ACCESS_KEY_ID = 'n5emtge4ckg3bspk'
AWS_SECRET_ACCESS_KEY = '9c599091-f43f-4db6-b1c5-483afaea0532'
AWS_STORAGE_BUCKET_NAME = 'resources'
AWS_S3_ENDPOINT_URL = 'https://storage.c2.liara.space'

# کاربر ادمین (یا هر کاربر دیگری که برای owner لازم است)
ADMIN_USER = User.objects.filter(is_superuser=True).first()

# تابع گرفتن فایل های موجود در باکت
s3 = boto3.client(
    's3',
    endpoint_url=AWS_S3_ENDPOINT_URL,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
)

existing_files = set(ScientificContent.objects.values_list('file_name', flat=True))

def guess_type_from_filename(filename):
    ext = filename.split('.')[-1].lower()
    if ext in ['pdf', 'doc', 'docx']: return 'book'
    if ext in ['mp4', 'mov', 'avi']: return 'video'
    if ext in ['exe', 'msi', 'zip', 'rar']: return 'software'
    return 'article'  # پیشفرض

response = s3.list_objects_v2(Bucket=AWS_STORAGE_BUCKET_NAME)
files = [obj['Key'] for obj in response.get('Contents', [])]
print(f'Found {len(files)} files in bucket.')
count_new = 0
for file_name in files:
    if file_name in existing_files:
        continue
    content_type = guess_type_from_filename(file_name)
    sc = ScientificContent.objects.create(
        title=file_name,
        slug=file_name.replace('.', '-'),
        excerpt=f'Import from bucket.',
        content='(Imported via sync_liara_bucket_to_scientificcontent.py)',
        content_type=content_type,
        category='general',
        status='published',
        author=ADMIN_USER,
        file_name=file_name,
        download_url=f'{AWS_S3_ENDPOINT_URL}/{AWS_STORAGE_BUCKET_NAME}/{file_name}'
    )
    print(f'Added: {file_name}')
    count_new += 1
print(f'Total new records added: {count_new}')
