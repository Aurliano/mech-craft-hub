# Sequence Diagrams - MechCraft Hub

## 🔄 نمودارهای توالی سیستم

این سند شامل نمودارهای توالی اصلی سیستم MechCraft Hub است.

---

## 📋 فهرست نمودارهای توالی

1. [احراز هویت کاربر](#احراز-هویت-کاربر)
2. [ثبت سفارش](#ثبت-سفارش)
3. [ارسال پیشنهاد](#ارسال-پیشنهاد)
4. [پردازش پرداخت](#پردازش-پرداخت)
5. [سیستم تیکتینگ](#سیستم-تیکتینگ)
6. [آپلود فایل](#آپلود-فایل)

---

## 🔐 احراز هویت کاربر

### نمودار توالی Login
```
User → Frontend → Backend → Database → External Service
 │        │         │         │           │
 │        │         │         │           │
 │─── Login Request ──────────────────────→│
 │        │         │         │           │
 │        │─── POST /api/auth/login ────────→│
 │        │         │         │           │
 │        │         │─── Validate Credentials ──→│
 │        │         │         │           │
 │        │         │←── User Data ────────│
 │        │         │         │           │
 │        │         │─── Generate JWT ─────→│
 │        │         │         │           │
 │        │←── JWT Token ──────────────────│
 │        │         │         │           │
 │←── Login Success ────────────────────────│
 │        │         │         │           │
 │─── Store Token ─────────────────────────→│
```

### نمودار توالی Registration
```
User → Frontend → Backend → Database → Email Service → SMS Service
 │        │         │         │           │             │
 │─── Registration Request ──────────────────────────────→│
 │        │         │         │           │             │
 │        │─── POST /api/auth/register ──────────────────→│
 │        │         │         │           │             │
 │        │         │─── Validate Data ──────────────────→│
 │        │         │         │           │             │
 │        │         │─── Create User ────────────────────→│
 │        │         │         │           │             │
 │        │         │─── Send Email Verification ────────→│
 │        │         │         │           │             │
 │        │         │─── Send SMS Verification ──────────→│
 │        │         │         │           │             │
 │        │←── Registration Success ──────────────────────│
 │        │         │         │           │             │
 │←── Verification Required ─────────────────────────────│
```

---

## 🛒 ثبت سفارش

### نمودار توالی Order Creation
```
Customer → Frontend → Backend → Database → Notification Service
 │           │         │         │           │
 │─── Create Order ──────────────────────────────────────→│
 │           │         │         │           │
 │           │─── POST /api/orders/ ─────────────────────→│
 │           │         │         │           │
 │           │         │─── Validate Order Data ──────────→│
 │           │         │         │           │
 │           │         │─── Create Order ─────────────────→│
 │           │         │         │           │
 │           │         │─── Create Order Items ────────────→│
 │           │         │         │           │
 │           │         │─── Calculate Total ──────────────→│
 │           │         │         │           │
 │           │         │─── Send Notifications ───────────→│
 │           │         │         │           │
 │           │←── Order Created ───────────────────────────│
 │           │         │         │           │
 │←── Order Confirmation ──────────────────────────────────│
```

### نمودار توالی Order Status Update
```
System → Backend → Database → Notification Service → Customer
 │         │         │           │                    │
 │─── Status Change ──────────────────────────────────→│
 │         │         │           │                    │
 │         │─── Update Order Status ──────────────────→│
 │         │         │           │                    │
 │         │─── Log Status Change ─────────────────────→│
 │         │         │           │                    │
 │         │─── Send Notification ─────────────────────→│
 │         │         │           │                    │
 │         │         │           │─── Send Email ──────→│
 │         │         │           │                    │
 │         │         │           │─── Send SMS ─────────→│
 │         │         │           │                    │
 │         │         │           │─── Push Notification ─→│
 │         │         │           │                    │
 │←── Status Updated ───────────────────────────────────│
```

---

## 💰 ارسال پیشنهاد

### نمودار توالی Quote Submission
```
Contractor → Frontend → Backend → Database → Notification Service → Customer
 │            │         │         │           │                    │
 │─── Submit Quote ────────────────────────────────────────────────→│
 │            │         │         │           │                    │
 │            │─── POST /api/quotes/ ──────────────────────────────→│
 │            │         │         │           │                    │
 │            │         │─── Validate Quote Data ─────────────────→│
 │            │         │         │           │                    │
 │            │         │─── Check Order Status ──────────────────→│
 │            │         │         │           │                    │
 │            │         │─── Create Quote ─────────────────────────→│
 │            │         │         │           │                    │
 │            │         │─── Update Order Item ────────────────────→│
 │            │         │         │           │                    │
 │            │         │─── Send Notification ────────────────────→│
 │            │         │         │           │                    │
 │            │         │         │           │─── Notify Customer ─→│
 │            │         │         │           │                    │
 │            │←── Quote Submitted ────────────────────────────────│
 │            │         │         │           │                    │
 │←── Quote Confirmation ──────────────────────────────────────────│
```

### نمودار توالی Quote Acceptance
```
Customer → Frontend → Backend → Database → Notification Service → Contractor
 │           │         │         │           │                    │
 │─── Accept Quote ───────────────────────────────────────────────→│
 │           │         │         │           │                    │
 │           │─── POST /api/quotes/{id}/accept ───────────────────→│
 │           │         │         │           │                    │
 │           │         │─── Validate Quote ────────────────────────→│
 │           │         │         │           │                    │
 │           │         │─── Update Quote Status ───────────────────→│
 │           │         │         │           │                    │
 │           │         │─── Update Order Item ─────────────────────→│
 │           │         │         │           │                    │
 │           │         │─── Assign Contractor ──────────────────────→│
 │           │         │         │           │                    │
 │           │         │─── Send Notification ──────────────────────→│
 │           │         │         │           │                    │
 │           │         │         │           │─── Notify Contractor ─→│
 │           │         │         │           │                    │
 │           │←── Quote Accepted ────────────────────────────────│
 │           │         │         │           │                    │
 │←── Acceptance Confirmation ────────────────────────────────────│
```

---

## 💳 پردازش پرداخت

### نمودار توالی Payment Processing
```
Customer → Frontend → Backend → Payment Gateway → Database → Notification Service
 │           │         │           │               │           │
 │─── Initiate Payment ──────────────────────────────────────────→│
 │           │         │           │               │           │
 │           │─── POST /api/payments/ ──────────────────────────→│
 │           │         │           │               │           │
 │           │         │─── Validate Payment Data ───────────────→│
 │           │         │           │               │           │
 │           │         │─── Create Payment Record ───────────────→│
 │           │         │           │               │           │
 │           │         │─── Process Payment ─────────────────────→│
 │           │         │           │               │           │
 │           │         │           │─── Gateway Processing ──────→│
 │           │         │           │               │           │
 │           │         │           │←── Payment Result ───────────│
 │           │         │           │               │           │
 │           │         │─── Update Payment Status ────────────────→│
 │           │         │           │               │           │
 │           │         │─── Update Order Status ──────────────────→│
 │           │         │           │               │           │
 │           │         │─── Send Notification ────────────────────→│
 │           │         │           │               │           │
 │           │←── Payment Result ────────────────────────────────│
 │           │         │           │               │           │
 │←── Payment Confirmation ──────────────────────────────────────│
```

---

## 🎫 سیستم تیکتینگ

### نمودار توالی Ticket Creation
```
User → Frontend → Backend → Database → Notification Service → Support Team
 │        │         │         │           │                    │
 │─── Create Ticket ────────────────────────────────────────────→│
 │        │         │         │           │                    │
 │        │─── POST /api/tickets/ ──────────────────────────────→│
 │        │         │         │           │                    │
 │        │         │─── Validate Ticket Data ─────────────────→│
 │        │         │         │           │                    │
 │        │         │─── Create Ticket ─────────────────────────→│
 │        │         │         │           │                    │
 │        │         │─── Add Participant ────────────────────────→│
 │        │         │         │           │                    │
 │        │         │─── Send Notification ──────────────────────→│
 │        │         │         │           │                    │
 │        │         │         │           │─── Notify Support ────→│
 │        │         │         │           │                    │
 │        │←── Ticket Created ───────────────────────────────────│
 │        │         │         │           │                    │
 │←── Ticket Confirmation ──────────────────────────────────────│
```

### نمودار توالی Ticket Response
```
Support → Frontend → Backend → Database → Notification Service → User
 │          │         │         │           │                    │
 │─── Respond to Ticket ────────────────────────────────────────→│
 │          │         │         │           │                    │
 │          │─── POST /api/tickets/{id}/messages ────────────────→│
 │          │         │         │           │                    │
 │          │         │─── Validate Message ─────────────────────→│
 │          │         │         │           │                    │
 │          │         │─── Create Message ────────────────────────→│
 │          │         │         │           │                    │
 │          │         │─── Update Ticket Status ─────────────────→│
 │          │         │         │           │                    │
 │          │         │─── Send Notification ────────────────────→│
 │          │         │         │           │                    │
 │          │         │         │           │─── Notify User ─────→│
 │          │         │         │           │                    │
 │          │←── Response Sent ─────────────────────────────────│
 │          │         │         │           │                    │
 │←── Response Confirmation ────────────────────────────────────│
```

---

## 📁 آپلود فایل

### نمودار توالی File Upload
```
User → Frontend → Backend → File Storage → ClamAV → Database → Notification Service
 │        │         │           │           │        │           │
 │─── Upload File ──────────────────────────────────────────────→│
 │        │         │           │           │        │           │
 │        │─── POST /api/upload/ ────────────────────────────────→│
 │        │         │           │           │        │           │
 │        │         │─── Validate File ──────────────────────────→│
 │        │         │           │           │        │           │
 │        │         │─── Scan for Viruses ────────────────────────→│
 │        │         │           │           │        │           │
 │        │         │           │           │─── Scan Result ─────→│
 │        │         │           │           │        │           │
 │        │         │─── Store File ──────────────────────────────→│
 │        │         │           │           │        │           │
 │        │         │─── Create File Record ──────────────────────→│
 │        │         │           │           │        │           │
 │        │         │─── Send Notification ───────────────────────→│
 │        │         │           │           │        │           │
 │        │←── Upload Success ───────────────────────────────────│
 │        │         │           │           │        │           │
 │←── File Uploaded ────────────────────────────────────────────│
```

---

## 🔄 نمودارهای توالی پیشرفته

### نمودار توالی Order Matching
```
System → Backend → Database → Algorithm → Notification Service → Contractors
 │         │         │          │           │                    │
 │─── New Order ────────────────────────────────────────────────→│
 │         │         │          │           │                    │
 │         │─── Analyze Order Requirements ──────────────────────→│
 │         │         │          │           │                    │
 │         │─── Find Matching Contractors ───────────────────────→│
 │         │         │          │           │                    │
 │         │         │          │─── Matching Algorithm ────────→│
 │         │         │          │           │                    │
 │         │         │          │←── Matching Results ───────────│
 │         │         │          │           │                    │
 │         │─── Send Quote Requests ─────────────────────────────→│
 │         │         │          │           │                    │
 │         │         │          │           │─── Notify Contractors ─→│
 │         │         │          │           │                    │
 │←── Matching Complete ─────────────────────────────────────────│
```

### نمودار توالی Review System
```
Customer → Frontend → Backend → Database → Notification Service → Contractor
 │           │         │         │           │                    │
 │─── Submit Review ──────────────────────────────────────────────→│
 │           │         │         │           │                    │
 │           │─── POST /api/reviews/ ─────────────────────────────→│
 │           │         │         │           │                    │
 │           │         │─── Validate Review Data ─────────────────→│
 │           │         │         │           │                    │
 │           │         │─── Create Review ────────────────────────→│
 │           │         │         │           │                    │
 │           │         │─── Update Contractor Rating ─────────────→│
 │           │         │         │           │                    │
 │           │         │─── Send Notification ────────────────────→│
 │           │         │         │           │                    │
 │           │         │         │           │─── Notify Contractor ─→│
 │           │         │         │           │                    │
 │           │←── Review Submitted ──────────────────────────────│
 │           │         │         │           │                    │
 │←── Review Confirmation ────────────────────────────────────────│
```

---

## 📊 نمودارهای توالی مانیتورینگ

### نمودار توالی Health Check
```
Monitoring → Backend → Database → Cache → External Services → Alert System
 │            │         │         │        │                  │
 │─── Health Check Request ────────────────────────────────────→│
 │            │         │         │        │                  │
 │            │─── Check Application Health ────────────────────→│
 │            │         │         │        │                  │
 │            │─── Check Database Connection ───────────────────→│
 │            │         │         │        │                  │
 │            │─── Check Cache Status ─────────────────────────→│
 │            │         │         │        │                  │
 │            │─── Check External Services ─────────────────────→│
 │            │         │         │        │                  │
 │            │←── Health Status ───────────────────────────────│
 │            │         │         │        │                  │
 │─── Health Report ────────────────────────────────────────────→│
 │            │         │         │        │                  │
 │            │         │         │        │─── Send Alerts ────→│
 │            │         │         │        │                  │
 │←── Health Check Complete ────────────────────────────────────│
```

---

## 🔧 نمودارهای توالی مدیریت

### نمودار توالی Admin Operations
```
Admin → Frontend → Backend → Database → Logging System → Notification Service
 │        │         │         │           │               │
 │─── Admin Action ──────────────────────────────────────────────→│
 │        │         │         │           │               │
 │        │─── POST /api/admin/action ────────────────────────────→│
 │        │         │         │           │               │
 │        │         │─── Validate Admin Permission ──────────────→│
 │        │         │         │           │               │
 │        │         │─── Execute Action ─────────────────────────→│
 │        │         │         │           │               │
 │        │         │─── Log Admin Action ────────────────────────→│
 │        │         │         │           │               │
 │        │         │─── Send Notification ───────────────────────→│
 │        │         │         │           │               │
 │        │         │         │           │─── Notify Users ──────→│
 │        │         │         │           │               │
 │        │←── Action Completed ──────────────────────────────────│
 │        │         │         │           │               │
 │←── Admin Confirmation ─────────────────────────────────────────│
```

---

## 📋 خلاصه نمودارهای توالی

### Key Interaction Patterns
1. **Authentication Flow**: Login, Registration, Token Management
2. **Order Management**: Creation, Status Updates, Notifications
3. **Quote System**: Submission, Acceptance, Matching
4. **Payment Processing**: Gateway Integration, Status Updates
5. **Support System**: Ticket Creation, Response, Escalation
6. **File Management**: Upload, Validation, Storage
7. **Review System**: Submission, Approval, Notifications
8. **Monitoring**: Health Checks, Alerts, Reporting

### Performance Considerations
- **Async Processing**: برای عملیات زمان‌بر
- **Caching**: برای کاهش بار دیتابیس
- **Batch Operations**: برای عملیات دسته‌ای
- **Rate Limiting**: برای جلوگیری از سوء استفاده

---

**تاریخ ایجاد**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**نسخه**: ۱.۰  
**وضعیت**: Production Ready  
**تهیه‌کننده**: تیم توسعه MechCraft Hub
