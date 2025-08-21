from rest_framework import serializers
from .models import (
    User, Scope, Service, ServiceField,
    Cart, CartItem, Order, OrderItem, Quote,
    Ticket, TicketMessage, Review
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'is_email_verified', 'is_phone_verified']
        read_only_fields = ['id', 'is_email_verified', 'is_phone_verified']


class ServiceFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceField
        fields = ['id', 'name', 'field_key', 'type', 'options', 'is_required', 'order', 'help_text', 'validation_rules']


class ServiceSerializer(serializers.ModelSerializer):
    fields = ServiceFieldSerializer(many=True, read_only=True)

    class Meta:
        model = Service
        fields = ['id', 'scope', 'name', 'type', 'description', 'base_price', 'estimated_delivery_days', 'is_active', 'fields']


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
    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'service', 'assigned_contractor', 'status', 'price', 'estimated_delivery', 'actual_delivery', 'field_values', 'needs_documentation', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'customer', 'order_number', 'status', 'total_amount', 'notes', 'created_at', 'updated_at', 'items']
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']


class QuoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quote
        fields = ['id', 'order_item', 'contractor', 'price', 'documentation_price', 'delivery_days', 'documentation_days', 'notes', 'status', 'created_at', 'expires_at']
        read_only_fields = ['id', 'created_at']


class TicketMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketMessage
        fields = ['id', 'ticket', 'sender', 'content', 'is_internal', 'created_at']
        read_only_fields = ['id', 'created_at']


class TicketSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = ['id', 'category', 'subject', 'creator', 'order', 'status', 'priority', 'created_at', 'last_activity_at', 'messages']
        read_only_fields = ['id', 'created_at', 'last_activity_at']


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'order_item', 'customer', 'contractor', 'rating', 'comment', 'is_approved', 'approved_by', 'created_at', 'approved_at']
        read_only_fields = ['id', 'created_at', 'approved_at', 'is_approved', 'approved_by']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'password']
        read_only_fields = ['id']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user 