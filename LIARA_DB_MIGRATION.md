# مهاجرت دیتابیس Liara — PostgreSQL روی دیسک پایدار

این راهنما جایگزینی دیتابیس ابری `sayda-db` با PostgreSQL محلی داخل همان کانتینر Liara را توضیح می‌دهد.

## پیش‌نیازها

1. **دو دیسک جدید** در پنل Liara (علاوه بر `sayda-disk`):
   - `postgres-data` → `/var/lib/postgresql/data`
   - `db-backups` → `/app/backups`

2. **پلان RAM**: حداقل 2GB (PostgreSQL + Gunicorn)

## فاز ۰ — بک‌آپ از sayda-db (قبل از deploy) — **الزامی**

### روش A — pgAdmin (توصیه می‌شود اگر به DB دسترسی دارید)

1. در pgAdmin به دیتابیس `postgres` (روی `sayda-db`) وصل شوید.
2. راست‌کلیک روی دیتابیس → **Backup...**
3. تنظیمات:
   - **Format:** `Custom` (بهترین گزینه برای `pg_restore`)
   - **Filename:** `emergency.dump` (یا `.backup`)
   - تب **Dump options:** گزینه‌های پیش‌فرض کافی است؛ برای کامل بودن می‌توانید **Blobs** و **Data** را فعال بگذارید.
4. فایل را دانلود کنید و در Liara قرار دهید:
   - آپلود به دیسک `db-backups` → مسیر `/app/backups/emergency.dump`
   - یا در Shell: فایل را با File Manager / `cat` + base64 منتقل کنید
5. در env اپ (برای بک‌آپ `dumpdata` که گرفتید):
   ```bash
   RESTORE_LOADDATA=/app/backups/emergency.json.gz
   ```
   (`RESTORE_DUMP` فقط برای فایل pgAdmin Custom / `pg_dump` است)

**فرمت Plain (.sql):** اگر فقط SQL متنی export کردید، بعد از deploy از این استفاده کنید (نه `pg_restore`):

```bash
export PGPASSWORD='YOUR_POSTGRES_PASSWORD'
psql -h 127.0.0.1 -U mechcraft -d mechcraft -f /app/backups/emergency.sql
cd /app/backend && python manage.py migrate --noinput
```

**Globals (Roles):** اگر در pgAdmin جداگانه Globals بک‌آپ گرفتید، برای مهاجرت معمولاً لازم نیست — کاربر `mechcraft` در startup ساخته می‌شود.

---

### روش B — Liara Shell (نیاز به `pg_dump` یا deploy جدید)

`sayda-db` فقط از داخل شبکه Liara در دسترس است. در **Liara Shell** یا ترمینال وب اپ اجرا کنید:

```bash
# رمز: از DATABASE_URL فعلی در پنل Liara (یا متغیر زیر)
export LEGACY_DB_PASSWORD='YOUR_ROOT_PASSWORD'
export LEGACY_DB_HOST=sayda-db
export LEGACY_DB_USER=root
export LEGACY_DB_NAME=postgres

bash /app/scripts/backup_legacy_sayda_db.sh
```

خروجی باید در `/app/backups/emergency.dump` باشد. سپس در env:

```bash
RESTORE_DUMP=/app/backups/emergency.dump
```

### روش C — Django `dumpdata` (بدون pg_dump، همین الان در Shell فعلی)

```bash
cd /app/backend
python manage.py dumpdata --natural-foreign --natural-primary --indent 2 \
  -o /app/backups/emergency.json
gzip -f /app/backups/emergency.json
ls -lh /app/backups/emergency.json.gz
```

بازیابی بعد از deploy (DB خالی + migrate اول):

```bash
cd /app/backend
gunzip -c /app/backups/emergency.json.gz | python manage.py loaddata --format=json -
```

> `dumpdata` همه جداول را پوشش می‌دهد ولی مثل `pg_dump` برای edge-caseهای خاص PostgreSQL نیست؛ برای اکثر داده‌های Django کافی است.

---

**دستور دستی معادل pg_dump** (اگر `postgresql-client` نصب شد یا بعد از deploy جدید):

```bash
mkdir -p /app/backups
export PGPASSWORD='YOUR_ROOT_PASSWORD'
pg_dump -h sayda-db -p 5432 -U root -d postgres -Fc -f /app/backups/emergency.dump
ls -lh /app/backups/emergency.dump
```

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
