from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import viewsets, permissions, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from .models import (
    User,
    Scope, Service, ServiceField,
    Cart, CartItem, Order, OrderItem, Quote,
    Ticket, TicketMessage, Review, MediaFile
)
from .serializers import (
    ScopeSerializer, ServiceSerializer, ServiceFieldSerializer,
    CartSerializer, CartItemSerializer, OrderSerializer, OrderItemSerializer, QuoteSerializer,
    TicketSerializer, TicketMessageSerializer, ReviewSerializer, RegisterSerializer, UserSerializer
)
import os
from django.conf import settings
from uuid import uuid4


@api_view(["GET"]) 
def health(request):
    return Response({"status": "ok"})


@api_view(["POST"]) 
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response(UserSerializer(user).data, status=201)


@api_view(["GET"]) 
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


class IsAuthenticatedOrReadOnly(permissions.IsAuthenticatedOrReadOnly):
    pass


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by('date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


class ScopeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Scope.objects.filter(is_active=True).order_by('name')
    serializer_class = ScopeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Service.objects.filter(is_active=True).select_related('scope').order_by('name')
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ServiceFieldViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ServiceField.objects.all().select_related('service')
    serializer_class = ServiceFieldSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.select_related('customer').all()
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]


class CartItemViewSet(viewsets.ModelViewSet):
    queryset = CartItem.objects.select_related('cart', 'service').all()
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related('customer').all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]


class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.select_related('order', 'service', 'assigned_contractor').all()
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]


class QuoteViewSet(viewsets.ModelViewSet):
    queryset = Quote.objects.select_related('order_item', 'contractor').all()
    serializer_class = QuoteSerializer
    permission_classes = [permissions.IsAuthenticated]


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.select_related('category', 'creator', 'order').all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]


class TicketMessageViewSet(viewsets.ModelViewSet):
    queryset = TicketMessage.objects.select_related('ticket', 'sender').all()
    serializer_class = TicketMessageSerializer
    permission_classes = [permissions.IsAuthenticated]


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.select_related('order_item', 'customer', 'contractor', 'approved_by').all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]


class UploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'detail': 'file is required'}, status=status.HTTP_400_BAD_REQUEST)
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
        os.makedirs(upload_dir, exist_ok=True)
        ext = os.path.splitext(file_obj.name)[1]
        new_name = f"{uuid4().hex}{ext}"
        dest_path = os.path.join(upload_dir, new_name)
        with open(dest_path, 'wb') as dest:
            for chunk in file_obj.chunks():
                dest.write(chunk)
        rel_path = f"uploads/{new_name}"
        media = MediaFile.objects.create(
            filename=new_name,
            original_name=file_obj.name,
            file_path=rel_path,
            mime_type=file_obj.content_type or '',
            file_size=file_obj.size,
            uploaded_by=request.user,
            context=request.data.get('context', 'other'),
            context_id=request.data.get('context_id') or uuid4(),
        )
        url = f"{settings.MEDIA_URL}{rel_path}"
        return Response({'id': str(media.id), 'url': url, 'original_name': media.original_name})
