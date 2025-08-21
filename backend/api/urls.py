from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    health,
    ScopeViewSet, ServiceViewSet, ServiceFieldViewSet,
    CartViewSet, CartItemViewSet,
    OrderViewSet, OrderItemViewSet, QuoteViewSet,
    TicketViewSet, TicketMessageViewSet, ReviewViewSet,
    register, me, UserViewSet, UploadView,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'scopes', ScopeViewSet, basename='scope')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'service-fields', ServiceFieldViewSet, basename='servicefield')
router.register(r'carts', CartViewSet, basename='cart')
router.register(r'cart-items', CartItemViewSet, basename='cartitem')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'order-items', OrderItemViewSet, basename='orderitem')
router.register(r'quotes', QuoteViewSet, basename='quote')
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'ticket-messages', TicketMessageViewSet, basename='ticketmessage')
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('health/', health, name='health'),
    path('v1/auth/register/', register, name='register'),
    path('v1/auth/me/', me, name='me'),
    path('v1/upload/', UploadView.as_view(), name='upload'),
    # Aliases for requested endpoints
    path('v1/categories/', ScopeViewSet.as_view({'get': 'list'}), name='categories'),
    path('v1/projects/', OrderViewSet.as_view({'get': 'list', 'post': 'create'}), name='projects'),
    path('v1/bids/', QuoteViewSet.as_view({'get': 'list', 'post': 'create'}), name='bids'),
    path('v1/', include(router.urls)),
] 