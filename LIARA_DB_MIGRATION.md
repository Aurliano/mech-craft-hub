# مهاجرت دیتابیس Liara — PostgreSQL روی دیسک پایدار

این راهنما جایگزینی دیتابیس ابری `sayda-db` با PostgreSQL محلی داخل همان کانتینر Liara را توضیح می‌دهد.

## پیش‌نیازها

1. **دو دیسک جدید** در پنل Liara (علاوه بر `sayda-disk`):
   - `postgres-data` → `/var/lib/postgresql/data`
   - `db-backups` → `/app/backups`

2. **پلان RAM**: حداقل 2GB (PostgreSQL + Gunicorn)

## فاز ۰ — تلاش نجات داده (قبل از deploy)

```bash
liara shell --app mech-craft-hub-main
bash /app/scripts/emergency_db_recovery.sh
```

همچنین در پنل Liara:
- سرویس PostgreSQL قدیمی → Snapshot / Export
- Object Storage → جستجوی `*.sql`, `*.sql.gz`
- تماس با پشتیبانی Liara

اگر dump پیدا شد، آن را در `/app/backups/emergency.dump` قرار دهید و env زیر را اضافه کنید:

```bash
RESTORE_DUMP=/app/backups/emergency.dump
```

## متغیرهای محیطی Liara (الزامی)

در پنل Liara → Environment Variables:

| متغیر | مقدار | توضیح |
|-------|-------|--------|
| `POSTGRES_HOST` | `127.0.0.1` | Postgres محلی |
| `POSTGRES_PORT` | `5432` | |
| `POSTGRES_DB` | `mechcraft` | |
| `POSTGRES_USER` | `mechcraft` | |
| `POSTGRES_PASSWORD` | *(رمز قوی)* | **الزامی** |
| `PGDATA` | `/var/lib/postgresql/data` | دیسک داده |
| `BACKUP_DIR` | `/app/backups` | دیسک بک‌آپ |
| `AUTO_BACKUP` | `1` | بک‌آپ روزانه خودکار |

### حذف کنید

- `DATABASE_URL` — اگر بماند، Django به DB قدیمی وصل می‌شود

### اختیاری — superuser خودکار

```bash
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_PASSWORD=your-secure-password
DJANGO_SUPERUSER_EMAIL=admin@saydatech.ir
```

### اختیاری — آپلود بک‌آپ به باکت Liara

```bash
S3_UPLOAD=1
LIARA_ACCESS_KEY=...
LIARA_SECRET_KEY=...
LIARA_ENDPOINT_URL=https://storage.c2.liara.space
FILE_BUCKET_NAME=your-backup-bucket
FILE_REGION=iran
```

## Deploy

```bash
npm run build          # frontend
bash deploy_liara.sh   # یا: liara deploy
```

## پس از deploy

```bash
# Health check
curl -f https://saydatech.ir/api/health/

# لاگ startup
liara logs --app mech-craft-hub-main

# superuser دستی (اگر env تنظیم نشده)
liara shell --app mech-craft-hub-main
cd /app/backend
python manage.py createsuperuser
```

## بک‌آپ دستی

```bash
cd /app/backend
python manage.py backup_db --compress
python manage.py backup_db --compress --s3-upload
```

## بازیابی از بک‌آپ

```bash
bash /app/backend/scripts/pg_restore.sh /app/backups/mechcraft_backup_YYYYMMDD_HHMMSS.sql.gz --drop-db --create-db
cd /app/backend && python manage.py migrate --noinput
```

## معماری

```
Liara Container
├── Gunicorn (Django) :80
├── PostgreSQL :5432 (localhost)
├── /var/lib/postgresql/data  ← disk: postgres-data
└── /app/backups              ← disk: db-backups
```

## عیب‌یابی

| مشکل | راه‌حل |
|------|--------|
| Container restart loop | بررسی `POSTGRES_PASSWORD` و mount دیسک‌ها |
| DB خالی | طبیعی بدون dump؛ `createsuperuser` + migrate_from_sqlite برای داده مرجع |
| بک‌آپ S3 fail | کلیدهای Liara bucket و `S3_UPLOAD=1` را بررسی کنید |
