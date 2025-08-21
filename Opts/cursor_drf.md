# شروع توسعه بک اند با DRF
_Exported on 8/13/2025 at 12:56:15 GMT+3:30 from Cursor (0.50.4)_

---

**User**

میخوام شروع کنم به توسعه بک اند این پروژه با DRF.
قدم به قدم بریم جلو

---

**Cursor**

در یک مرور سریع می‌خوام پورت و تنظیمات فرانت (Vite) رو بررسی کنم تا CORS و آدرس‌های بک‌اند رو درست تنظیم کنیم، بعد به‌صورت خودکار پوشه `backend`، محیط مجازی پایتون، نصب Django/DRF و اسکلت پروژه را بسازم. ابتدا فایل‌های پیکربندی فرانت را می‌خوانم.

در حال یک مرور سریع روی تنظیمات فرانت (`vite.config.ts`, `package.json`, `index.html`) و محتوای پوشه `src` هستم تا پورت/پراکسی مشخص شود و بعد بلافاصله محیط DRF را راه‌اندازی کنم.

گام اول را شروع می‌کنم: ایجاد محیط مجازی پایتون و نصب Django/DRF و cors-headers، سپس ساخت پوشه `backend` با پروژه Django.

در حال راه‌اندازی محیط DRF: ساخت venv، نصب Django/DRF/CORS، ساخت پروژه `backend/config` و اپ `api`. سپس تنظیم CORS برای پورت 8080 و ایجاد یک endpoint تست.

درحال بررسی اینکه venv و پوشه‌های بک‌اند ساخته شده‌اند یا نه، بعد اگر لازم بود نصب‌ها و ساخت پروژه را مرحله‌ای انجام می‌دهم.

در حال نصب پکیج‌های موردنیاز در venv و ساخت پروژه و اپ DRF هستم.

به‌روزرسانی: venv ساخته شد. حالا وابستگی‌های Django/DRF/CORS را نصب می‌کنم و اسکلت پروژه `backend/config` و اپ `api` را می‌سازم.

در حال ایجاد پروژه Django و اپ `api` و سپس افزودن تنظیمات DRF و CORS هستم. بعد از ساخت، فایل‌های تنظیمات را ویرایش می‌کنم و یک endpoint تست اضافه می‌کنم.

در حال جابجایی پوشه `api` به داخل `backend` و ویرایش تنظیمات Django برای افزودن DRF و CORS و تعریف یک endpoint ساده. سپس health-check و migrate را اجرا می‌کنم.

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # ... existing code ...
    'rest_framework',
    'corsheaders',
    'api',
]
# ... existing code ...
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
# ... existing code ...
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

CORS_ALLOWED_ORIGINS = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
]

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
]

```

```python
# ... existing code ...
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]
# ... existing code ...
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
# ... existing code ...
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

CORS_ALLOWED_ORIGINS = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
]

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
]
# ... existing code ...
```

در حال ویرایش تنظیمات Django برای فعال‌سازی DRF و CORS، افزودن endpoint سلامت در `api`, و وصل‌کردن `api.urls` به روت پروژه. سپس مایگریت و اجرای سرور توسعه را انجام می‌دهم.

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]
# ... existing code ...
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
# ... existing code ...
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

CORS_ALLOWED_ORIGINS = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
]

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
]

```

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"]) 
def health(request):
    return Response({"status": "ok"})

```

```python
from django.urls import path
from .views import health


urlpatterns = [
    path("health/", health, name="health"),
]

```

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

```

در حال بررسی اینکه ویرایش‌ها اعمال شده‌اند یا نه، سپس تغییرات دقیق را روی `settings.py` و `config/urls.py` اعمال می‌کنم و فایل‌های `api/views.py` و `api/urls.py` را تأیید/ایجاد می‌کنم.

```python
# ... existing code ...
ALLOWED_HOSTS = ['localhost', '127.0.0.1']
# ... existing code ...
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]
# ... existing code ...
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
# ... existing code ...
CORS_ALLOWED_ORIGINS = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
]

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
]

```

```python
"""
Django settings for config project.

Generated by 'django-admin startproject' using Django 5.2.5.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.2/ref/settings/
"""

from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ... existing code ...

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-x7)1_$9ap(4g(r%x3csz3f&3&wc@pzj!87$p-7x2@d4b)c_kcg'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

# ... existing code ...

WSGI_APPLICATION = 'config.wsgi.application'

# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ... existing code ...

# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOWED_ORIGINS = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
]

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
]

```

در حال ایجاد فایل‌های `api/urls.py` و به‌روزرسانی `api/views.py`، سپس افزودن تنظیمات لازم به انتهای `backend/config/settings.py` و ویرایش `backend/config/urls.py`. بعد از آن مایگریت و اجرای سرور را تست می‌کنم.

```python
from django.urls import path
from .views import health

urlpatterns = [
    path("health/", health, name="health"),
]

```

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})

```

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

```

در حال ویرایش فایل‌های Django: افزودن DRF و CORS به `settings.py`، تعریف route های `api` در `config/urls.py`، ساخت endpoint سلامت در `api/views.py` و `api/urls.py`. سپس صحت را با `manage.py check` و درخواست به `/api/health/` بررسی می‌کنم.

```python
# ... existing code ...
ALLOWED_HOSTS = []
# ... existing code ...

```

```python
# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]
# ... existing code ...

```

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

```

```python
# ... existing code ...

CORS_ALLOWED_ORIGINS = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
]

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
]

```

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

```

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})

```

```python
from django.urls import path
from .views import health

urlpatterns = [
    path('health/', health, name='health'),
]

```

در این مرحله تنظیمات را در چند فایل با هم اعمال می‌کنم: افزودن DRF/CORS و app به `backend/config/settings.py`، اضافه کردن `include('api.urls')` به `backend/config/urls.py`، و ساخت `backend/api/urls.py` و تغییر `backend/api/views.py` برای افزودن endpoint سلامت. سپس سرور را روی پورت 8001 اجرا و health را تست می‌کنم.

```python
# ... existing code ...
ALLOWED_HOSTS = ['localhost', '127.0.0.1']
# ... existing code ...
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]
# ... existing code ...
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
# ... existing code ...
CORS_ALLOWED_ORIGINS = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
]

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
]

```

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

```

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})

```

```python
from django.urls import path
from .views import health

urlpatterns = [
    path('health/', health, name='health'),
]

```

عالی—بک‌اند DRF را در همین ریپو راه انداختیم.

گام‌های انجام‌شده
- ایجاد venv در `mech-craft-hub-main/.venv` و نصب Django, DRF, django-cors-headers
- ساخت پروژه `backend/config` و اپ `backend/api`
- مایگریت اولیه اجرا شد و سرور dev روی پورت 8001 بالا آمد

چیزهایی که آماده‌اند
- آدرس تست سلامت:
  - http://127.0.0.1:8001/api/health/  → باید {"status":"ok"} بدهد
- Vite روی پورت 8080 است؛ CORS/CSRF باید برای 8080 تنظیم شود. اگر health را از فرانت صدا می‌زنید و CORS خطا داد، تنظیمات را اعمال می‌کنم.

قدم بعدی پیشنهادی
- می‌خواهید چه مدل/اندپوینت‌هایی بسازیم؟ مثلا Auth/JWT، پروفایل کاربر، یا موجودیت‌های دامنه پروژه‌تان.

نحوه اجرا
- اجرای سرور بک‌اند:
  - Windows PowerShell:
    - `.\.venv\Scripts\activate`
    - `python backend\manage.py runserver 8001`
- تست سلامت:
  - مرورگر: `http://127.0.0.1:8001/api/health/`

اگر موافقید، در گام بعد:
- تنظیم کامل CORS/CSRF داخل `backend/config/settings.py`
- افزودن ساختار API (versioning `/api/v1/`)، Swagger/Redoc با drf-spectacular
- انتخاب روش احراز هویت (Simple JWT)

- تغییرات کلیدی:
  - ایجاد `backend/` با `config` و اپ `api`
  - اجرای مایگریشن‌ها و راه‌اندازی سرور dev روی 8001

---

**User**

بنظرت بهتر نیست که حالا دیتا بیس رو ایجاد کنیم؟؟
میخوام با postgresql کار کنم

---

**Cursor**

در حال پیکربندی Postgres: نصب وابستگی‌ها، به‌روزرسانی `settings.py` برای خواندن `.env` و استفاده از Postgres، افزودن CORS/CSRF، ساخت `api/health` اگر نبود، و ایجاد فایل `backend/.env` نمونه. سپس دستورهای ساخت دیتابیس با `psql` را هم به شما می‌دهم.

در حال پیکربندی Postgres: فایل‌های پیکربندی را ویرایش می‌کنم تا DB از متغیرهای محیطی خوانده شود، CORS/CSRF و DRF اضافه شوند، روت‌های API و health ساخته شوند، `.env.example` ایجاد و `.env` به `.gitignore` افزوده شود. سپس چک پروژه و تلاش برای نصب `psycopg[binary]`.

```python
"""
Django settings for config project.

Generated by 'django-admin startproject' using Django 5.2.5.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.2/ref/settings/
"""

from pathlib import Path
import os

# Optional: load .env if python-dotenv is installed
try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))
except Exception:
    pass

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-x7)1_$9ap(4g(r%x3csz3f&3&wc@pzj!87$p-7x2@d4b)c_kcg'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database
# Use Postgres via env if provided, otherwise fallback to sqlite for dev
_use_pg = (os.getenv('DB_ENGINE', '').lower() in ('postgres', 'postgresql')) or bool(os.getenv('POSTGRES_DB'))
if _use_pg:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('POSTGRES_DB', 'mechcraft'),
            'USER': os.getenv('POSTGRES_USER', 'postgres'),
            'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'postgres'),
            'HOST': os.getenv('POSTGRES_HOST', 'localhost'),
            'PORT': os.getenv('POSTGRES_PORT', '5432'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS/CSRF for Vite dev server
CORS_ALLOWED_ORIGINS = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
]

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
]

```

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

```

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})

```

```python
from django.urls import path
from .views import health

urlpatterns = [
    path('health/', health, name='health'),
]

```

```ignore
# ... existing code ...
# Python/Django
.env
backend/.env
__pycache__/
*.pyc

```

حتما. الان Postgres را پیکربندی کردم تا آماده اتصال شود.

کاری که انجام شد
- افزودن DRF, CORS و اپ `api` به `backend/config/settings.py` و فعال‌کردن middleware CORS.
- تنظیم دیتابیس بر اساس متغیرهای محیطی. اگر متغیرها ست شوند، از Postgres استفاده می‌شود؛ در غیر این‌صورت SQLite.
- افزودن `CORS_ALLOWED_ORIGINS` و `CSRF_TRUSTED_ORIGINS` برای Vite روی 8080.
- ساخت روت‌های API: `backend/config/urls.py` شامل `api/`.
- ایجاد endpoint سلامت در `backend/api/views.py` و `backend/api/urls.py`.
- اضافه‌کردن ignore برای فایل `.env` (اگر لازم باشد).

متغیرهای محیطی موردنیاز برای Postgres
- POSTGRES_DB
- POSTGRES_USER
- POSTGRES_PASSWORD
- POSTGRES_HOST
- POSTGRES_PORT (پیش‌فرض 5432)
- DB_ENGINE=postgresql

راهنمای ایجاد دیتابیس در Postgres
- اگر Postgres محلی دارید:
  - Windows (psql):
    - ایجاد دیتابیس و کاربر:
      ```
      psql -U postgres -h localhost -p 5432 -W
      CREATE DATABASE mechcraft;
      CREATE USER postgres WITH ENCRYPTED PASSWORD 'postgres';
      GRANT ALL PRIVILEGES ON DATABASE mechcraft TO postgres;
      ```
- فایل `.env` محلی (ساخت در `backend/.env`):
  ```
  DB_ENGINE=postgresql
  POSTGRES_DB=mechcraft
  POSTGRES_USER=postgres
  POSTGRES_PASSWORD=postgres
  POSTGRES_HOST=localhost
  POSTGRES_PORT=5432
  ```

اجرای مایگریشن روی Postgres
- بعد از تنظیم `.env`:
  - `.\.venv\Scripts\activate`
  - `python backend\manage.py migrate`

تست
- Health: http://127.0.0.1:8001/api/health/
- اگر به Postgres سوییچ کردید و ایرادی بود (ماژول psycopg نصب نشد)، احتمالا به‌خاطر محدودیت اتصال به PyPI بود. به‌محض دسترسی اینترنت:
  - `python -m pip install psycopg[binary] python-dotenv`

می‌خواهید Docker-Compose برای Postgres هم اضافه کنم تا با یک دستور `docker compose up -d db` دیتابیس بالا بیاید؟

```plaintext
      psql -U postgres -h localhost -p 5432 -W
      CREATE DATABASE mechcraft;
      CREATE USER postgres WITH ENCRYPTED PASSWORD 'postgres';
      GRANT ALL PRIVILEGES ON DATABASE mechcraft TO postgres;
```

```plaintext
  DB_ENGINE=postgresql
  POSTGRES_DB=mechcraft
  POSTGRES_USER=postgres
  POSTGRES_PASSWORD=postgres
  POSTGRES_HOST=localhost
  POSTGRES_PORT=5432
```

