from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'ایجاد یا به‌روزرسانی کاربر ادمین'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            default='admin',
            help='نام کاربری ادمین (پیش‌فرض: admin)'
        )
        parser.add_argument(
            '--password',
            default='SaydaTech2024!',
            help='رمز عبور ادمین (پیش‌فرض: SaydaTech2024!)'
        )
        parser.add_argument(
            '--email',
            default='admin@saydatech.ir',
            help='ایمیل ادمین (پیش‌فرض: admin@saydatech.ir)'
        )
        parser.add_argument(
            '--list',
            action='store_true',
            help='نمایش لیست کاربران ادمین'
        )
        parser.add_argument(
            '--phone',
            help='شماره موبایل ادمین - الزامی برای ایجاد یا به‌روزرسانی'
        )

    def handle(self, *args, **options):
        if options['list']:
            self.list_admin_users()
        else:
            phone = options.get('phone')
            if not phone:
                self.stderr.write(
                    self.style.ERROR("❌ لطفاً گزینه --phone را برای ایجاد یا به‌روزرسانی ادمین مشخص کنید.")
                )
                return
            self.create_or_update_admin(
                options['username'],
                options['password'],
                options['email'],
                phone
            )

    def create_or_update_admin(self, username, password, email, phone):
        """ایجاد یا به‌روزرسانی کاربر ادمین"""
        
        # Validate that the phone number is unique
        existing_with_phone = User.objects.filter(phone=phone).exclude(username=username).exists()
        if existing_with_phone:
            self.stderr.write(
                self.style.ERROR(f"❌ شماره موبایل {phone} قبلاً برای کاربر دیگری ثبت شده است.")
            )
            return
        
        try:
            # بررسی وجود کاربر
            user = User.objects.get(username=username)
            self.stdout.write(
                self.style.SUCCESS(f"✅ کاربر '{username}' موجود است. در حال به‌روزرسانی...")
            )
            
            # به‌روزرسانی اطلاعات
            user.set_password(password)
            user.email = email
            user.phone = phone
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.save()
            
            self.stdout.write(
                self.style.SUCCESS(f"✅ رمز عبور کاربر '{username}' به‌روزرسانی شد")
            )
            
        except User.DoesNotExist:
            # ایجاد کاربر جدید
            self.stdout.write(
                self.style.WARNING(f"🆕 ایجاد کاربر ادمین جدید...")
            )
            
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                phone=phone,
            )
            
            self.stdout.write(
                self.style.SUCCESS(f"✅ کاربر ادمین '{username}' ایجاد شد")
            )
        
        # نمایش اطلاعات ورود
        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS("📋 اطلاعات ورود به پنل ادمین:"))
        self.stdout.write("="*60)
        self.stdout.write(self.style.SUCCESS(f"🌐 آدرس پنل: https://saydatech.ir/admin/"))
        self.stdout.write(self.style.SUCCESS(f"👤 نام کاربری: {username}"))
        self.stdout.write(self.style.SUCCESS(f"🔑 رمز عبور: {password}"))
        self.stdout.write(self.style.SUCCESS(f"📧 ایمیل: {email}"))
        self.stdout.write(self.style.SUCCESS(f"📱 موبایل: {phone}"))
        self.stdout.write("="*60)
        self.stdout.write(self.style.WARNING("⚠️  لطفاً این اطلاعات را در جای امنی ذخیره کنید!"))
        self.stdout.write("="*60)

    def list_admin_users(self):
        """نمایش لیست کاربران ادمین"""
        admin_users = User.objects.filter(is_superuser=True)
        
        self.stdout.write("\n" + self.style.SUCCESS("📋 لیست کاربران ادمین:"))
        self.stdout.write("-" * 50)
        
        for user in admin_users:
            status = "فعال" if user.is_active else "غیرفعال"
            self.stdout.write(f"👤 {user.username} ({user.email}) - {status}")
        
        self.stdout.write("-" * 50)
