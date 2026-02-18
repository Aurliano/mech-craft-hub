from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.admin.utils import get_deleted_objects
from django.db import connection
import json
import os
from .models import (
    User, Role, Permission, UserRole, Scope, Service, ServiceField, ServiceTab, 
    ContractorService, Workshop, WorkshopService, Cart, CartItem,
    Order, OrderItem, Quote, OrderStatusLog, Payment,
    TicketCategory, Ticket, TicketParticipant, TicketMessage, TicketAttachment,
    MediaFile, Review, PasswordResetToken, PhoneVerificationCode, Notification,
    TurnstileAttempt, OrderProposal,
    Conversation, DirectMessage
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
    
    def get_deleted_objects(self, objs, request):
        # #region agent log
        try:
            log_path = r'c:\mech-craft-hub-main\.cursor\debug.log'
            with open(log_path, 'a', encoding='utf-8') as f:
                log_entry = {
                    'id': f'log_{int(__import__("time").time() * 1000)}',
                    'timestamp': int(__import__("time").time() * 1000),
                    'location': 'admin.py:get_deleted_objects:entry',
                    'message': 'User deletion started',
                    'data': {'user_count': len(objs), 'user_ids': [str(u.id) for u in objs]},
                    'sessionId': 'debug-session',
                    'runId': 'run1',
                    'hypothesisId': 'A'
                }
                f.write(json.dumps(log_entry, ensure_ascii=False) + '\n')
        except Exception:
            pass
        # #endregion
        
        # #region agent log
        try:
            # Check database schema for order_proposals table
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'order_proposals'
                    ORDER BY ordinal_position
                """)
                columns = {row[0]: row[1] for row in cursor.fetchall()}
                
                # Check migration status
                cursor.execute("""
                    SELECT app, name, applied 
                    FROM django_migrations 
                    WHERE app = 'api' AND name LIKE '%orderproposal%'
                    ORDER BY applied DESC
                """)
                migrations = [{'app': row[0], 'name': row[1], 'applied': str(row[2])} for row in cursor.fetchall()]
                
                log_path = r'c:\mech-craft-hub-main\.cursor\debug.log'
                with open(log_path, 'a', encoding='utf-8') as f:
                    log_entry = {
                        'id': f'log_{int(__import__("time").time() * 1000)}',
                        'timestamp': int(__import__("time").time() * 1000),
                        'location': 'admin.py:get_deleted_objects:schema_check',
                        'message': 'Database schema for order_proposals',
                        'data': {
                            'columns': list(columns.keys()), 
                            'has_documentation_price': 'documentation_price' in columns,
                            'migrations': migrations
                        },
                        'sessionId': 'debug-session',
                        'runId': 'run1',
                        'hypothesisId': 'A'
                    }
                    f.write(json.dumps(log_entry, ensure_ascii=False) + '\n')
        except Exception as e:
            try:
                log_path = r'c:\mech-craft-hub-main\.cursor\debug.log'
                with open(log_path, 'a', encoding='utf-8') as f:
                    log_entry = {
                        'id': f'log_{int(__import__("time").time() * 1000)}',
                        'timestamp': int(__import__("time").time() * 1000),
                        'location': 'admin.py:get_deleted_objects:schema_check_error',
                        'message': 'Error checking schema',
                        'data': {'error': str(e)},
                        'sessionId': 'debug-session',
                        'runId': 'run1',
                        'hypothesisId': 'A'
                    }
                    f.write(json.dumps(log_entry, ensure_ascii=False) + '\n')
            except Exception:
                pass
        # #endregion
        
        # #region agent log
        try:
            # Check OrderProposal model fields
            from django.db import models
            order_proposal_fields = [f.name for f in OrderProposal._meta.get_fields() if hasattr(f, 'name')]
            log_path = r'c:\mech-craft-hub-main\.cursor\debug.log'
            with open(log_path, 'a', encoding='utf-8') as f:
                log_entry = {
                    'id': f'log_{int(__import__("time").time() * 1000)}',
                    'timestamp': int(__import__("time").time() * 1000),
                    'location': 'admin.py:get_deleted_objects:model_fields',
                    'message': 'OrderProposal model fields',
                    'data': {'model_fields': order_proposal_fields, 'has_documentation_price': 'documentation_price' in order_proposal_fields},
                    'sessionId': 'debug-session',
                    'runId': 'run1',
                    'hypothesisId': 'B'
                }
                f.write(json.dumps(log_entry, ensure_ascii=False) + '\n')
        except Exception as e:
            try:
                log_path = r'c:\mech-craft-hub-main\.cursor\debug.log'
                with open(log_path, 'a', encoding='utf-8') as f:
                    log_entry = {
                        'id': f'log_{int(__import__("time").time() * 1000)}',
                        'timestamp': int(__import__("time").time() * 1000),
                        'location': 'admin.py:get_deleted_objects:model_fields_error',
                        'message': 'Error checking model fields',
                        'data': {'error': str(e)},
                        'sessionId': 'debug-session',
                        'runId': 'run1',
                        'hypothesisId': 'B'
                    }
                    f.write(json.dumps(log_entry, ensure_ascii=False) + '\n')
            except Exception:
                pass
        # #endregion
        
        try:
            # #region agent log
            log_path = r'c:\mech-craft-hub-main\.cursor\debug.log'
            with open(log_path, 'a', encoding='utf-8') as f:
                log_entry = {
                    'id': f'log_{int(__import__("time").time() * 1000)}',
                    'timestamp': int(__import__("time").time() * 1000),
                    'location': 'admin.py:get_deleted_objects:before_collect',
                    'message': 'Before calling get_deleted_objects',
                    'data': {},
                    'sessionId': 'debug-session',
                    'runId': 'run1',
                    'hypothesisId': 'C'
                }
                f.write(json.dumps(log_entry, ensure_ascii=False) + '\n')
            # #endregion
            return get_deleted_objects(objs, request, self.admin_site)
        except Exception as e:
            # #region agent log
            try:
                log_path = r'c:\mech-craft-hub-main\.cursor\debug.log'
                with open(log_path, 'a', encoding='utf-8') as f:
                    log_entry = {
                        'id': f'log_{int(__import__("time").time() * 1000)}',
                        'timestamp': int(__import__("time").time() * 1000),
                        'location': 'admin.py:get_deleted_objects:error',
                        'message': 'Error in get_deleted_objects',
                        'data': {'error_type': type(e).__name__, 'error_message': str(e)},
                        'sessionId': 'debug-session',
                        'runId': 'run1',
                        'hypothesisId': 'C'
                    }
                    f.write(json.dumps(log_entry, ensure_ascii=False) + '\n')
            except Exception:
                pass
            # #endregion
            raise


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


@admin.register(ServiceTab)
class ServiceTabAdmin(admin.ModelAdmin):
    list_display = ('display_name', 'service', 'name', 'order', 'is_active')
    list_filter = ('service', 'is_active', 'created_at')
    search_fields = ('display_name', 'name', 'service__name')
    ordering = ('service', 'order')
    raw_id_fields = ('service',)


@admin.register(ServiceField)
class ServiceFieldAdmin(admin.ModelAdmin):
    list_display = ('name', 'service', 'type', 'is_required', 'order')
    list_filter = ('type', 'is_required', 'service__scope')
    search_fields = ('name', 'field_key', 'service__name')
    ordering = ('service', 'order')


@admin.register(ContractorService)
class ContractorServiceAdmin(admin.ModelAdmin):
    list_display = ('contractor', 'service', 'is_active', 'added_at', 'added_by')
    list_filter = ('is_active', 'added_at')
    search_fields = ('contractor__username', 'service__name')
    raw_id_fields = ('contractor', 'service', 'added_by')


@admin.register(Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'owner__username', 'address')
    raw_id_fields = ('owner',)
    actions = ['transfer_workshops_to_contractor']
    
    @admin.action(description='انتقال کارگاه‌های انتخاب شده به پیمانکار')
    def transfer_workshops_to_contractor(self, request, queryset):
        """Admin action to transfer selected workshops to a contractor"""
        from django.contrib import messages
        from django.shortcuts import render, redirect
        
        if 'apply' in request.POST:
            contractor_id = request.POST.get('contractor')
            if not contractor_id:
                messages.error(request, 'لطفاً پیمانکار را انتخاب کنید.')
                return redirect(request.get_full_path())
            
            try:
                from .models import User, Role
                contractor = User.objects.get(id=contractor_id)
                
                # بررسی اینکه کاربر واقعاً پیمانکار است
                is_contractor = contractor.user_roles.filter(role__name='contractor', is_active=True).exists()
                if not is_contractor:
                    messages.error(request, f'کاربر {contractor.username} پیمانکار نیست.')
                    return redirect(request.get_full_path())
                
                # انتقال کارگاه‌ها
                transferred_count = 0
                for workshop in queryset:
                    old_owner = workshop.owner
                    workshop.owner = contractor
                    workshop.save()
                    transferred_count += 1
                    self.log_change(request, workshop, f'Owner changed from {old_owner.username} to {contractor.username}')
                
                messages.success(request, f'{transferred_count} کارگاه با موفقیت به {contractor.username} ({contractor.get_full_name() or contractor.email}) منتقل شد.')
                return redirect('admin:api_workshop_changelist')
            except User.DoesNotExist:
                messages.error(request, 'پیمانکار انتخاب شده یافت نشد.')
                return redirect(request.get_full_path())
            except Exception as e:
                messages.error(request, f'خطا در انتقال: {str(e)}')
                return redirect(request.get_full_path())
        
        # نمایش فرم انتخاب پیمانکار
        from .models import User, Role
        contractors = User.objects.filter(
            user_roles__role__name='contractor',
            user_roles__is_active=True
        ).distinct().order_by('username')
        
        context = {
            'title': 'انتقال کارگاه‌ها به پیمانکار',
            'workshops': queryset,
            'contractors': contractors,
            'opts': self.model._meta,
            'action_checkbox_name': admin.helpers.ACTION_CHECKBOX_NAME,
        }
        
        return render(request, 'admin/transfer_workshops.html', context)
    
    def get_urls(self):
        """Add custom admin view for transferring admin's workshops"""
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path('transfer-my-workshops/', self.admin_site.admin_view(self.transfer_my_workshops_view), 
                 name='api_workshop_transfer_my_workshops'),
        ]
        return custom_urls + urls
    
    def transfer_my_workshops_view(self, request):
        """Custom admin view to transfer workshops owned by current admin user"""
        from django.contrib import messages
        from django.shortcuts import render, redirect
        from .models import User, Workshop
        
        if request.method == 'POST':
            # Process transfers
            transferred_count = 0
            errors = []
            
            for key, value in request.POST.items():
                if key.startswith('workshop_') and value:
                    workshop_id = key.replace('workshop_', '')
                    contractor_id = value
                    
                    try:
                        workshop = Workshop.objects.get(id=workshop_id, owner=request.user)
                        contractor = User.objects.get(id=contractor_id)
                        
                        # بررسی اینکه کاربر واقعاً پیمانکار است
                        is_contractor = contractor.user_roles.filter(role__name='contractor', is_active=True).exists()
                        if not is_contractor:
                            errors.append(f'کاربر {contractor.username} پیمانکار نیست.')
                            continue
                        
                        old_owner = workshop.owner
                        workshop.owner = contractor
                        workshop.save()
                        transferred_count += 1
                        self.log_change(request, workshop, f'Owner changed from {old_owner.username} to {contractor.username}')
                    except Workshop.DoesNotExist:
                        errors.append(f'کارگاه با ID {workshop_id} یافت نشد یا متعلق به شما نیست.')
                    except User.DoesNotExist:
                        errors.append(f'پیمانکار با ID {contractor_id} یافت نشد.')
                    except Exception as e:
                        errors.append(f'خطا در انتقال کارگاه {workshop_id}: {str(e)}')
            
            if transferred_count > 0:
                messages.success(request, f'{transferred_count} کارگاه با موفقیت منتقل شد.')
            if errors:
                for error in errors:
                    messages.error(request, error)
            
            return redirect('admin:api_workshop_transfer_my_workshops')
        
        # نمایش لیست کارگاه‌های متعلق به ادمین فعلی
        my_workshops = Workshop.objects.filter(owner=request.user).order_by('-created_at')
        contractors = User.objects.filter(
            user_roles__role__name='contractor',
            user_roles__is_active=True
        ).distinct().order_by('username')
        
        context = {
            **self.admin_site.each_context(request),
            'title': 'انتقال کارگاه‌های من به پیمانکاران',
            'workshops': my_workshops,
            'contractors': contractors,
            'opts': self.model._meta,
            'has_view_permission': self.has_view_permission(request, None),
        }
        
        return render(request, 'admin/transfer_my_workshops.html', context)
    
    def changelist_view(self, request, extra_context=None):
        """Add custom link to transfer admin's workshops"""
        extra_context = extra_context or {}
        # Count workshops owned by current admin
        my_workshops_count = Workshop.objects.filter(owner=request.user).count()
        extra_context['my_workshops_count'] = my_workshops_count
        extra_context['transfer_my_workshops_url'] = 'admin:api_workshop_transfer_my_workshops'
        return super().changelist_view(request, extra_context)


@admin.register(WorkshopService)
class WorkshopServiceAdmin(admin.ModelAdmin):
    list_display = ('workshop', 'service', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('workshop__name', 'service__name')
    raw_id_fields = ('workshop', 'service')


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
    list_display = ('id', 'order', 'amount', 'payment_type', 'status', 'created_at')
    list_filter = ('status', 'payment_type', 'created_at')
    search_fields = ('id', 'order__order_number')
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


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'token', 'is_used', 'created_at', 'expires_at')
    list_filter = ('is_used', 'created_at', 'expires_at')
    search_fields = ('user__username', 'user__email', 'token')
    raw_id_fields = ('user',)
    readonly_fields = ('created_at', 'expires_at')


@admin.register(PhoneVerificationCode)
class PhoneVerificationCodeAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'code', 'is_used', 'created_at', 'expires_at')
    list_filter = ('is_used', 'created_at', 'expires_at')
    search_fields = ('user__username', 'phone', 'code')
    raw_id_fields = ('user',)
    readonly_fields = ('created_at', 'expires_at')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'title', 'is_read', 'created_at')
    list_filter = ('type', 'is_read', 'created_at')
    search_fields = ('user__username', 'title', 'message')
    raw_id_fields = ('user', 'related_order', 'related_quote')
    readonly_fields = ('created_at',)


@admin.register(TurnstileAttempt)
class TurnstileAttemptAdmin(admin.ModelAdmin):
    list_display = ('id', 'ip', 'user', 'endpoint', 'success', 'created_at', 'token_hash_short')
    list_filter = ('success', 'endpoint', 'created_at', 'user')
    search_fields = ('ip', 'user__username', 'endpoint', 'token_hash', 'error_message')
    raw_id_fields = ('user',)
    readonly_fields = ('created_at', 'token_hash', 'response_raw')
    ordering = ('-created_at',)
    
    def token_hash_short(self, obj):
        """Display first 8 characters of token hash for admin interface"""
        return f"{obj.token_hash[:8]}..." if obj.token_hash else "N/A"
    token_hash_short.short_description = "Token Hash"
    
    def get_queryset(self, request):
        """Optimize queryset for admin interface"""
        return super().get_queryset(request).select_related('user')
    
    def has_add_permission(self, request):
        """Prevent manual creation of Turnstile attempts"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Prevent editing of Turnstile attempts"""
        return False


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at', 'updated_at')
    list_filter = ('created_at',)
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(DirectMessage)
class DirectMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'sender', 'content_short', 'created_at', 'is_read')
    list_filter = ('is_read', 'created_at')
    search_fields = ('content', 'sender__username')
    raw_id_fields = ('conversation', 'sender')
    readonly_fields = ('id', 'created_at')

    def content_short(self, obj):
        return (obj.content[:50] + '...') if len(obj.content) > 50 else obj.content
    content_short.short_description = 'متن'
