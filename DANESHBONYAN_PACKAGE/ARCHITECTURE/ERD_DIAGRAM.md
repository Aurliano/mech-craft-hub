# ERD (Entity Relationship Diagram) - MechCraft Hub

## 📊 نمودار روابط موجودیت‌ها

این سند شامل نمودار کامل روابط موجودیت‌های سیستم MechCraft Hub است.

---

## 🏗️ ساختار کلی دیتابیس

### Core Entities (موجودیت‌های اصلی)

#### ۱. User Management
- **User**: کاربران سیستم (مشتری، پیمانکار، ادمین)
- **Role**: نقش‌های کاربری
- **Permission**: مجوزهای سیستم
- **UserRole**: ارتباط کاربران و نقش‌ها

#### ۲. Service Management
- **Scope**: حوزه‌های خدماتی (مکانیک، الکترونیک، ...)
- **Service**: سرویس‌های ارائه شده
- **ServiceTab**: تب‌های هر سرویس
- **ServiceField**: فیلدهای پویای سرویس‌ها

#### ۳. Contractor Management
- **ContractorService**: ارتباط پیمانکاران و سرویس‌ها
- **Workshop**: کارگاه‌های پیمانکاران
- **WorkshopService**: ارتباط کارگاه‌ها و سرویس‌ها

#### ۴. Order Management
- **Cart**: سبد خرید مشتریان
- **CartItem**: آیتم‌های سبد خرید
- **Order**: سفارشات مشتریان
- **OrderItem**: آیتم‌های سفارش
- **Quote**: پیشنهادات پیمانکاران

#### ۵. Payment & Status
- **Payment**: پرداخت‌ها
- **OrderStatusLog**: لاگ تغییرات وضعیت سفارش

#### ۶. Support System
- **TicketCategory**: دسته‌بندی تیکت‌ها
- **Ticket**: تیکت‌های پشتیبانی
- **TicketParticipant**: شرکت‌کنندگان در تیکت
- **TicketMessage**: پیام‌های تیکت
- **TicketFileType**: انواع فایل مجاز
- **TicketAttachment**: فایل‌های پیوست

#### ۷. Security & Verification
- **PasswordResetToken**: توکن‌های بازنشانی رمز عبور
- **PhoneVerificationCode**: کدهای تأیید شماره تلفن
- **TurnstileAttempt**: تلاش‌های تأیید Turnstile
- **ContentFilterLog**: لاگ فیلتر محتوا

#### ۸. Communication & Feedback
- **Notification**: اعلان‌های کاربران
- **Review**: نظرات مشتریان
- **SupportFeedback**: بازخورد پشتیبانی

#### ۹. Content Management
- **BlogPost**: مقالات وبلاگ
- **BlogComment**: نظرات مقالات
- **MediaFile**: مدیریت فایل‌های رسانه

---

## 🔗 روابط اصلی

### User Relationships
```
User (1) ←→ (N) UserRole ←→ (1) Role
User (1) ←→ (N) Workshop
User (1) ←→ (N) Order
User (1) ←→ (N) Quote
User (1) ←→ (N) Ticket
User (1) ←→ (N) Review
User (1) ←→ (N) Notification
```

### Service Relationships
```
Scope (1) ←→ (N) Service
Service (1) ←→ (N) ServiceTab
Service (1) ←→ (N) ServiceField
Service (1) ←→ (N) ContractorService
Service (1) ←→ (N) WorkshopService
Service (1) ←→ (N) CartItem
Service (1) ←→ (N) OrderItem
```

### Order Relationships
```
User (1) ←→ (N) Cart ←→ (N) CartItem ←→ (1) Service
User (1) ←→ (N) Order ←→ (N) OrderItem ←→ (1) Service
OrderItem (1) ←→ (N) Quote ←→ (1) User (Contractor)
Order (1) ←→ (N) Payment
Order (1) ←→ (N) OrderStatusLog
```

### Support Relationships
```
TicketCategory (1) ←→ (N) Ticket
Ticket (1) ←→ (N) TicketParticipant ←→ (1) User
Ticket (1) ←→ (N) TicketMessage ←→ (1) User
TicketMessage (1) ←→ (N) TicketAttachment ←→ (1) TicketFileType
```

---

## 📋 جزئیات موجودیت‌ها

### User Model
```sql
CREATE TABLE api_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    phone VARCHAR(17) UNIQUE NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    profile_image VARCHAR(200),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Service Model
```sql
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope_id UUID REFERENCES scopes(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL, -- design, analysis, drawing, manufacturing
    description TEXT,
    base_price DECIMAL(10,2),
    estimated_delivery_days INTEGER,
    supports_documentation BOOLEAN DEFAULT FALSE,
    has_tabs BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(scope_id, name, type)
);
```

### Order Model
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES api_user(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    total_amount DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    documentation_options JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Quote Model
```sql
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    contractor_id UUID REFERENCES api_user(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    documentation_price DECIMAL(10,2) DEFAULT 0,
    delivery_days INTEGER NOT NULL,
    documentation_days INTEGER DEFAULT 0,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    UNIQUE(order_item_id, contractor_id)
);
```

---

## 🎯 Indexes و Performance

### Primary Indexes
```sql
-- User indexes
CREATE INDEX idx_user_email ON api_user(email);
CREATE INDEX idx_user_phone ON api_user(phone);
CREATE INDEX idx_user_created_at ON api_user(created_at);

-- Service indexes
CREATE INDEX idx_service_scope ON services(scope_id);
CREATE INDEX idx_service_type ON services(type);
CREATE INDEX idx_service_active ON services(is_active);

-- Order indexes
CREATE INDEX idx_order_customer ON orders(customer_id);
CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_order_created_at ON orders(created_at);
CREATE INDEX idx_order_number ON orders(order_number);

-- Quote indexes
CREATE INDEX idx_quote_order_item ON quotes(order_item_id);
CREATE INDEX idx_quote_contractor ON quotes(contractor_id);
CREATE INDEX idx_quote_status ON quotes(status);
CREATE INDEX idx_quote_created_at ON quotes(created_at);

-- Ticket indexes
CREATE INDEX idx_ticket_category ON tickets(category_id);
CREATE INDEX idx_ticket_creator ON tickets(creator_id);
CREATE INDEX idx_ticket_status ON tickets(status);
CREATE INDEX idx_ticket_priority ON tickets(priority);
CREATE INDEX idx_ticket_created_at ON tickets(created_at);
```

### Composite Indexes
```sql
-- Performance indexes
CREATE INDEX idx_order_customer_status ON orders(customer_id, status);
CREATE INDEX idx_quote_order_contractor ON quotes(order_item_id, contractor_id);
CREATE INDEX idx_ticket_creator_status ON tickets(creator_id, status);
CREATE INDEX idx_service_scope_active ON services(scope_id, is_active);
```

---

## 🔒 Security Considerations

### Data Protection
- **UUID Primary Keys**: استفاده از UUID برای امنیت بیشتر
- **Soft Deletes**: حذف منطقی به جای حذف فیزیکی
- **Audit Trails**: ثبت تمام تغییرات مهم
- **Data Encryption**: رمزگذاری داده‌های حساس

### Access Control
- **Role-Based Access**: کنترل دسترسی بر اساس نقش
- **Permission System**: سیستم مجوزهای دقیق
- **Data Isolation**: جداسازی داده‌های کاربران
- **Audit Logging**: ثبت تمام عملیات

---

## 📊 Database Statistics

### Table Sizes (پیش‌بینی)
- **api_user**: ~10,000 records
- **services**: ~100 records
- **orders**: ~50,000 records
- **quotes**: ~200,000 records
- **tickets**: ~5,000 records
- **notifications**: ~100,000 records

### Performance Metrics
- **Query Response Time**: < 100ms
- **Concurrent Users**: 1,000+
- **Data Growth**: 10% monthly
- **Backup Frequency**: Daily

---

## 🚀 Scalability Considerations

### Horizontal Scaling
- **Read Replicas**: برای خواندن داده‌ها
- **Sharding**: تقسیم داده‌ها بر اساس کاربر
- **Caching**: Redis برای کش کردن داده‌ها
- **CDN**: برای فایل‌های استاتیک

### Vertical Scaling
- **Database Optimization**: بهینه‌سازی کوئری‌ها
- **Index Optimization**: بهینه‌سازی ایندکس‌ها
- **Connection Pooling**: مدیریت اتصالات
- **Memory Optimization**: بهینه‌سازی حافظه

---

## 📈 Monitoring & Maintenance

### Database Monitoring
- **Query Performance**: مانیتورینگ عملکرد کوئری‌ها
- **Connection Pool**: مانیتورینگ اتصالات
- **Disk Usage**: مانیتورینگ استفاده از دیسک
- **Memory Usage**: مانیتورینگ استفاده از حافظه

### Maintenance Tasks
- **Regular Backups**: پشتیبان‌گیری منظم
- **Index Maintenance**: نگهداری ایندکس‌ها
- **Statistics Update**: به‌روزرسانی آمار
- **Vacuum Operations**: عملیات پاکسازی

---

## 🔧 Migration Strategy

### Phase 1: Core Tables
1. User management tables
2. Service management tables
3. Basic order tables

### Phase 2: Extended Features
1. Support system tables
2. Payment tables
3. Notification tables

### Phase 3: Advanced Features
1. Blog system tables
2. Advanced security tables
3. Analytics tables

---

**تاریخ ایجاد**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**نسخه**: ۱.۰  
**وضعیت**: Production Ready  
**تهیه‌کننده**: تیم توسعه MechCraft Hub
