from rest_framework import serializers
from .models import (
    User, Role, UserRole, Scope, Service, ServiceField, ServiceTab,
    Cart, CartItem, Order, OrderItem, Quote, Workshop,
    Ticket, TicketMessage, TicketAttachment, TicketFileType, TicketCategory, TicketParticipant,
    ContentFilterLog, Review, Notification, SupportFeedback, BlogPost, BlogComment, ScientificContent,
    OrderProposal, MaterialEstimate, OrderStatus, Payment, MaterialEstimation, OrderStatusLog,
    DeliveryFile, JobSeeker, WorkRequest, JobMatch, WorkContract
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
    role = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'is_email_verified', 'is_phone_verified', 'roles', 'role', 'first_name', 'last_name']
        read_only_fields = ['id', 'is_email_verified', 'is_phone_verified']

    def get_role(self, obj):
        ur = obj.user_roles.filter(is_active=True).select_related('role').first()
        if ur and ur.role:
            return {
                'name': ur.role.name,
                'display_name': ur.role.display_name,
            }
        return None

class WorkshopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workshop
        fields = [
            'id', 'name', 'address', 'description', 'owner', 'is_active', 'is_approved', 'created_at',
            'province', 'city', 'postal_address', 'manager_name', 'manager_phone', 'workers_count',
            'capabilities', 'machines', 'documents', 'workshop_class', 'code'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'code', 'is_approved', 'workshop_class']



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
    field_values_by_tab = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'service', 'service_fields', 'assigned_contractor', 'status', 'price', 'estimated_delivery', 'actual_delivery', 'field_values', 'field_values_by_tab', 'needs_documentation', 'created_at', 'updated_at']
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
    
    def get_field_values_by_tab(self, obj):
        """
        Convert flat field_values structure back to hierarchical tab structure.
        This is important for services with tabs to properly display field values.
        """
        if not obj.field_values:
            return {}
        
        # If service has tabs, reconstruct the tab structure
        if obj.service and obj.service.has_tabs:
            from .models import ServiceTab
            tabs = ServiceTab.objects.filter(service=obj.service, is_active=True).order_by('order')
            result = {}
            
            # Initialize result structure with tab IDs
            for tab in tabs:
                result[str(tab.id)] = {}
            
            # Parse field_values to reconstruct tab-based structure
            for key, value in obj.field_values.items():
                if '_' in key:
                    # Split tab prefix from field key
                    parts = key.split('_', 1)
                    if len(parts) == 2:
                        tab_id, field_key = parts
                        if tab_id in result:
                            result[tab_id][field_key] = value
                        else:
                            # If tab_id not in known tabs, store in general
                            if 'general' not in result:
                                result['general'] = {}
                            result['general'][key] = value
                else:
                    # Field without tab prefix (general field)
                    if 'general' not in result:
                        result['general'] = {}
                    result['general'][key] = value
            
            return result
        else:
            # Service without tabs - return as is
            return {'general': obj.field_values}


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


class CustomerRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    turnstile_token = serializers.CharField(write_only=True, required=False, allow_blank=True)
    cf_turnstile_response = serializers.CharField(write_only=True, required=False, allow_blank=True)
    website = serializers.CharField(required=False, allow_blank=True)  # Honeypot field
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone', 'password', 'turnstile_token', 'cf_turnstile_response',
            'website', 'first_name', 'last_name'
        ]
        read_only_fields = ['id']

    def validate_turnstile_token(self, value):
        """Validate Turnstile token - Temporarily disabled"""
        return value

    def validate_cf_turnstile_response(self, value):
        """Validate Turnstile token - Temporarily disabled"""
        return value

    def validate_website(self, value):
        """Validate honeypot field - should be empty - Temporarily disabled"""
        # Temporarily disabled honeypot validation
        return value

    def validate(self, data):
        """Validate Turnstile token and honeypot"""
        turnstile_token = data.get('turnstile_token') or data.get('cf_turnstile_response')
        
        # Turnstile token is temporarily disabled
        # if not turnstile_token:
        #     raise serializers.ValidationError("Turnstile verification is required")
        
        return data

    def create(self, validated_data):
        # Extract tokens (support both field names)
        turnstile_token = validated_data.pop('turnstile_token', None) or validated_data.pop('cf_turnstile_response', None)
        password = validated_data.pop('password')
        
        # Create user
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        # Assign customer role to the user
        try:
            from .models import Role, UserRole
            customer_role = Role.objects.get(name='customer')
            UserRole.objects.create(
                user=user,
                role=customer_role,
                is_active=True
            )
        except Role.DoesNotExist:
            # If customer role doesn't exist, create it
            customer_role = Role.objects.create(
                name='customer',
                display_name='مشتری',
                description='کاربران عادی که خدمات را سفارش می‌دهند'
            )
            UserRole.objects.create(
                user=user,
                role=customer_role,
                is_active=True
            )
        
        return user


class ContractorRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    turnstile_token = serializers.CharField(write_only=True, required=False, allow_blank=True)
    cf_turnstile_response = serializers.CharField(write_only=True, required=False, allow_blank=True)
    website = serializers.CharField(required=False, allow_blank=True)  # Honeypot field
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    selected_scope = serializers.UUIDField(required=False, allow_null=True)
    selected_services = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone', 'password', 'turnstile_token', 'cf_turnstile_response',
            'website', 'first_name', 'last_name', 'selected_scope', 'selected_services'
        ]
        read_only_fields = ['id']

    def validate_turnstile_token(self, value):
        """Validate Turnstile token - Temporarily disabled"""
        return value

    def validate_cf_turnstile_response(self, value):
        """Validate Turnstile token - Temporarily disabled"""
        return value

    def validate_website(self, value):
        """Validate honeypot field - should be empty - Temporarily disabled"""
        # Temporarily disabled honeypot validation
        return value

    def validate(self, data):
        """Validate Turnstile token and honeypot"""
        turnstile_token = data.get('turnstile_token') or data.get('cf_turnstile_response')
        
        # Turnstile token is temporarily disabled
        # if not turnstile_token:
        #     raise serializers.ValidationError("Turnstile verification is required")
        
        return data

    def create(self, validated_data):
        # Extract tokens (support both field names)
        turnstile_token = validated_data.pop('turnstile_token', None) or validated_data.pop('cf_turnstile_response', None)
        password = validated_data.pop('password')
        
        # Extract contractor-specific fields
        selected_scope = validated_data.pop('selected_scope', None)
        selected_services = validated_data.pop('selected_services', [])
        
        # Create user
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        # Assign contractor role to the user
        try:
            from .models import Role, UserRole
            contractor_role = Role.objects.get(name='contractor')
            UserRole.objects.create(
                user=user,
                role=contractor_role,
                is_active=True
            )
        except Role.DoesNotExist:
            # If contractor role doesn't exist, create it
            contractor_role = Role.objects.create(
                name='contractor',
                display_name='پیمانکار',
                description='پیمانکاران که خدمات را ارائه می‌دهند'
            )
            UserRole.objects.create(
                user=user,
                role=contractor_role,
                is_active=True
            )
        
        # Create contractor services if provided
        if selected_scope and selected_services:
            from .models import Scope, Service, ContractorService
            
            try:
                Scope.objects.get(id=selected_scope)
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
        
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    # Support both field names for compatibility
    turnstile_token = serializers.CharField(required=False, allow_blank=True)
    cf_turnstile_response = serializers.CharField(required=False, allow_blank=True)

    def validate_turnstile_token(self, value):
        """Validate Turnstile token - Temporarily disabled"""
        # Temporarily disabled Turnstile validation
        return value

    def validate_cf_turnstile_response(self, value):
        """Validate Turnstile token - Temporarily disabled"""
        # Temporarily disabled Turnstile validation
        return value

    def validate(self, data):
        """Validate Turnstile token, honeypot and authenticate user"""
        from django.contrib.auth import authenticate
        
        turnstile_token = data.get('turnstile_token') or data.get('cf_turnstile_response')
        
        # Turnstile token is temporarily disabled
        # if not turnstile_token:
        #     raise serializers.ValidationError("Turnstile verification is required")
        
        # Authenticate user
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                data['user'] = user
            else:
                raise serializers.ValidationError("Invalid username or password")
        else:
            raise serializers.ValidationError("Username and password are required")
        
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8, required=False)
    verify_only = serializers.BooleanField(default=False)


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
    documentation_options = serializers.JSONField(required=False, default=dict)
    items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1
    )


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.ORDER_STATUS)


# New Order Flow Serializers
class OrderProposalSerializer(serializers.ModelSerializer):
    contractor_name = serializers.CharField(source='contractor.username', read_only=True)
    contractor_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderProposal
        fields = ['id', 'order', 'contractor', 'contractor_name', 'contractor_rating', 'price', 'delivery_days', 'description', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_contractor_rating(self, obj):
        # Calculate contractor rating (simplified)
        return 4.5  # Placeholder


class CreateOrderProposalSerializer(serializers.Serializer):
    order = serializers.UUIDField()
    price = serializers.DecimalField(max_digits=12, decimal_places=0, help_text="قیمت به تومان")
    delivery_days = serializers.IntegerField(min_value=1)
    description = serializers.CharField()


class MaterialEstimateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialEstimate
        fields = ['id', 'order', 'estimated_cost', 'description', 'is_paid', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CreateMaterialEstimateSerializer(serializers.Serializer):
    order = serializers.UUIDField()
    estimated_cost = serializers.DecimalField(max_digits=12, decimal_places=0, help_text="هزینه برآورد شده متریال به تومان")
    description = serializers.CharField()


class OrderStatusSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = OrderStatus
        fields = ['id', 'order', 'status', 'description', 'created_at', 'created_by', 'created_by_name']
        read_only_fields = ['id', 'created_at']


class OrderStatusLogSerializer(serializers.ModelSerializer):
    """Serializer for Order Status Log with user details"""
    changed_by_name = serializers.CharField(source='changed_by.username', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    
    class Meta:
        model = OrderStatusLog
        fields = [
            'id', 'order', 'order_number', 'previous_status', 'new_status', 
            'changed_by', 'changed_by_name', 'reason', 'changed_at'
        ]
        read_only_fields = ['id', 'changed_at']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'order', 'amount', 'payment_type', 'status', 'gateway_transaction_id', 'created_at', 'paid_at']
        read_only_fields = ['id', 'created_at', 'paid_at']


class ProcessPaymentSerializer(serializers.Serializer):
    order = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=0, help_text="مبلغ به تومان")
    payment_type = serializers.ChoiceField(choices=Payment.PAYMENT_TYPE_CHOICES)
    description = serializers.CharField(required=False, allow_blank=True)


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


# Support System Serializers
class SupportFeedbackSerializer(serializers.ModelSerializer):
    satisfaction_display = serializers.ReadOnlyField()
    
    class Meta:
        model = SupportFeedback
        fields = [
            'id', 'user', 'used_services', 'satisfaction_rating', 'satisfaction_display',
            'personal_feedback', 'ai_response', 'ai_model_used', 'ai_prompt_tokens',
            'ai_response_tokens', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'ai_response', 'ai_model_used', 'ai_prompt_tokens', 'ai_response_tokens', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Add metadata from request
        request = self.context.get('request')
        if request:
            validated_data['ip_address'] = self.get_client_ip(request)
            validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
            validated_data['session_id'] = request.session.session_key
        
        return super().create(validated_data)
    
    def get_client_ip(self, request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class SupportFeedbackCreateSerializer(serializers.Serializer):
    """Serializer for creating support feedback with AI response"""
    used_services = serializers.BooleanField(required=False, allow_null=True)
    satisfaction_rating = serializers.IntegerField(
        min_value=0, 
        max_value=5, 
        required=False, 
        allow_null=True
    )
    personal_feedback = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    def validate_satisfaction_rating(self, value):
        if value is not None and value not in range(6):
            raise serializers.ValidationError("امتیاز رضایت باید بین 0 تا 5 باشد.")
        return value


class SupportStatsSerializer(serializers.Serializer):
    """Serializer for support statistics"""
    period_days = serializers.IntegerField()
    total_feedbacks = serializers.IntegerField()
    with_ai_response = serializers.IntegerField()
    ai_response_rate = serializers.FloatField()
    satisfaction_distribution = serializers.DictField()
    service_usage = serializers.DictField()


# Blog System Serializers
class MaterialEstimationSerializer(serializers.ModelSerializer):
    """Serializer for Material Estimation"""
    estimator_name = serializers.CharField(source='estimator.username', read_only=True)
    order_number = serializers.CharField(source='order_item.order.order_number', read_only=True)
    service_name = serializers.CharField(source='order_item.service.name', read_only=True)
    customer_name = serializers.CharField(source='order_item.order.customer.username', read_only=True)
    
    class Meta:
        model = MaterialEstimation
        fields = [
            'id', 'order_item', 'estimator', 'estimator_name', 'order_number', 
            'service_name', 'customer_name', 'material_name', 'material_type',
            'quantity', 'unit', 'unit_price', 'total_price', 'supplier_name',
            'supplier_contact', 'specifications', 'delivery_time', 'notes',
            'status', 'approved_by', 'approved_at', 'rejection_reason',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_price', 'created_at', 'updated_at']


class MaterialEstimationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Material Estimation"""
    
    class Meta:
        model = MaterialEstimation
        fields = [
            'order_item', 'material_name', 'material_type', 'quantity', 'unit',
            'unit_price', 'supplier_name', 'supplier_contact', 'specifications',
            'delivery_time', 'notes'
        ]
    
    def create(self, validated_data):
        validated_data['estimator'] = self.context['request'].user
        return super().create(validated_data)


class ScientificContentSerializer(serializers.ModelSerializer):
    """Serializer for scientific content"""
    author_name = serializers.CharField(source='author.username', read_only=True)
    content_type_display = serializers.CharField(source='get_content_type_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    reading_time = serializers.ReadOnlyField()
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ScientificContent
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'content_type', 'content_type_display',
            'category', 'category_display', 'status', 'meta_description', 'meta_keywords',
            'author', 'author_name', 'featured_image', 'source_url', 'source_name',
            'view_count', 'like_count', 'download_url', 'video_url', 'file_size', 'duration',
            'file_name', 'file_type', 'file_path', 'file_url', 'is_public', 'download_count',
            'created_at', 'updated_at', 'published_at', 'reading_time'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'published_at', 'view_count', 'like_count']
    
    def get_file_url(self, obj):
        from django.conf import settings
        from .file_manager import file_manager
        if obj.file_path:
            return file_manager.get_file_url(obj.file_path, is_public=True)
        return None


class ScientificContentListSerializer(serializers.ModelSerializer):
    """Serializer for scientific content list view"""
    author_name = serializers.CharField(source='author.username', read_only=True)
    content_type_display = serializers.CharField(source='get_content_type_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    reading_time = serializers.ReadOnlyField()
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ScientificContent
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content_type', 'content_type_display',
            'category', 'category_display', 'author_name', 'featured_image',
            'view_count', 'like_count', 'download_url', 'video_url', 'file_size', 'duration',
            'file_url', 'created_at', 'published_at', 'reading_time'
        ]
    
    def get_file_url(self, obj):
        from .file_manager import file_manager
        if obj.file_path:
            return file_manager.get_file_url(obj.file_path, is_public=True)
        return None


class ScientificContentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating scientific content"""
    
    class Meta:
        model = ScientificContent
        fields = [
            'title', 'slug', 'excerpt', 'content', 'content_type', 'category', 'status',
            'meta_description', 'meta_keywords', 'featured_image', 'source_url', 'source_name',
            'download_url', 'video_url', 'file_size', 'duration'
        ]
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class BlogPostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    reading_time = serializers.ReadOnlyField()
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'category', 'status',
            'meta_description', 'meta_keywords', 'author', 'author_name',
            'featured_image', 'source_url', 'source_name', 'view_count',
            'like_count', 'reading_time', 'comments_count', 'created_at',
            'updated_at', 'published_at'
        ]
        read_only_fields = ['id', 'author', 'view_count', 'like_count', 'created_at', 'updated_at', 'published_at']
    
    def get_comments_count(self, obj):
        return obj.comments.filter(is_approved=True).count()


class BlogPostListSerializer(serializers.ModelSerializer):
    """Simplified serializer for blog post lists"""
    author_name = serializers.CharField(source='author.username', read_only=True)
    reading_time = serializers.ReadOnlyField()
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'category', 'author_name',
            'featured_image', 'source_name', 'view_count', 'like_count',
            'reading_time', 'comments_count', 'published_at'
        ]
    
    def get_comments_count(self, obj):
        return obj.comments.filter(is_approved=True).count()


class BlogPostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating blog posts"""
    
    class Meta:
        model = BlogPost
        fields = [
            'title', 'slug', 'excerpt', 'content', 'category', 'status',
            'meta_description', 'meta_keywords', 'featured_image',
            'source_url', 'source_name'
        ]
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class BlogCommentSerializer(serializers.ModelSerializer):
    """Serializer for blog comments"""
    
    class Meta:
        model = BlogComment
        fields = ['id', 'post', 'author_name', 'author_email', 'content', 'is_approved', 'created_at']
        read_only_fields = ['id', 'is_approved', 'created_at']


class BlogCommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating blog comments"""
    
    class Meta:
        model = BlogComment
        fields = ['post', 'author_name', 'author_email', 'content']


class DeliveryFileSerializer(serializers.ModelSerializer):
    """Serializer for delivery files"""
    
    download_url = serializers.SerializerMethodField()
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    
    class Meta:
        model = DeliveryFile
        fields = [
            'id', 'order', 'order_number', 'file_name', 'file_size', 
            'content_type', 'uploaded_by', 'uploaded_by_name', 'upload_date',
            'download_count', 'last_download', 'is_active', 'expires_at',
            'description', 'download_url', 'created_at'
        ]
        read_only_fields = [
            'id', 'file_path', 'uploaded_by', 'upload_date', 
            'download_count', 'last_download', 'created_at'
        ]
    
    def get_download_url(self, obj):
        """Generate download URL for the file"""
        if obj.is_active and not obj.is_expired():
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(f'/api/v1/deliveries/{obj.id}/download/')
        return None


class DeliveryFileUploadSerializer(serializers.Serializer):
    """Serializer for uploading delivery files"""
    
    order_id = serializers.UUIDField()
    file = serializers.FileField()
    description = serializers.CharField(required=False, allow_blank=True)
    expires_in_days = serializers.IntegerField(default=30, min_value=1, max_value=365)


# Workforce Management Serializers

class JobSeekerSerializer(serializers.ModelSerializer):
    """Serializer for job seeker profile"""
    user = UserSerializer(read_only=True)
    service_scope = ScopeSerializer(read_only=True)
    services = ServiceSerializer(many=True, read_only=True)
    
    class Meta:
        model = JobSeeker
        fields = [
            'id', 'user', 'job_title', 'experience_years', 'education', 
            'cv_text', 'service_scope', 'services', 'skills',
            'is_active', 'is_available', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Create job seeker profile for authenticated user"""
        validated_data['user'] = self.context['request'].user
        services = self.context['request'].data.get('services', [])
        instance = JobSeeker.objects.create(**validated_data)
        if services:
            instance.services.set(services)
        return instance


class JobSeekerCreateSerializer(serializers.ModelSerializer):
    """Serializer for createdAt job seeker profile"""
    
    class Meta:
        model = JobSeeker
        fields = [
            'job_title', 'experience_years', 'education', 'cv_text',
            'service_scope', 'services', 'skills'
        ]
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        services = validated_data.pop('services', [])
        instance = JobSeeker.objects.create(**validated_data)
        if services:
            instance.services.set(services)
        return instance


class WorkRequestSerializer(serializers.ModelSerializer):
    """Serializer for work requests"""
    contractor = UserSerializer(read_only=True)
    workshop = WorkshopSerializer(read_only=True)
    service_scope = ScopeSerializer(read_only=True)
    required_services = ServiceSerializer(many=True, read_only=True)
    
    class Meta:
        model = WorkRequest
        fields = [
            'id', 'contractor', 'workshop', 'requested_job_title',
            'required_skills', 'service_scope', 'required_services',
            'min_experience', 'preferred_education', 'offered_salary',
            'work_hours', 'work_location', 'work_type', 'description',
            'requirements', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'contractor', 'status', 'created_at', 'updated_at']


class WorkRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating work requests"""
    
    class Meta:
        model = WorkRequest
        fields = [
            'workshop', 'requested_job_title', 'required_skills',
            'service_scope', 'required_services', 'min_experience',
            'preferred_education', 'offered_salary', 'work_hours',
            'work_location', 'work_type', 'description', 'requirements'
        ]
    
    def create(self, validated_data):
        validated_data['contractor'] = self.context['request'].user
        required_services = validated_data.pop('required_services', [])
        instance = WorkRequest.objects.create(**validated_data)
        if required_services:
            instance.required_services.set(required_services)
        return instance


class JobMatchSerializer(serializers.ModelSerializer):
    """Serializer for job matches"""
    work_request = WorkRequestSerializer(read_only=True)
    job_seeker = JobSeekerSerializer(read_only=True)
    suggested_by_user = UserSerializer(source='suggested_by', read_only=True)
    
    class Meta:
        model = JobMatch
        fields = [
            'id', 'work_request', 'job_seeker', 'match_score',
            'match_reason', 'status', 'test_start_date', 'test_end_date',
            'test_result', 'test_notes', 'contractor_feedback',
            'seeker_feedback', 'suggested_by_user', 'suggested_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'suggested_by', 'suggested_at', 
            'created_at', 'updated_at'
        ]


class JobMatchCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating job matches (admin only)"""
    
    class Meta:
        model = JobMatch
        fields = [
            'work_request', 'job_seeker', 'match_score',
            'match_reason', 'status'
        ]
    
    def create(self, validated_data):
        validated_data['suggested_by'] = self.context['request'].user
        return super().create(validated_data)


class WorkContractSerializer(serializers.ModelSerializer):
    """Serializer for work contracts"""
    job_match = JobMatchSerializer(read_only=True)
    work_request = WorkRequestSerializer(read_only=True)
    job_seeker = JobSeekerSerializer(read_only=True)
    contractor = UserSerializer(read_only=True)
    created_by_user = UserSerializer(source='created_by', read_only=True)
    approved_by_user = UserSerializer(source='approved_by', read_only=True)
    
    class Meta:
        model = WorkContract
        fields = [
            'id', 'job_match', 'work_request', 'job_seeker', 'contractor',
            'contract_number', 'start_date', 'end_date', 'salary_amount',
            'salary_frequency', 'work_hours', 'work_location', 'responsibilities',
            'status', 'created_by_user', 'approved_by_user', 'contractor_signed',
            'contractor_signed_at', 'seeker_signed', 'seeker_signed_at',
            'contract_file_path', 'termination_reason', 'termination_date',
            'termination_by', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'contract_number', 'created_by', 'created_at', 'updated_at'
        ]


class WorkContractCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating work contracts"""
    
    class Meta:
        model = WorkContract
        fields = [
            'job_match', 'start_date', 'end_date', 'salary_amount',
            'salary_frequency', 'work_hours', 'work_location', 'responsibilities',
            'contract_file_path'
        ]
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        # Get related objects from job_match
        job_match = validated_data['job_match']
        validated_data['work_request'] = job_match.work_request
        validated_data['job_seeker'] = job_match.job_seeker
        validated_data['contractor'] = job_match.work_request.contractor
        
        return super().create(validated_data)