from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, Role, Permission, UserRole, Scope, Service, ServiceField,
    ContractorService, Workshop, WorkshopService, Cart, CartItem,
    Order, OrderItem, Quote, OrderStatusLog, Payment,
    TicketCategory, Ticket, TicketParticipant, TicketMessage, TicketAttachment,
    MediaFile, Review
)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'phone', 'is_email_verified', 'is_phone_verified', 'is_active')
    list_filter = ('is_email_verified', 'is_phone_verified', 'is_active', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email', 'phone', 'first_name', 'last_name')
    fieldsets = UserAdmin.fieldsets + (
        ('Verification', {'fields': ('is_email_verified', 'is_phone_verified')}),
        ('Profile', {'fields': ('phone', 'profile_image')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Verification', {'fields': ('is_email_verified', 'is_phone_verified')}),
        ('Profile', {'fields': ('phone', 'profile_image')}),
    )


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_name', 'created_at')
    search_fields = ('name', 'display_name')
    list_filter = ('created_at',)


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('name', 'codename', 'description')
    search_fields = ('name', 'codename')
    list_filter = ('codename',)


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'assigned_by', 'is_active', 'assigned_at')
    list_filter = ('role', 'is_active', 'assigned_at')
    search_fields = ('user__username', 'role__name')
    raw_id_fields = ('user', 'role', 'assigned_by')


@admin.register(Scope)
class ScopeAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_name', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'display_name', 'description')
    prepopulated_fields = {'name': ('display_name',)}


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'scope', 'type', 'base_price', 'estimated_delivery_days', 'is_active')
    list_filter = ('scope', 'type', 'is_active', 'created_at')
    search_fields = ('name', 'description', 'scope__name')
    prepopulated_fields = {'name': ('name',)}


@admin.register(ServiceField)
class ServiceFieldAdmin(admin.ModelAdmin):
    list_display = ('name', 'service', 'type', 'is_required', 'order')
    list_filter = ('type', 'is_required', 'service__scope')
    search_fields = ('name', 'field_key', 'service__name')
    ordering = ('service', 'order')


@admin.register(ContractorService)
class ContractorServiceAdmin(admin.ModelAdmin):
    list_display = ('contractor', 'service', 'is_active', 'added_at', 'added_by')
    list_filter = ('is_active', 'added_at', 'service__scope')
    search_fields = ('contractor__username', 'service__name')
    raw_id_fields = ('contractor', 'service', 'added_by')


@admin.register(Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'owner__username', 'address')
    raw_id_fields = ('owner',)


@admin.register(WorkshopService)
class WorkshopServiceAdmin(admin.ModelAdmin):
    list_display = ('workshop', 'service', 'is_active')
    list_filter = ('is_active', 'service__scope')
    search_fields = ('workshop__name', 'service__name')


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('customer__username', 'customer__email')
    raw_id_fields = ('customer',)


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'cart', 'service', 'needs_documentation', 'added_at')
    list_filter = ('needs_documentation', 'added_at', 'service__scope')
    search_fields = ('cart__customer__username', 'service__name')
    raw_id_fields = ('cart', 'service')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer', 'status', 'total_amount', 'created_at')
    list_filter = ('status', 'created_at', 'updated_at')
    search_fields = ('order_number', 'customer__username', 'customer__email')
    raw_id_fields = ('customer',)
    readonly_fields = ('order_number', 'created_at', 'updated_at')


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'service', 'assigned_contractor', 'status', 'price')
    list_filter = ('status', 'service__scope', 'created_at')
    search_fields = ('order__order_number', 'service__name', 'assigned_contractor__username')
    raw_id_fields = ('order', 'service', 'assigned_contractor')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Quote)
class QuoteAdmin(admin.ModelAdmin):
    list_display = ('contractor', 'order_item', 'price', 'delivery_days', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('contractor__username', 'order_item__service__name')
    raw_id_fields = ('contractor', 'order_item')
    readonly_fields = ('created_at',)


@admin.register(OrderStatusLog)
class OrderStatusLogAdmin(admin.ModelAdmin):
    list_display = ('order', 'previous_status', 'new_status', 'changed_by', 'changed_at')
    list_filter = ('changed_at', 'new_status')
    search_fields = ('order__order_number', 'changed_by__username')
    raw_id_fields = ('order', 'changed_by')
    readonly_fields = ('changed_at',)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('payment_id', 'order', 'amount', 'method', 'status', 'created_at')
    list_filter = ('status', 'method', 'created_at')
    search_fields = ('payment_id', 'order__order_number')
    raw_id_fields = ('order',)
    readonly_fields = ('created_at', 'paid_at')


@admin.register(TicketCategory)
class TicketCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_name', 'requires_order', 'description')
    list_filter = ('requires_order',)
    search_fields = ('name', 'display_name')


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'category', 'subject', 'creator', 'status', 'priority', 'created_at')
    list_filter = ('category', 'status', 'priority', 'created_at')
    search_fields = ('subject', 'creator__username', 'order__order_number')
    raw_id_fields = ('creator', 'order')
    readonly_fields = ('created_at', 'last_activity_at')


@admin.register(TicketParticipant)
class TicketParticipantAdmin(admin.ModelAdmin):
    list_display = ('ticket', 'user', 'role', 'joined_at')
    list_filter = ('role', 'joined_at')
    search_fields = ('ticket__subject', 'user__username')
    raw_id_fields = ('ticket', 'user')


@admin.register(TicketMessage)
class TicketMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'ticket', 'sender', 'is_internal', 'created_at')
    list_filter = ('is_internal', 'created_at')
    search_fields = ('ticket__subject', 'sender__username', 'content')
    raw_id_fields = ('ticket', 'sender')
    readonly_fields = ('created_at',)


@admin.register(TicketAttachment)
class TicketAttachmentAdmin(admin.ModelAdmin):
    list_display = ('filename', 'message', 'file_type', 'file_size', 'uploaded_at')
    list_filter = ('file_type', 'uploaded_at')
    search_fields = ('filename', 'message__ticket__subject')
    raw_id_fields = ('message',)
    readonly_fields = ('uploaded_at',)


@admin.register(MediaFile)
class MediaFileAdmin(admin.ModelAdmin):
    list_display = ('original_name', 'context', 'context_id', 'uploaded_by', 'file_size', 'uploaded_at')
    list_filter = ('context', 'uploaded_at')
    search_fields = ('original_name', 'uploaded_by__username')
    raw_id_fields = ('uploaded_by',)
    readonly_fields = ('uploaded_at',)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('customer', 'contractor', 'rating', 'is_approved', 'created_at')
    list_filter = ('rating', 'is_approved', 'created_at')
    search_fields = ('customer__username', 'contractor__username', 'comment')
    raw_id_fields = ('customer', 'contractor', 'order_item', 'approved_by')
    readonly_fields = ('created_at', 'approved_at')
