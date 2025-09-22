from rest_framework import serializers
from .models import (
    User, Role, UserRole, Scope, Service, ServiceField, ServiceTab,
    Cart, CartItem, Order, OrderItem, Quote, Workshop,
    Ticket, TicketMessage, TicketAttachment, TicketFileType, TicketCategory, TicketParticipant,
    ContentFilterLog, Review, PasswordResetToken, PhoneVerificationCode, Notification,
    TurnstileAttempt
)


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'display_name', 'description']

class UserRoleSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    
    class Meta:
        model = UserRole
        fields = ['id', 'role', 'assigned_at', 'is_active']

class UserSerializer(serializers.ModelSerializer):
    roles = UserRoleSerializer(many=True, read_only=True, source='user_roles')
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'is_email_verified', 'is_phone_verified', 'roles', 'first_name', 'last_name']
        read_only_fields = ['id', 'is_email_verified', 'is_phone_verified']

class WorkshopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workshop
        fields = [
            'id', 'name', 'address', 'description', 'owner', 'is_active', 'created_at',
            'province', 'city', 'postal_address', 'manager_name', 'manager_phone',
            'capabilities', 'machines'
        ]
        read_only_fields = ['id', 'owner', 'created_at']



class ServiceTabSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceTab
        fields = ['id', 'name', 'display_name', 'description', 'order', 'is_active']

class ServiceFieldSerializer(serializers.ModelSerializer):
    tab = ServiceTabSerializer(read_only=True)
    
    class Meta:
        model = ServiceField
        fields = ['id', 'tab', 'name', 'field_key', 'type', 'options', 'is_required', 'order', 'help_text', 'validation_rules']

class ServiceSerializer(serializers.ModelSerializer):
    tabs = ServiceTabSerializer(many=True, read_only=True)
    fields = ServiceFieldSerializer(many=True, read_only=True)

    class Meta:
        model = Service
        fields = ['id', 'scope', 'name', 'type', 'description', 'base_price', 'estimated_delivery_days', 'supports_documentation', 'has_tabs', 'is_active', 'tabs', 'fields']



class ScopeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scope
        fields = ['id', 'name', 'display_name', 'description', 'icon', 'is_active']


class CartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ['id', 'cart', 'service', 'field_values', 'needs_documentation', 'added_at']
        read_only_fields = ['id', 'added_at']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'customer', 'created_at', 'updated_at', 'items']
        read_only_fields = ['id', 'created_at', 'updated_at']


class OrderItemSerializer(serializers.ModelSerializer):
    service = serializers.SerializerMethodField()
    service_fields = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'service', 'service_fields', 'assigned_contractor', 'status', 'price', 'estimated_delivery', 'actual_delivery', 'field_values', 'needs_documentation', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_service(self, obj):
        if obj.service:
            return {
                'id': str(obj.service.id),
                'name': obj.service.name,
                'type': obj.service.type,
                'description': obj.service.description,
                'scope': obj.service.scope.name if obj.service.scope else None
            }
        return None
    
    def get_service_fields(self, obj):
        if obj.service:
            from .models import ServiceField
            fields = ServiceField.objects.filter(service=obj.service).order_by('order')
            return ServiceFieldSerializer(fields, many=True).data
        return []


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'customer', 'order_number', 'status', 'total_amount', 'notes', 'documentation_options', 'created_at', 'updated_at', 'items']
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']


class QuoteSerializer(serializers.ModelSerializer):
    order_item = serializers.SerializerMethodField()
    
    class Meta:
        model = Quote
        fields = ['id', 'order_item', 'contractor', 'price', 'documentation_price', 'delivery_days', 'documentation_days', 'notes', 'status', 'created_at', 'expires_at']
        read_only_fields = ['id', 'created_at']
    
    def get_order_item(self, obj):
        return {
            'id': str(obj.order_item.id),
            'service': {
                'id': str(obj.order_item.service.id) if obj.order_item.service else None,
                'name': obj.order_item.service.name if obj.order_item.service else 'Unknown Service',
            },
            'order': {
                'id': str(obj.order_item.order.id),
                'order_number': obj.order_item.order.order_number,
            }
        }


class TicketFileTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketFileType
        fields = ['id', 'name', 'display_name', 'category', 'extensions', 'mime_types', 'max_size_mb', 'is_active']


class TicketAttachmentSerializer(serializers.ModelSerializer):
    file_type = TicketFileTypeSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()
    file_size_mb = serializers.ReadOnlyField()
    
    class Meta:
        model = TicketAttachment
        fields = [
            'id', 'file_type', 'filename', 'original_filename', 'file_path', 
            'mime_type', 'file_size', 'file_size_mb', 'attachment_type', 
            'is_processed', 'ocr_text', 'uploaded_at', 'file_url'
        ]
        read_only_fields = ['id', 'uploaded_at', 'file_size_mb']
    
    def get_file_url(self, obj):
        from .utils.file_handler import file_upload_handler
        return file_upload_handler.get_file_url(obj.file_path)


class TicketMessageSerializer(serializers.ModelSerializer):
    attachments = TicketAttachmentSerializer(many=True, read_only=True)
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    
    class Meta:
        model = TicketMessage
        fields = [
            'id', 'ticket', 'sender', 'sender_name', 'content', 'is_internal', 
            'created_at', 'attachments'
        ]
        read_only_fields = ['id', 'created_at']


class TicketCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketCategory
        fields = ['id', 'name', 'display_name', 'requires_order', 'description']


class TicketParticipantSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = TicketParticipant
        fields = ['id', 'user', 'user_name', 'role', 'joined_at']
        read_only_fields = ['id', 'joined_at']


class TicketSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)
    participants = TicketParticipantSerializer(many=True, read_only=True)
    creator_name = serializers.CharField(source='creator.username', read_only=True)
    category_name = serializers.CharField(source='category.display_name', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'category', 'category_name', 'subject', 'creator', 'creator_name', 
            'order', 'order_number', 'status', 'priority', 'created_at', 
            'last_activity_at', 'messages', 'participants'
        ]
        read_only_fields = ['id', 'created_at', 'last_activity_at']


class ContentFilterLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.username', read_only=True)
    
    class Meta:
        model = ContentFilterLog
        fields = [
            'id', 'user', 'user_name', 'ticket', 'message', 'violation_type',
            'detected_content', 'original_content', 'action_taken', 'confidence_score',
            'is_false_positive', 'reviewed_by', 'reviewed_by_name', 'reviewed_at',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'order_item', 'customer', 'contractor', 'rating', 'comment', 'is_approved', 'approved_by', 'created_at', 'approved_at']
        read_only_fields = ['id', 'created_at', 'approved_at', 'is_approved', 'approved_by']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    hcaptcha_token = serializers.CharField(write_only=True, required=False, allow_blank=True)
    cf_turnstile_response = serializers.CharField(write_only=True, required=False, allow_blank=True)
    fallback_captcha_challenge_id = serializers.CharField(write_only=True, required=False, allow_blank=True)
    fallback_captcha_answer = serializers.CharField(write_only=True, required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    role = serializers.CharField(required=False, allow_blank=True)
    selected_scope = serializers.CharField(required=False, allow_blank=True)
    selected_services = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone', 'password', 'turnstile_token', 'cf_turnstile_response',
            'first_name', 'last_name', 'role', 'selected_scope', 'selected_services',
            'fallback_captcha_challenge_id', 'fallback_captcha_answer'
        ]
        read_only_fields = ['id']

    def validate_turnstile_token(self, value):
        """Validate Turnstile token"""
        from .utils.turnstile import verify_turnstile_token_sync, TurnstileError
        from django.conf import settings
        
        # If no value provided, skip validation (fallback captcha will be used)
        if not value:
            return value
        
        # Skip validation if no secret is configured (development mode)
        if not getattr(settings, 'TURNSTILE_SECRET', None):
            return value
        
        try:
            # Get client IP from request context
            request = self.context.get('request')
            remote_ip = None
            if request:
                remote_ip = request.META.get('REMOTE_ADDR')
                # Handle X-Forwarded-For header
                x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
                if x_forwarded_for:
                    remote_ip = x_forwarded_for.split(',')[0].strip()
            
            success, response_data = verify_turnstile_token_sync(value, remote_ip)
            
            if not success:
                error_codes = response_data.get('error-codes', [])
                error_message = f"Turnstile verification failed: {', '.join(error_codes)}"
                raise serializers.ValidationError(error_message)
            
            # Store the token for later use in create method
            self._turnstile_response = response_data
            return value
            
        except TurnstileError as e:
            raise serializers.ValidationError(f"Turnstile verification error: {str(e)}")
        except Exception as e:
            raise serializers.ValidationError(f"Turnstile verification failed: {str(e)}")

    def validate_cf_turnstile_response(self, value):
        """Validate Turnstile token"""
        from .utils.turnstile import verify_turnstile_token_sync, TurnstileError
        from django.conf import settings
        
        # If no value provided, skip validation (other captcha methods will be used)
        if not value:
            return value
        
        # Skip validation if no secret is configured (development mode)
        if not getattr(settings, 'TURNSTILE_SECRET_KEY', None):
            return value
        
        try:
            # Get client IP from request context
            request = self.context.get('request')
            remote_ip = None
            if request:
                remote_ip = request.META.get('REMOTE_ADDR')
                # Handle X-Forwarded-For header
                x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
                if x_forwarded_for:
                    remote_ip = x_forwarded_for.split(',')[0].strip()
            
            success, response_data = verify_turnstile_token_sync(value, remote_ip)
            
            if not success:
                error_codes = response_data.get('error-codes', [])
                error_message = f"Turnstile verification failed: {', '.join(error_codes)}"
                raise serializers.ValidationError(error_message)
            
            # Store the token for later use in create method
            self._turnstile_response = response_data
            return value
            
        except TurnstileError as e:
            raise serializers.ValidationError(f"Turnstile verification error: {str(e)}")
        except Exception as e:
            raise serializers.ValidationError(f"Turnstile verification failed: {str(e)}")

    def validate(self, data):
        """Validate captcha - priority: Turnstile > fallback"""
        from .utils.turnstile import verify_fallback_captcha
        
        turnstile_token = data.get('turnstile_token') or data.get('cf_turnstile_response')
        fallback_challenge_id = data.get('fallback_captcha_challenge_id')
        fallback_answer = data.get('fallback_captcha_answer')
        
        # If Turnstile token is provided and valid, we're good
        if turnstile_token:
            return data
        
        # If no Turnstile, validate fallback captcha
        if not fallback_challenge_id or not fallback_answer:
            raise serializers.ValidationError("Captcha verification is required")
        
        if not verify_fallback_captcha(fallback_challenge_id, fallback_answer):
            raise serializers.ValidationError("Invalid captcha answer")
        
        return data

    def create(self, validated_data):
        from .utils.turnstile import log_turnstile_attempt
        import hashlib
        
        # Extract tokens (support both field names)
        turnstile_token = validated_data.pop('turnstile_token', None) or validated_data.pop('cf_turnstile_response', None)
        password = validated_data.pop('password')
        
        # Extract contractor-specific fields
        selected_scope = validated_data.pop('selected_scope', None)
        selected_services = validated_data.pop('selected_services', [])
        role = validated_data.pop('role', 'customer')
        
        # Get request context for logging
        request = self.context.get('request')
        remote_ip = None
        user_agent = None
        if request:
            remote_ip = request.META.get('REMOTE_ADDR')
            user_agent = request.META.get('HTTP_USER_AGENT')
            # Handle X-Forwarded-For header
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                remote_ip = x_forwarded_for.split(',')[0].strip()
        
        # Create user
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        # Set user role if provided
        if role and role != 'customer':
            # You might want to add role assignment logic here
            # For now, we'll just store it in a custom field or handle it differently
            pass
        
        # Create contractor services if this is a contractor registration
        if role == 'contractor' and selected_scope and selected_services:
            from .models import Scope, Service, ContractorService
            
            try:
                scope = Scope.objects.get(id=selected_scope)
                for service_id in selected_services:
                    try:
                        service = Service.objects.get(id=service_id)
                        ContractorService.objects.create(
                            contractor=user,
                            service=service,
                            is_active=True
                        )
                    except Service.DoesNotExist:
                        # Skip invalid service IDs
                        continue
            except Scope.DoesNotExist:
                # Skip if scope doesn't exist
                pass
        
        # Log successful Turnstile attempt
        if turnstile_token:
            log_turnstile_attempt(
                token=turnstile_token,
                remote_ip=remote_ip,
                user=user,
                endpoint='/api/v1/auth/register/',
                success=True,
                response_data=getattr(self, '_turnstile_response', None)
            )
        
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    # Support both field names for compatibility
    turnstile_token = serializers.CharField(required=False, allow_blank=True)
    cf_turnstile_response = serializers.CharField(required=False, allow_blank=True)
    fallback_captcha_challenge_id = serializers.CharField(required=False, allow_blank=True)
    fallback_captcha_answer = serializers.CharField(required=False, allow_blank=True)

    def validate_turnstile_token(self, value):
        """Validate Turnstile token"""
        from .utils.turnstile import verify_turnstile_token_sync, TurnstileError
        from django.conf import settings
        
        # If no value provided, skip validation (fallback captcha will be used)
        if not value:
            return value
        
        # Skip validation if no secret is configured (development mode)
        if not getattr(settings, 'TURNSTILE_SECRET', None):
            return value
        
        try:
            # Get client IP from request context
            request = self.context.get('request')
            remote_ip = None
            if request:
                remote_ip = request.META.get('REMOTE_ADDR')
                # Handle X-Forwarded-For header
                x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
                if x_forwarded_for:
                    remote_ip = x_forwarded_for.split(',')[0].strip()
            
            success, response_data = verify_turnstile_token_sync(value, remote_ip)
            
            if not success:
                error_codes = response_data.get('error-codes', [])
                error_message = f"Turnstile verification failed: {', '.join(error_codes)}"
                raise serializers.ValidationError(error_message)
            
            # Store the token for later use
            self._turnstile_response = response_data
            return value
            
        except TurnstileError as e:
            raise serializers.ValidationError(f"Turnstile verification error: {str(e)}")
        except Exception as e:
            raise serializers.ValidationError(f"Turnstile verification failed: {str(e)}")

    def validate_cf_turnstile_response(self, value):
        """Validate Turnstile token"""
        from .utils.turnstile import verify_turnstile_token_sync, TurnstileError
        from django.conf import settings
        
        # If no value provided, skip validation
        if not value:
            return value
        
        # Skip validation if no secret is configured
        if not getattr(settings, 'TURNSTILE_SECRET_KEY', None):
            return value
        
        try:
            # Get client IP from request context
            request = self.context.get('request')
            remote_ip = None
            if request:
                remote_ip = request.META.get('REMOTE_ADDR')
                x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
                if x_forwarded_for:
                    remote_ip = x_forwarded_for.split(',')[0].strip()
            
            success, response_data = verify_turnstile_token_sync(value, remote_ip)
            
            if not success:
                error_codes = response_data.get('error-codes', [])
                error_message = f"Turnstile verification failed: {', '.join(error_codes)}"
                raise serializers.ValidationError(error_message)
            
            self._turnstile_response = response_data
            return value
            
        except TurnstileError as e:
            raise serializers.ValidationError(f"Turnstile verification error: {str(e)}")
        except Exception as e:
            raise serializers.ValidationError(f"Turnstile verification failed: {str(e)}")

    def validate(self, data):
        """Validate captcha - priority: Turnstile > fallback"""
        from .utils.turnstile import verify_fallback_captcha
        
        turnstile_token = data.get('turnstile_token') or data.get('cf_turnstile_response')
        fallback_challenge_id = data.get('fallback_captcha_challenge_id')
        fallback_answer = data.get('fallback_captcha_answer')
        
        # If Turnstile token is provided and valid, we're good
        if turnstile_token:
            return data
        
        # If no Turnstile, validate fallback captcha
        if not fallback_challenge_id or not fallback_answer:
            raise serializers.ValidationError("Captcha verification is required")
        
        if not verify_fallback_captcha(fallback_challenge_id, fallback_answer):
            raise serializers.ValidationError("Invalid captcha answer")
        
        return data

    def validate(self, attrs):
        from django.contrib.auth import authenticate
        from .utils.turnstile import log_turnstile_attempt
        import hashlib
        
        username = attrs.get('username')
        password = attrs.get('password')
        turnstile_token = attrs.get('turnstile_token') or attrs.get('cf_turnstile_response')
        
        # Get request context for logging
        request = self.context.get('request')
        remote_ip = None
        user_agent = None
        if request:
            remote_ip = request.META.get('REMOTE_ADDR')
            user_agent = request.META.get('HTTP_USER_AGENT')
            # Handle X-Forwarded-For header
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                remote_ip = x_forwarded_for.split(',')[0].strip()
        
        # Authenticate user
        user = authenticate(request=request, username=username, password=password)
        if not user:
            # Log failed Turnstile attempt
            log_turnstile_attempt(
                token=turnstile_token,
                remoteip=remote_ip,
                user_id=None,
                endpoint='/api/v1/auth/login/',
                success=False,
                response_data=getattr(self, '_turnstile_response', None),
                error_message="Authentication failed"
            )
            
            raise serializers.ValidationError("Invalid credentials")
        
        # Log successful Turnstile attempt
        log_turnstile_attempt(
            token=turnstile_token,
            remoteip=remote_ip,
            user_id=user.id,
            endpoint='/api/v1/auth/login/',
            success=True,
            response_data=getattr(self, '_turnstile_response', None)
        )
        
        attrs['user'] = user
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)


class PhoneVerificationRequestSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=17)


class PhoneVerificationConfirmSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=17)
    code = serializers.CharField(max_length=6)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)


# Order Management Serializers
class CreateOrderSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.ORDER_STATUS, default='submitted')
    notes = serializers.CharField(required=False, allow_blank=True)
    items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1
    )


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.ORDER_STATUS)


# Quote Management Serializers
class CreateQuoteSerializer(serializers.Serializer):
    order_item = serializers.UUIDField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    documentation_price = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_days = serializers.IntegerField(min_value=1)
    documentation_days = serializers.IntegerField(min_value=0, default=0)
    notes = serializers.CharField(required=False, allow_blank=True)


# Cart Management Serializers
class AddOrderToCartSerializer(serializers.Serializer):
    order = serializers.UUIDField()


# Payment Serializers
class ProcessPaymentSerializer(serializers.Serializer):
    order = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    method = serializers.ChoiceField(choices=[
        ('online', 'آنلاین'),
        ('transfer', 'انتقال بانکی'),
        ('cash', 'نقدی'),
    ], default='online')
    gateway_response = serializers.JSONField(required=False)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'type', 'title', 'message', 'is_read', 'related_order', 'related_quote', 'created_at']
        read_only_fields = ['id', 'created_at']