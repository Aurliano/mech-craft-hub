from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.utils import timezone
from django.conf import settings
import uuid


class User(AbstractUser):
    """Extended User model with additional fields"""
    
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="شماره تلفن باید فرمت صحیح داشته باشد."
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField(validators=[phone_regex], max_length=17, unique=True)
    is_email_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)
    profile_image = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # اضافه کردن related_name برای جلوگیری از conflict
    groups = models.ManyToManyField(
        'auth.Group',
        blank=True,
        related_name='custom_user_set',
        related_query_name='custom_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        blank=True,
        related_name='custom_user_set',
        related_query_name='custom_user',
    )

    def __str__(self):
        return f"{self.username} - {self.phone}"


class Role(models.Model):
    """User roles like customer, contractor, admin"""
    
    ROLE_CHOICES = [
        ('customer', 'مشتری'),
        ('contractor', 'پیمانکار'),
        ('admin', 'مدیر'),
        ('support', 'پشتیبان'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)
    display_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'roles'
    
    def __str__(self):
        return self.display_name


class Permission(models.Model):
    """Custom permissions for the system"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    codename = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'permissions'
    
    def __str__(self):
        return self.name


class UserRole(models.Model):
    """Many-to-many relationship between users and roles"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_roles')
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='role_users')
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assigned_roles')
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'user_roles'
        unique_together = ('user', 'role')
    
    def __str__(self):
        return f"{self.user.username} - {self.role.name}"


class Scope(models.Model):
    """Service scopes like mechanical engineering, electrical engineering"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    display_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    icon = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'scopes'
        ordering = ['name']
    
    def __str__(self):
        return self.display_name


class Service(models.Model):
    """Services offered in each scope"""
    
    SERVICE_TYPES = [
        ('design', 'طراحی'),
        ('analysis', 'تحلیل و شبیه‌سازی'), 
        ('drawing', 'نقشه‌کشی'),
        ('manufacturing', 'ساخت و تولید'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    scope = models.ForeignKey(Scope, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=50, choices=SERVICE_TYPES)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    estimated_delivery_days = models.PositiveIntegerField(null=True, blank=True)
    supports_documentation = models.BooleanField(default=False)
    has_tabs = models.BooleanField(default=False)  # آیا این سرویس تب‌های مختلف دارد؟
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'services'
        unique_together = ('scope', 'name', 'type')
        ordering = ['scope', 'name']
    
    def __str__(self):
        return f"{self.scope.display_name} - {self.name}"


class ServiceTab(models.Model):
    """Tabs for each service (e.g., نقشه جوش, نقشه انفجاری, ساخت)"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='tabs')
    name = models.CharField(max_length=100)  # "welding", "exploded", "manufacturing"
    display_name = models.CharField(max_length=200)  # "نقشه جوش", "نقشه انفجاری", "ساخت"
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'service_tabs'
        unique_together = ('service', 'name')
        ordering = ['order', 'name']
    
    def __str__(self):
        return f"{self.service.name} - {self.display_name}"


class ServiceField(models.Model):
    """Dynamic fields for each service tab"""
    
    FIELD_TYPES = [
        ('text', 'متن'),
        ('number', 'عدد'),
        ('file', 'فایل'),
        ('select', 'انتخاب'),
        ('multiselect', 'چند انتخابه'),
        ('checkbox', 'تیک'),
        ('date', 'تاریخ'),
        ('textarea', 'متن طولانی'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='fields')
    tab = models.ForeignKey(ServiceTab, on_delete=models.CASCADE, related_name='fields', null=True, blank=True)
    name = models.CharField(max_length=200)
    field_key = models.CharField(max_length=100)  # unique key for API
    type = models.CharField(max_length=50, choices=FIELD_TYPES)
    options = models.JSONField(blank=True, null=True)  # For select/multiselect
    is_required = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    help_text = models.TextField(blank=True)
    validation_rules = models.JSONField(blank=True, null=True)
    
    class Meta:
        db_table = 'service_fields'
        unique_together = ('service', 'field_key')
        ordering = ['tab', 'order', 'name']
    
    def __str__(self):
        tab_name = self.tab.display_name if self.tab else "بدون تب"
        return f"{self.service.name} - {tab_name} - {self.name}"



class ContractorService(models.Model):
    """Many-to-many relationship between contractors and services"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contractor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contractor_services')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='contractor_services')
    is_active = models.BooleanField(default=True)
    added_at = models.DateTimeField(auto_now_add=True)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assigned_contractor_services')
    
    class Meta:
        db_table = 'contractor_services'
        unique_together = ('contractor', 'service')
    
    def __str__(self):
        return f"{self.contractor.username} - {self.service.name}"


class Workshop(models.Model):
    """Workshops owned by contractors"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    address = models.TextField()
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workshops')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # New fields for workshop details
    province = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    postal_address = models.TextField(blank=True)
    manager_name = models.CharField(max_length=200, blank=True)
    manager_phone = models.CharField(max_length=20, blank=True)
    capabilities = models.JSONField(default=list, blank=True)  # List of manufacturing processes
    machines = models.JSONField(default=list, blank=True)  # List of machines with precision
    
    class Meta:
        db_table = 'workshops'
    
    def __str__(self):
        return f"{self.name} - {self.owner.username}"


class WorkshopService(models.Model):
    """Many-to-many relationship between workshops and services"""
    
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE, related_name='workshop_services')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='workshop_services')
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'workshop_services'
        unique_together = ('workshop', 'service')
    
    def __str__(self):
        return f"{self.workshop.name} - {self.service.name}"


class Cart(models.Model):
    """Shopping cart for customers"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='carts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'carts'
    
    def __str__(self):
        return f"Cart {self.id} - {self.customer.username}"


class CartItem(models.Model):
    """Items in shopping cart"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='cart_items')
    field_values = models.JSONField(default=dict)  # Store field values
    needs_documentation = models.BooleanField(default=False)  # Whether documentation service is needed
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'cart_items'
    
    def __str__(self):
        return f"{self.cart.id} - {self.service.name}"


class Order(models.Model):
    """Customer orders"""
    
    ORDER_STATUS = [
        ('draft', 'پیش‌نویس'),
        ('submitted', 'ارسال شده'),
        ('in_review', 'در حال بررسی'),
        ('quoted', 'قیمت‌گذاری شده'),
        ('accepted', 'تایید شده'),
        ('in_progress', 'در حال انجام'),
        ('completed', 'تکمیل شده'),
        ('delivered', 'تحویل داده شده'),
        ('cancelled', 'لغو شده'),
        ('refunded', 'بازگشت وجه'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    order_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=50, choices=ORDER_STATUS, default='draft')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    documentation_options = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order {self.order_number} - {self.customer.username}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generate unique order number
            self.order_number = f"ORD-{timezone.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    """Items in each order"""
    
    ITEM_STATUS = [
        ('pending', 'در انتظار'),
        ('quoted', 'قیمت‌گذاری شده'),
        ('accepted', 'تایید شده'),
        ('in_progress', 'در حال انجام'),
        ('completed', 'تکمیل شده'),
        ('cancelled', 'لغو شده'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='order_items')
    assigned_contractor = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_order_items'
    )
    status = models.CharField(max_length=50, choices=ITEM_STATUS, default='pending')
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    estimated_delivery = models.DateTimeField(null=True, blank=True)
    actual_delivery = models.DateTimeField(null=True, blank=True)
    field_values = models.JSONField(default=dict)  # Store field values
    needs_documentation = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'order_items'
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.order.order_number} - {self.service.name}"


class Quote(models.Model):
    """Contractor quotes for order items"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, related_name='quotes')
    contractor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quotes')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    documentation_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # If documentation needed
    delivery_days = models.PositiveIntegerField()
    documentation_days = models.PositiveIntegerField(default=0)  # Extra days for documentation
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'در انتظار'),
        ('accepted', 'تایید شده'),
        ('rejected', 'رد شده'),
    ], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'quotes'
        unique_together = ('order_item', 'contractor')
    
    def __str__(self):
        return f"{self.contractor.username} - {self.order_item.service.name} - ${self.price}"


class OrderStatusLog(models.Model):
    """Audit trail for order status changes"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_logs')
    previous_status = models.CharField(max_length=50)
    new_status = models.CharField(max_length=50)
    changed_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='status_changes')
    reason = models.TextField(blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'order_status_logs'
        ordering = ['-changed_at']
    
    def __str__(self):
        return f"{self.order.order_number}: {self.previous_status} → {self.new_status}"


class Payment(models.Model):
    """Payment records"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    payment_id = models.CharField(max_length=100, unique=True)  # From payment gateway
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=20, choices=[
        ('online', 'آنلاین'),
        ('transfer', 'انتقال بانکی'),
        ('cash', 'نقدی'),
    ])
    status = models.CharField(max_length=20, choices=[
        ('pending', 'در انتظار'),
        ('completed', 'تکمیل شده'),
        ('failed', 'ناموفق'),
        ('refunded', 'بازگشت وجه'),
    ], default='pending')
    gateway_response = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'payments'
    
    def __str__(self):
        return f"Payment {self.payment_id} - {self.order.order_number}"


class TicketCategory(models.Model):
    """Ticket categories"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    display_name = models.CharField(max_length=100)
    requires_order = models.BooleanField(default=False)  # Whether order_id is required
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'ticket_categories'
        verbose_name_plural = 'Ticket categories'
    
    def __str__(self):
        return self.display_name


class Ticket(models.Model):
    """Support tickets"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(TicketCategory, on_delete=models.CASCADE, related_name='tickets')
    subject = models.CharField(max_length=200)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tickets')
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets')
    status = models.CharField(max_length=20, choices=[
        ('open', 'باز'),
        ('closed', 'بسته'),
        ('waiting_response', 'در انتظار پاسخ'),
        ('quarantined', 'قرنطینه شده'),
        ('escalated', 'ارجاع شده'),
    ], default='open')
    priority = models.CharField(max_length=20, choices=[
        ('low', 'کم'),
        ('medium', 'متوسط'),
        ('high', 'زیاد'),
        ('urgent', 'فوری'),
    ], default='medium')
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tickets'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Ticket {self.id} - {self.subject}"


class TicketParticipant(models.Model):
    """Who can participate in tickets"""
    
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ticket_participations')
    role = models.CharField(max_length=20, choices=[
        ('creator', 'ایجاد کننده'),
        ('assigned', 'اختصاص داده شده'),
        ('viewer', 'مشاهده کننده'),
    ])
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ticket_participants'
        unique_together = ('ticket', 'user')
    
    def __str__(self):
        return f"{self.user.username} - {self.ticket.subject}"


class TicketMessage(models.Model):
    """Messages in tickets"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ticket_messages')
    content = models.TextField()
    is_internal = models.BooleanField(default=False)  # Only for admin/support
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ticket_messages'
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.sender.username} - {self.ticket.subject}"


class TicketFileType(models.Model):
    """Allowed file types for ticket attachments"""
    
    FILE_CATEGORIES = [
        ('image', 'تصویر'),
        ('document', 'سند'),
        ('cad_3d', 'فایل سه بعدی'),
        ('drawing', 'نقشه'),
        ('other', 'سایر'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    display_name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=FILE_CATEGORIES)
    extensions = models.JSONField(default=list)  # List of allowed extensions
    mime_types = models.JSONField(default=list)  # List of allowed MIME types
    max_size_mb = models.IntegerField(default=100)  # Max file size in MB
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'ticket_file_types'
    
    def __str__(self):
        return self.display_name


class TicketAttachment(models.Model):
    """File attachments for ticket messages"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    message = models.ForeignKey(TicketMessage, on_delete=models.CASCADE, related_name='attachments')
    file_type = models.ForeignKey(TicketFileType, on_delete=models.CASCADE, related_name='attachments')
    filename = models.CharField(max_length=255)
    original_filename = models.CharField(max_length=255, blank=True, null=True)
    file_path = models.CharField(max_length=500)
    mime_type = models.CharField(max_length=100)
    file_size = models.BigIntegerField()
    attachment_type = models.CharField(max_length=20, choices=[
        ('initial', 'فایل اولیه'),
        ('revision', 'بازبینی'),
        ('final', 'فایل نهایی'),
        ('reference', 'مرجع'),
        ('other', 'سایر'),
    ], default='other')
    is_processed = models.BooleanField(default=False)  # For OCR processing
    ocr_text = models.TextField(blank=True)  # Extracted text from images/PDFs
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ticket_attachments'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.filename} - {self.message.ticket.subject}"
    
    @property
    def file_size_mb(self):
        return round(self.file_size / (1024 * 1024), 2)


class ContentFilterLog(models.Model):
    """Log for content filtering violations"""
    
    VIOLATION_TYPES = [
        ('phone', 'شماره تلفن'),
        ('email', 'ایمیل'),
        ('url', 'لینک'),
        ('social_id', 'آیدی شبکه اجتماعی'),
        ('contact_invitation', 'دعوت به ارتباط خارجی'),
        ('other', 'سایر'),
    ]
    
    ACTIONS = [
        ('blocked', 'مسدود شده'),
        ('quarantined', 'قرنطینه شده'),
        ('warning', 'هشدار'),
        ('allowed', 'مجاز'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='content_violations')
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='content_violations', null=True, blank=True)
    message = models.ForeignKey(TicketMessage, on_delete=models.CASCADE, related_name='content_violations', null=True, blank=True)
    violation_type = models.CharField(max_length=20, choices=VIOLATION_TYPES)
    detected_content = models.TextField()  # The content that was flagged
    original_content = models.TextField()  # Original content before filtering
    action_taken = models.CharField(max_length=20, choices=ACTIONS)
    confidence_score = models.FloatField(default=0.0)  # ML confidence score
    is_false_positive = models.BooleanField(default=False)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_violations')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'content_filter_logs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.violation_type} - {self.action_taken}"


class MediaFile(models.Model):
    """General media file management"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    filename = models.CharField(max_length=255)
    original_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    mime_type = models.CharField(max_length=100)
    file_size = models.BigIntegerField()
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_files')
    context = models.CharField(max_length=50, choices=[
        ('order', 'سفارش'),
        ('ticket', 'تیکت'),
        ('profile', 'پروفایل'),
        ('service', 'سرویس'),
        ('other', 'سایر'),
    ])
    context_id = models.UUIDField()  # ID of related entity
    uploaded_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)  # For temporary files
    
    class Meta:
        db_table = 'media_files'
    
    def __str__(self):
        return f"{self.original_name} - {self.context}"


class Review(models.Model):
    """Customer reviews after order completion"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, related_name='reviews')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_reviews')
    contractor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_reviews')
    rating = models.PositiveIntegerField(choices=[
        (1, '1 ستاره'),
        (2, '2 ستاره'),
        (3, '3 ستاره'),
        (4, '4 ستاره'),
        (5, '5 ستاره'),
    ])
    comment = models.TextField()
    is_approved = models.BooleanField(default=False)  # Admin approval
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_reviews')
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'reviews'
        unique_together = ('order_item', 'customer')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.customer.username} → {self.contractor.username} ({self.rating}⭐)"


class PasswordResetToken(models.Model):
    """Password reset tokens"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=100, unique=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'password_reset_tokens'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Password reset for {self.user.username}"
    
    def is_expired(self):
        return timezone.now() > self.expires_at


class PhoneVerificationCode(models.Model):
    """Phone verification codes"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='phone_verification_codes', null=True, blank=True)
    phone = models.CharField(max_length=17)
    code = models.CharField(max_length=6)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'phone_verification_codes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Verification code for {self.phone}"
    
    def is_expired(self):
        return timezone.now() > self.expires_at


class Notification(models.Model):
    """User notifications"""
    
    NOTIFICATION_TYPES = [
        ('order_status', 'تغییر وضعیت سفارش'),
        ('quote_received', 'دریافت پیشنهاد'),
        ('quote_accepted', 'تایید پیشنهاد'),
        ('payment_completed', 'تکمیل پرداخت'),
        ('order_completed', 'تکمیل سفارش'),
        ('system', 'سیستم'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    related_order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    related_quote = models.ForeignKey(Quote, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"


class HCaptchaAttempt(models.Model):
    """Audit trail for hCaptcha verification attempts"""
    
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL,
        related_name='hcaptcha_attempts'
    )
    endpoint = models.CharField(max_length=255)
    success = models.BooleanField()
    response_raw = models.JSONField(null=True, blank=True)  # Store limited JSON response
    token_hash = models.CharField(max_length=64, db_index=True)  # SHA256 of token (not token itself)
    error_message = models.TextField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'hcaptcha_attempts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['ip']),
            models.Index(fields=['success']),
            models.Index(fields=['endpoint']),
        ]
    
    def __str__(self):
        status = "Success" if self.success else "Failed"
        user_info = self.user.username if self.user else "Anonymous"
        return f"hCaptcha {status} - {user_info} - {self.endpoint}"
    
    @classmethod
    def create_attempt(
        cls,
        ip: str,
        user,
        endpoint: str,
        success: bool,
        token_hash: str,
        response_data: dict = None,
        error_message: str = None,
        user_agent: str = None
    ):
        """Create a new hCaptcha attempt record."""
        # Sanitize response data to avoid storing sensitive information
        sanitized_response = None
        if response_data:
            sanitized_response = {
                'success': response_data.get('success', False),
                'error_codes': response_data.get('error-codes', []),
                'challenge_ts': response_data.get('challenge_ts'),
                'hostname': response_data.get('hostname'),
                'bypass': response_data.get('bypass', False)
            }
        
        return cls.objects.create(
            ip=ip,
            user=user,
            endpoint=endpoint,
            success=success,
            response_raw=sanitized_response,
            token_hash=token_hash,
            error_message=error_message,
            user_agent=user_agent
        )
    
    @classmethod
    def get_stats(cls, days: int = 30):
        """Get hCaptcha statistics for the last N days."""
        from django.utils import timezone
        from datetime import timedelta
        
        since = timezone.now() - timedelta(days=days)
        attempts = cls.objects.filter(created_at__gte=since)
        
        total_attempts = attempts.count()
        successful_attempts = attempts.filter(success=True).count()
        failed_attempts = total_attempts - successful_attempts
        
        # Group by endpoint
        endpoint_stats = attempts.values('endpoint').annotate(
            total=models.Count('id'),
            successful=models.Count('id', filter=models.Q(success=True)),
            failed=models.Count('id', filter=models.Q(success=False))
        ).order_by('-total')
        
        # Group by IP (top failing IPs)
        ip_stats = attempts.filter(success=False).values('ip').annotate(
            failure_count=models.Count('id')
        ).order_by('-failure_count')[:10]
        
        return {
            'period_days': days,
            'total_attempts': total_attempts,
            'successful_attempts': successful_attempts,
            'failed_attempts': failed_attempts,
            'success_rate': (successful_attempts / total_attempts * 100) if total_attempts > 0 else 0,
            'endpoint_stats': list(endpoint_stats),
            'top_failing_ips': list(ip_stats)
        }