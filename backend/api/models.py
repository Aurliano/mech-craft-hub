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
        unique_together = ('service', 'tab', 'field_key')
        ordering = ['tab', 'order', 'name']
    
    def __str__(self):
        tab_name = self.tab.display_name if self.tab else "بدون تب"
        return f"{self.service.name} - {tab_name} - {self.name}"


class OrderProposal(models.Model):
    """Proposals from contractors for orders"""
    
    PROPOSAL_STATUS_CHOICES = [
        ('pending', 'در انتظار بررسی'),
        ('accepted', 'پذیرفته شده'),
        ('rejected', 'رد شده'),
        ('expired', 'منقضی شده'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='proposals')
    contractor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='proposals')
    price = models.DecimalField(max_digits=12, decimal_places=0, help_text="قیمت به تومان")
    delivery_days = models.PositiveIntegerField(help_text="تعداد روز تحویل")
    description = models.TextField(help_text="توضیحات انجام پروژه")
    status = models.CharField(max_length=20, choices=PROPOSAL_STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'order_proposals'
        unique_together = ('order', 'contractor')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order'], name='idx_proposal_order'),
            models.Index(fields=['status'], name='idx_proposal_status'),
        ]
    
    def __str__(self):
        return f"پیشنهاد {self.contractor.username} برای سفارش {self.order.order_number}"


class MaterialEstimate(models.Model):
    """Material cost estimates for manufacturing orders"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField('Order', on_delete=models.CASCADE, related_name='material_estimate')
    estimated_cost = models.DecimalField(max_digits=12, decimal_places=0, help_text="هزینه برآورد شده متریال به تومان")
    description = models.TextField(help_text="توضیحات متریال و هزینه")
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'material_estimates'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order'], name='idx_material_order'),
            models.Index(fields=['is_paid'], name='idx_material_is_paid'),
        ]
    
    def __str__(self):
        return f"برآورد متریال سفارش {self.order.order_number}"


class OrderStatus(models.Model):
    """Order status tracking"""
    
    STATUS_CHOICES = [
        ('submitted', 'ثبت شده'),
        ('admin_approved', 'تایید ادمین'),
        ('proposals_received', 'دریافت پیشنهادات'),
        ('proposal_accepted', 'پیشنهاد پذیرفته شده'),
        ('material_paid', 'متریال پرداخت شده'),
        ('project_paid', 'پروژه پرداخت شده'),
        ('in_progress', 'در حال انجام'),
        ('documentation_submitted', 'مستندات ارسال شده'),
        ('final_payment_pending', 'در انتظار تسویه حساب'),
        ('shipping', 'در حال ارسال'),
        ('delivered', 'تحویل به مشتری'),
        ('completed', 'تکمیل شده'),
        ('cancelled', 'لغو شده'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES)
    description = models.TextField(blank=True, help_text="توضیحات تغییر وضعیت")
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        db_table = 'order_status_history'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order'], name='idx_orderstatus_order'),
            models.Index(fields=['status'], name='idx_orderstatus_status'),
            models.Index(fields=['created_at'], name='idx_orderstatus_created'),
        ]
    
    def __str__(self):
        return f"{self.order.order_number} - {self.get_status_display()}"


class Payment(models.Model):
    """Payment tracking for orders"""
    
    PAYMENT_TYPE_CHOICES = [
        ('material', 'پرداخت متریال'),
        ('project_advance', 'پیش پرداخت پروژه'),
        ('project_final', 'تسویه حساب پروژه'),
        ('shipping', 'هزینه ارسال'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'در انتظار پرداخت'),
        ('paid', 'پرداخت شده'),
        ('failed', 'پرداخت ناموفق'),
        ('refunded', 'بازگردانده شده'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=0, help_text="مبلغ به تومان")
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, default='project_advance')
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    gateway_transaction_id = models.CharField(max_length=100, blank=True)
    gateway_response = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    webhook_nonce = models.CharField(max_length=100, blank=True)
    
    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order'], name='idx_payment_order'),
            models.Index(fields=['payment_type'], name='idx_payment_type'),
            models.Index(fields=['status'], name='idx_payment_status'),
            models.Index(fields=['created_at'], name='idx_payment_created'),
            models.Index(fields=['gateway_transaction_id'], name='idx_payment_gtid'),
            models.Index(fields=['webhook_nonce'], name='idx_payment_nonce'),
        ]
    
    def __str__(self):
        return f"پرداخت {self.get_payment_type_display()} سفارش {self.order.order_number}"



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
    code = models.CharField(max_length=10, unique=True, editable=False)  # Workshop code
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
    workers_count = models.IntegerField(default=0, blank=True, help_text='Number of formal workers')
    capabilities = models.JSONField(default=list, blank=True)  # List of capability IDs
    machines = models.JSONField(default=list, blank=True)  # List of machines with precision, capability_id, is_custom
    documents = models.JSONField(default=dict, blank=True)  # Dictionary of document field keys to file URLs
    workshop_class = models.CharField(
        max_length=10,
        blank=True,
        choices=[('A', 'Class A'), ('B', 'Class B'), ('C', 'Class C')],
        help_text='Workshop classification (A, B, or C) - set by admin during approval'
    )
    is_approved = models.BooleanField(default=False, help_text='Whether the workshop is approved by admin')
    
    def save(self, *args, **kwargs):
        # Generate workshop code if not already set
        if not self.code:
            import random
            max_attempts = 100
            for _ in range(max_attempts):
                # Generate workshop code: WS + 6 digit random number
                code = f"WS{random.randint(100000, 999999)}"
                # Check if code already exists
                if not Workshop.objects.filter(code=code).exists():
                    self.code = code
                    break
            else:
                # Fallback: use UUID if random generation fails after 100 attempts
                from uuid import uuid4
                self.code = f"WS{uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)
    
    class Meta:
        db_table = 'workshops'
    
    def __str__(self):
        return f"{self.name} ({self.code}) - {self.owner.username}"


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
        ('submitted', 'ثبت شده'),
        ('admin_approved', 'تایید ادمین'),
        ('proposals_received', 'دریافت پیشنهادات'),
        ('proposal_accepted', 'پیشنهاد پذیرفته شده'),
        ('material_paid', 'متریال پرداخت شده'),
        ('project_paid', 'پروژه پرداخت شده'),
        ('in_progress', 'در حال انجام'),
        ('documentation_submitted', 'مستندات ارسال شده'),
        ('final_payment_pending', 'در انتظار تسویه حساب'),
        ('shipping', 'در حال ارسال'),
        ('delivered', 'تحویل به مشتری'),
        ('completed', 'تکمیل شده'),
        ('cancelled', 'لغو شده'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    order_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=50, choices=ORDER_STATUS, default='submitted')
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


class TurnstileAttempt(models.Model):
    """Audit trail for Turnstile verification attempts"""
    
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL,
        related_name='turnstile_attempts'
    )
    endpoint = models.CharField(max_length=255)
    success = models.BooleanField()
    response_raw = models.JSONField(null=True, blank=True)  # Store limited JSON response
    token_hash = models.CharField(max_length=64, db_index=True)  # SHA256 of token (not token itself)
    error_message = models.TextField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'turnstile_attempts'
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
        return f"Turnstile {status} - {user_info} - {self.endpoint}"
    
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
        """Create a new Turnstile attempt record."""
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
        """Get Turnstile statistics for the last N days."""
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


class SupportFeedback(models.Model):
    """Model for storing user feedback and support interactions"""
    
    SATISFACTION_CHOICES = [
        (0, 'خیلی ضعیف'),
        (1, 'ضعیف'),
        (2, 'متوسط'),
        (3, 'خوب'),
        (4, 'خیلی خوب'),
        (5, 'عالی'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='support_feedbacks')
    
    # Default feedback questions
    used_services = models.BooleanField(null=True, blank=True, help_text="آیا از خدمات و محتوای سایت استفاده کردید؟")
    satisfaction_rating = models.IntegerField(
        choices=SATISFACTION_CHOICES, 
        null=True, 
        blank=True,
        help_text="تا چه میزان از کیفیت سایت رضایت دارید؟"
    )
    personal_feedback = models.TextField(
        blank=True, 
        null=True,
        help_text="نظر شخصی شما راجع به رابط کاربری و محتوای سایت چیست؟"
    )
    
    # AI Support fields
    ai_response = models.TextField(blank=True, null=True, help_text="پاسخ هوش مصنوعی")
    ai_model_used = models.CharField(max_length=100, blank=True, null=True, help_text="مدل AI استفاده شده")
    ai_prompt_tokens = models.IntegerField(null=True, blank=True, help_text="تعداد توکن‌های پرسپت")
    ai_response_tokens = models.IntegerField(null=True, blank=True, help_text="تعداد توکن‌های پاسخ")
    
    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    session_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'بازخورد پشتیبانی'
        verbose_name_plural = 'بازخوردهای پشتیبانی'
    
    def __str__(self):
        user_info = self.user.username if self.user else "ناشناس"
        return f"بازخورد پشتیبانی - {user_info} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    @property
    def satisfaction_display(self):
        """Return human-readable satisfaction rating"""
        if self.satisfaction_rating is not None:
            return dict(self.SATISFACTION_CHOICES)[self.satisfaction_rating]
        return "نامشخص"
    
    @classmethod
    def get_stats(cls, days: int = 30):
        """Get support feedback statistics"""
        from django.utils import timezone
        from datetime import timedelta
        
        since = timezone.now() - timedelta(days=days)
        feedbacks = cls.objects.filter(created_at__gte=since)
        
        total_feedbacks = feedbacks.count()
        with_ai_response = feedbacks.exclude(ai_response__isnull=True).exclude(ai_response='').count()
        
        # Satisfaction distribution
        satisfaction_stats = {}
        for rating, label in cls.SATISFACTION_CHOICES:
            count = feedbacks.filter(satisfaction_rating=rating).count()
            satisfaction_stats[label] = count
        
        # Service usage stats
        used_services_count = feedbacks.filter(used_services=True).count()
        not_used_services_count = feedbacks.filter(used_services=False).count()
        
        return {
            'period_days': days,
            'total_feedbacks': total_feedbacks,
            'with_ai_response': with_ai_response,
            'ai_response_rate': (with_ai_response / total_feedbacks * 100) if total_feedbacks > 0 else 0,
            'satisfaction_distribution': satisfaction_stats,
            'service_usage': {
                'used': used_services_count,
                'not_used': not_used_services_count,
                'usage_rate': (used_services_count / total_feedbacks * 100) if total_feedbacks > 0 else 0
            }
        }


class MaterialEstimation(models.Model):
    """برآورد متریال توسط مدیر برای سفارشات ساخت"""
    
    ESTIMATION_STATUS_CHOICES = [
        ('pending', 'در انتظار تایید'),
        ('approved', 'تایید شده'),
        ('rejected', 'رد شده'),
        ('revised', 'بازنگری شده'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, related_name='material_estimations')
    estimator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='material_estimations')
    
    # Material details
    material_name = models.CharField(max_length=200, help_text="نام متریال")
    material_type = models.CharField(max_length=100, help_text="نوع متریال")
    quantity = models.DecimalField(max_digits=10, decimal_places=2, help_text="مقدار")
    unit = models.CharField(max_length=50, help_text="واحد اندازه‌گیری")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="قیمت واحد")
    total_price = models.DecimalField(max_digits=12, decimal_places=2, help_text="قیمت کل")
    
    # Supplier information
    supplier_name = models.CharField(max_length=200, blank=True, help_text="نام تامین کننده")
    supplier_contact = models.CharField(max_length=200, blank=True, help_text="اطلاعات تماس تامین کننده")
    
    # Additional details
    specifications = models.TextField(blank=True, help_text="مشخصات فنی")
    delivery_time = models.PositiveIntegerField(help_text="زمان تحویل (روز)")
    notes = models.TextField(blank=True, help_text="یادداشت‌ها")
    
    # Status and approval
    status = models.CharField(max_length=20, choices=ESTIMATION_STATUS_CHOICES, default='pending')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_material_estimations')
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, help_text="دلیل رد")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'برآورد متریال'
        verbose_name_plural = 'برآوردهای متریال'
    
    def __str__(self):
        return f"{self.material_name} - {self.order_item.order.order_number}"
    
    def save(self, *args, **kwargs):
        # Calculate total price
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class ScientificContent(models.Model):
    """Model for scientific content including articles, books, software, and videos"""
    
    CONTENT_TYPE_CHOICES = [
        ('article', 'مقاله'),
        ('book', 'کتاب'),
        ('software', 'نرم‌افزار کاربردی'),
        ('video', 'ویدیو'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'پیش‌نویس'),
        ('published', 'منتشر شده'),
        ('archived', 'آرشیو شده'),
    ]
    
    CATEGORY_CHOICES = [
        ('mechatronics', 'مکاترونیک'),
        ('mechanical', 'مهندسی مکانیک'),
        ('electronics', 'مهندسی الکترونیک'),
        ('computer', 'مهندسی کامپیوتر'),
        ('metaverse', 'متاورس'),
        ('ai', 'هوش مصنوعی'),
        ('simulation', 'شبیه‌سازی'),
        ('design', 'طراحی'),
        ('manufacturing', 'ساخت و تولید'),
        ('general', 'عمومی'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, help_text="عنوان محتوا")
    slug = models.SlugField(max_length=200, unique=True, help_text="آدرس URL محتوا")
    excerpt = models.TextField(max_length=500, help_text="خلاصه محتوا")
    content = models.TextField(help_text="محتوای کامل")
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPE_CHOICES, default='article')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # SEO fields
    meta_description = models.CharField(max_length=160, blank=True, help_text="توضیحات متا برای SEO")
    meta_keywords = models.CharField(max_length=200, blank=True, help_text="کلمات کلیدی برای SEO")
    
    # Author and publishing
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scientific_content')
    featured_image = models.URLField(blank=True, null=True, help_text="تصویر شاخص مقاله")
    
    # Source information
    source_url = models.URLField(blank=True, null=True, help_text="لینک منبع اصلی")
    source_name = models.CharField(max_length=100, blank=True, help_text="نام منبع")
    
    # Statistics
    view_count = models.PositiveIntegerField(default=0)
    like_count = models.PositiveIntegerField(default=0)
    
    # Additional fields for different content types
    download_url = models.URLField(blank=True, null=True, help_text="لینک دانلود (برای نرم‌افزار و کتاب)")
    video_url = models.URLField(blank=True, null=True, help_text="لینک ویدیو (برای محتوای ویدیویی)")
    file_size = models.BigIntegerField(null=True, blank=True, help_text="حجم فایل (برای دانلود)")
    duration = models.PositiveIntegerField(null=True, blank=True, help_text="مدت زمان ویدیو (ثانیه)")
    
    # File management
    file_name = models.CharField(max_length=255, blank=True, help_text="نام فایل اصلی")
    file_type = models.CharField(max_length=50, blank=True, help_text="نوع فایل (pdf, docx, etc)")
    file_path = models.CharField(max_length=500, blank=True, help_text="مسیر فایل در storage")
    is_public = models.BooleanField(default=True, help_text="آیا فایل عمومی است یا نیاز به احراز هویت دارد")
    download_count = models.PositiveIntegerField(default=0, help_text="تعداد دانلودها")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-published_at', '-created_at']
        verbose_name = 'محتوا علمی'
        verbose_name_plural = 'مطالب علمی'
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)
    
    @property
    def reading_time(self):
        """Calculate estimated reading time in minutes"""
        words_per_minute = 200
        word_count = len(self.content.split())
        return max(1, round(word_count / words_per_minute))
    
    @classmethod
    def get_published_content(cls):
        """Get all published content"""
        return cls.objects.filter(status='published')
    
    @classmethod
    def get_content_by_category(cls, category):
        """Get published content by category"""
        return cls.objects.filter(status='published', category=category)
    
    @classmethod
    def get_content_by_type(cls, content_type):
        """Get published content by type"""
        return cls.objects.filter(status='published', content_type=content_type)
    
    @classmethod
    def get_featured_content(cls, limit=3):
        """Get featured content (most viewed)"""
        return cls.objects.filter(status='published').order_by('-view_count')[:limit]
    
    @classmethod
    def get_recent_content(cls, limit=5):
        """Get recent published content"""
        return cls.objects.filter(status='published').order_by('-published_at')[:limit]


class BlogPost(models.Model):
    """Model for blog posts - keeping for backward compatibility"""
    
    STATUS_CHOICES = [
        ('draft', 'پیش‌نویس'),
        ('published', 'منتشر شده'),
        ('archived', 'آرشیو شده'),
    ]
    
    CATEGORY_CHOICES = [
        ('mechatronics', 'مکاترونیک'),
        ('mechanical', 'مهندسی مکانیک'),
        ('electronics', 'مهندسی الکترونیک'),
        ('computer', 'مهندسی کامپیوتر'),
        ('metaverse', 'متاورس'),
        ('ai', 'هوش مصنوعی'),
        ('simulation', 'شبیه‌سازی'),
        ('design', 'طراحی'),
        ('manufacturing', 'ساخت و تولید'),
        ('general', 'عمومی'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, help_text="عنوان مقاله")
    slug = models.SlugField(max_length=200, unique=True, help_text="آدرس URL مقاله")
    excerpt = models.TextField(max_length=500, help_text="خلاصه مقاله")
    content = models.TextField(help_text="محتوای کامل مقاله")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # SEO fields
    meta_description = models.CharField(max_length=160, blank=True, help_text="توضیحات متا برای SEO")
    meta_keywords = models.CharField(max_length=200, blank=True, help_text="کلمات کلیدی برای SEO")
    
    # Author and publishing
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
    featured_image = models.URLField(blank=True, null=True, help_text="تصویر شاخص مقاله")
    
    # Source information
    source_url = models.URLField(blank=True, null=True, help_text="لینک منبع اصلی")
    source_name = models.CharField(max_length=100, blank=True, help_text="نام منبع")
    
    # Statistics
    view_count = models.PositiveIntegerField(default=0)
    like_count = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-published_at', '-created_at']
        verbose_name = 'مقاله وبلاگ'
        verbose_name_plural = 'مقالات وبلاگ'
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)
    
    @property
    def reading_time(self):
        """Calculate estimated reading time in minutes"""
        words_per_minute = 200
        word_count = len(self.content.split())
        return max(1, round(word_count / words_per_minute))
    
    @classmethod
    def get_published_posts(cls):
        """Get all published posts"""
        return cls.objects.filter(status='published')
    
    @classmethod
    def get_posts_by_category(cls, category):
        """Get published posts by category"""
        return cls.objects.filter(status='published', category=category)
    
    @classmethod
    def get_featured_posts(cls, limit=3):
        """Get featured posts (most viewed)"""
        return cls.objects.filter(status='published').order_by('-view_count')[:limit]
    
    @classmethod
    def get_recent_posts(cls, limit=5):
        """Get recent published posts"""
        return cls.objects.filter(status='published').order_by('-published_at')[:limit]


class AIInteractionLog(models.Model):
    """Log AI interactions for learning and improvement"""
    
    INTERACTION_TYPES = [
        ('question', 'سوال'),
        ('feedback', 'بازخورد'),
        ('complaint', 'شکایت'),
        ('compliment', 'تعریف'),
        ('suggestion', 'پیشنهاد'),
    ]
    
    SATISFACTION_LEVELS = [
        ('very_dissatisfied', 'خیلی ناراضی'),
        ('dissatisfied', 'ناراضی'),
        ('neutral', 'خنثی'),
        ('satisfied', 'راضی'),
        ('very_satisfied', 'خیلی راضی'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='ai_interactions')
    
    # Interaction details
    user_input = models.TextField(help_text="ورودی کاربر")
    ai_response = models.TextField(help_text="پاسخ هوش مصنوعی")
    interaction_type = models.CharField(max_length=20, choices=INTERACTION_TYPES, default='question')
    
    # Context information
    user_context = models.JSONField(default=dict, help_text="زمینه کاربر")
    prompt_tokens = models.IntegerField(default=0)
    response_tokens = models.IntegerField(default=0)
    
    # User feedback
    user_satisfaction = models.CharField(max_length=20, choices=SATISFACTION_LEVELS, null=True, blank=True)
    user_feedback_text = models.TextField(blank=True, null=True)
    response_helpful = models.BooleanField(null=True, blank=True)
    response_accurate = models.BooleanField(null=True, blank=True)
    
    # Learning data
    keywords_detected = models.JSONField(default=list, help_text="کلمات کلیدی تشخیص داده شده")
    domain_identified = models.CharField(max_length=50, blank=True, help_text="حوزه شناسایی شده")
    response_quality_score = models.FloatField(default=0.0, help_text="امتیاز کیفیت پاسخ")
    
    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    session_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'لاگ تعامل هوش مصنوعی'
        verbose_name_plural = 'لاگ‌های تعامل هوش مصنوعی'
    
    def __str__(self):
        user_info = self.user.username if self.user else "ناشناس"
        return f"تعامل AI - {user_info} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class AIResponsePattern(models.Model):
    """Patterns learned from user interactions for improving responses"""
    
    PATTERN_TYPES = [
        ('keyword_response', 'پاسخ بر اساس کلمه کلیدی'),
        ('domain_response', 'پاسخ بر اساس حوزه'),
        ('context_response', 'پاسخ بر اساس زمینه'),
        ('user_type_response', 'پاسخ بر اساس نوع کاربر'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pattern_type = models.CharField(max_length=30, choices=PATTERN_TYPES)
    
    # Pattern definition
    trigger_keywords = models.JSONField(default=list, help_text="کلمات کلیدی محرک")
    trigger_domains = models.JSONField(default=list, help_text="حوزه‌های محرک")
    trigger_context = models.JSONField(default=dict, help_text="زمینه محرک")
    
    # Response template
    response_template = models.TextField(help_text="قالب پاسخ")
    response_examples = models.JSONField(default=list, help_text="نمونه‌های پاسخ")
    
    # Effectiveness metrics
    usage_count = models.PositiveIntegerField(default=0)
    success_rate = models.FloatField(default=0.0)
    average_satisfaction = models.FloatField(default=0.0)
    
    # Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-success_rate', '-usage_count']
        verbose_name = 'الگوی پاسخ هوش مصنوعی'
        verbose_name_plural = 'الگوهای پاسخ هوش مصنوعی'
    
    def __str__(self):
        return f"الگوی {self.pattern_type} - {self.usage_count} استفاده"


class BlogComment(models.Model):
    """Model for blog post comments"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    author_name = models.CharField(max_length=100, help_text="نام نویسنده نظر")
    author_email = models.EmailField(help_text="ایمیل نویسنده نظر")
    content = models.TextField(help_text="متن نظر")
    is_approved = models.BooleanField(default=False, help_text="تایید شده")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'نظر وبلاگ'
        verbose_name_plural = 'نظرات وبلاگ'
    
    def __str__(self):
        return f"نظر {self.author_name} برای {self.post.title}"


class DeliveryFile(models.Model):
    """Model for managing delivery files for orders"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='delivery_files')
    
    # File information
    file_path = models.CharField(max_length=500, help_text="مسیر فایل در سیستم")
    file_name = models.CharField(max_length=255, help_text="نام فایل")
    file_size = models.BigIntegerField(default=0, help_text="اندازه فایل به بایت")
    content_type = models.CharField(max_length=100, default='application/octet-stream', help_text="نوع محتوا")
    
    # Upload information
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='uploaded_deliveries')
    upload_date = models.DateTimeField(auto_now_add=True)
    
    # Access control
    download_count = models.IntegerField(default=0, help_text="تعداد دانلود")
    last_download = models.DateTimeField(null=True, blank=True, help_text="آخرین زمان دانلود")
    is_active = models.BooleanField(default=True, help_text="فعال بودن لینک دانلود")
    expires_at = models.DateTimeField(null=True, blank=True, help_text="تاریخ انقضا")
    
    # Description
    description = models.TextField(blank=True, help_text="توضیحات فایل")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'فایل تحویلی'
        verbose_name_plural = 'فایل‌های تحویلی'
        indexes = [
            models.Index(fields=['order', 'is_active']),
            models.Index(fields=['upload_date']),
        ]
    
    def __str__(self):
        return f"فایل {self.file_name} برای سفارش {self.order.id}"
    
    def increment_download(self):
        """Increment download count and update last download time"""
        from django.utils import timezone
        self.download_count += 1
        self.last_download = timezone.now()
        self.save(update_fields=['download_count', 'last_download'])
    
    def is_expired(self):
        """Check if the file has expired"""
        if not self.expires_at:
            return False
        from django.utils import timezone
        return timezone.now() > self.expires_at


# Workforce Management Models

class JobSeeker(models.Model):
    """Model for users seeking job opportunities"""
    
    EDUCATION_CHOICES = [
        ('no_degree', 'بدون مدرک'),
        ('diploma', 'دیپلم'),
        ('associate', 'کاردانی'),
        ('bachelor', 'کارشناسی'),
        ('master', 'کارشناسی ارشد'),
        ('phd', 'دکترا'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_seeker_profile')
    
    # Job information
    job_title = models.CharField(max_length=200, help_text="عنوان شغل (مثلاً: تراشکار، برنامه‌نویس)")
    experience_years = models.PositiveIntegerField(help_text="سال‌های تجربه")
    education = models.CharField(max_length=20, choices=EDUCATION_CHOICES, help_text="مدرک تحصیلی")
    cv_text = models.TextField(help_text="رزومه کامل (تخصص‌ها و توانایی‌ها)")
    
    # Skills and services
    service_scope = models.ForeignKey(Scope, on_delete=models.SET_NULL, null=True, blank=True, related_name='job_seekers')
    services = models.ManyToManyField(Service, blank=True, related_name='job_seekers', help_text="خدمات قابل ارائه")
    skills = models.JSONField(default=list, blank=True, help_text="لیست مهارت‌ها")
    
    # Personal information (hidden from other users)
    address = models.TextField(blank=True, help_text="آدرس کامل")
    phone_alt = models.CharField(max_length=17, blank=True, help_text="شماره تماس اضافی")
    emergency_contact = models.CharField(max_length=200, blank=True, help_text="مخاطب اضطراری")
    emergency_phone = models.CharField(max_length=17, blank=True, help_text="تلفن اضطراری")
    
    # Status
    is_active = models.BooleanField(default=True, help_text="فعال بودن پروفایل")
    is_available = models.BooleanField(default=True, help_text="در دسترس برای استخدام")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'job_seekers'
        verbose_name = 'جویای کار'
        verbose_name_plural = 'جویای‌کارها'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_active', 'is_available']),
            models.Index(fields=['job_title']),
        ]
    
    def __str__(self):
        return f"{self.job_title} - {self.user.username}"


class WorkRequest(models.Model):
    """Model for contractor/workshop workforce requests"""
    
    REQUEST_STATUS_CHOICES = [
        ('pending', 'در انتظار بررسی'),
        ('approved', 'تایید شده'),
        ('rejected', 'رد شده'),
        ('in_process', 'در حال جذب نیرو'),
        ('completed', 'تکمیل شده'),
        ('cancelled', 'لغو شده'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contractor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workforce_requests')
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE, null=True, blank=True, related_name='workforce_requests')
    
    # Required workforce details
    requested_job_title = models.CharField(max_length=200, help_text="عنوان شغل مورد نظر")
    required_skills = models.JSONField(default=list, help_text="مهارت‌های مورد نیاز")
    service_scope = models.ForeignKey(Scope, on_delete=models.SET_NULL, null=True, blank=True, related_name='work_requests')
    required_services = models.ManyToManyField(Service, blank=True, related_name='work_requests', help_text="خدمات مورد نیاز")
    min_experience = models.PositiveIntegerField(default=0, help_text="حداقل تجربه (سال)")
    preferred_education = models.CharField(max_length=20, choices=JobSeeker.EDUCATION_CHOICES, blank=True, help_text="مدرک تحصیلی ترجیحی")
    
    # Work details
    offered_salary = models.DecimalField(max_digits=10, decimal_places=0, null=True, blank=True, help_text="حقوق پیشنهادی (تومان)")
    work_hours = models.CharField(max_length=100, blank=True, help_text="ساعت کار")
    work_location = models.CharField(max_length=200, help_text="محل کار")
    work_type = models.CharField(max_length=50, choices=[
        ('full_time', 'تمام وقت'),
        ('part_time', 'پاره وقت'),
        ('contract', 'پیمانی'),
        ('hourly', 'ساعتی'),
    ], default='full_time', help_text="نوع کار")
    
    # Additional information
    description = models.TextField(help_text="شرح کامل نیاز")
    requirements = models.TextField(blank=True, help_text="نیازمندی‌های اضافی")
    
    # Status
    status = models.CharField(max_length=20, choices=REQUEST_STATUS_CHOICES, default='pending')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_requests')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    admin_notes = models.TextField(blank=True, help_text="یادداشت ادمین")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'work_requests'
        verbose_name = 'درخواست نیروی کار'
        verbose_name_plural = 'درخواست‌های نیروی کار'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['contractor']),
        ]
    
    def __str__(self):
        return f"درخواست {self.requested_job_title} برای {self.contractor.username}"


class JobMatch(models.Model):
    """Model for matching job seekers with work requests"""
    
    MATCH_STATUS_CHOICES = [
        ('suggested', 'پیشنهاد شده'),
        ('accepted_contractor', 'تایید شده توسط کارفرما'),
        ('accepted_seeker', 'تایید شده توسط کارجو'),
        ('rejected', 'رد شده'),
        ('sent_for_test', 'ارسال برای تست'),
        ('test_passed', 'تست موفق'),
        ('test_failed', 'تست ناموفق'),
        ('contract_signed', 'قرارداد امضا شده'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    work_request = models.ForeignKey(WorkRequest, on_delete=models.CASCADE, related_name='matches')
    job_seeker = models.ForeignKey(JobSeeker, on_delete=models.CASCADE, related_name='matches')
    
    # Match details
    match_score = models.FloatField(default=0.0, help_text="امتیاز تطابق (0-100)")
    match_reason = models.TextField(blank=True, help_text="دلیل پیشنهاد این نیرو")
    
    # Status
    status = models.CharField(max_length=30, choices=MATCH_STATUS_CHOICES, default='suggested')
    
    # Test period
    test_start_date = models.DateTimeField(null=True, blank=True, help_text="شروع تست")
    test_end_date = models.DateTimeField(null=True, blank=True, help_text="پایان تست")
    test_result = models.TextField(blank=True, help_text="نتیجه تست")
    test_notes = models.TextField(blank=True, help_text="یادداشت‌های تست")
    
    # Feedback
    contractor_feedback = models.TextField(blank=True, help_text="نظر کارفرما")
    seeker_feedback = models.TextField(blank=True, help_text="نظر کارجو")
    
    # Suggested by admin
    suggested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='suggested_matches')
    suggested_at = models.DateTimeField(auto_now_add=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'job_matches'
        verbose_name = 'تطابق شغل'
        verbose_name_plural = 'تطابق‌های شغل'
        ordering = ['-match_score', '-created_at']
        unique_together = ('work_request', 'job_seeker')
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['match_score']),
            models.Index(fields=['work_request', 'job_seeker']),
        ]
    
    def __str__(self):
        return f"تطابق {self.job_seeker.user.username} با درخواست {self.work_request.requested_job_title}"


class WorkContract(models.Model):
    """Model for managing workforce contracts"""
    
    CONTRACT_STATUS_CHOICES = [
        ('draft', 'پیش‌نویس'),
        ('pending_signer', 'در انتظار امضا'),
        ('pending_seeker', 'در انتظار امضای کارجو'),
        ('active', 'فعال'),
        ('completed', 'تکمیل شده'),
        ('terminated', 'خاتمه یافته'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_match = models.OneToOneField(JobMatch, on_delete=models.CASCADE, related_name='contract')
    work_request = models.ForeignKey(WorkRequest, on_delete=models.CASCADE, related_name='contracts')
    job_seeker = models.ForeignKey(JobSeeker, on_delete=models.CASCADE, related_name='contracts')
    contractor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workforce_contracts')
    
    # Contract details
    contract_number = models.CharField(max_length=50, unique=True, blank=True, help_text="شماره قرارداد")
    start_date = models.DateTimeField(help_text="تاریخ شروع")
    end_date = models.DateTimeField(null=True, blank=True, help_text="تاریخ پایان")
    
    # Financial terms
    salary_amount = models.DecimalField(max_digits=10, decimal_places=0, help_text="مبلغ حقوق (تومان)")
    salary_frequency = models.CharField(max_length=20, choices=[
        ('daily', 'روزانه'),
        ('weekly', 'هفتگی'),
        ('monthly', 'ماهیانه'),
        ('hourly', 'ساعتی'),
        ('project_based', 'پروژه‌ای'),
    ], default='monthly', help_text="فرکانس پرداخت")
    
    # Work conditions
    work_hours = models.CharField(max_length=100, help_text="ساعت کار")
    work_location = models.CharField(max_length=200, help_text="محل کار")
    responsibilities = models.TextField(help_text="وظایف و مسئولیت‌ها")
    
    # Status
    status = models.CharField(max_length=20, choices=CONTRACT_STATUS_CHOICES, default='draft')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='try_created_contracts')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_contracts')
    
    # Signatures
    contractor_signed = models.BooleanField(default=False)
    contractor_signed_at = models.DateTimeField(null=True, blank=True)
    
    seeker_signed = models.BooleanField(default=False)
    seeker_signed_at = models.DateTimeField(null=True, blank=True)
    
    # Contract documents
    contract_file_path = models.CharField(max_length=500, blank=True, help_text="مسیر فایل قرارداد")
    
    # Termination
    termination_reason = models.TextField(blank=True, help_text="دلیل خاتمه")
    termination_date = models.DateTimeField(null=True, blank=True, help_text="تاریخ خاتمه")
    termination_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='terminated_contracts')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'work_contracts'
        verbose_name = 'قرارداد کاری'
        verbose_name_plural = 'قراردادهای کاری'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['contract_number']),
            models.Index(fields=['status']),
            models.Index(fields=['contractor', 'job_seeker']),
            models.Index(fields=['start_date', 'end_date']),
        ]
    
    def __str__(self):
        return f"قرارداد {self.contract_number} - {self.job_seeker.user.username}"
    
    def save(self, *args, **kwargs):
        if not self.contract_number:
            # Generate unique contract number
            self.contract_number = f"WRK-{timezone.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        super().save(*args, **kwargs)


