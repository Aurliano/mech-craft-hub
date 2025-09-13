from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    health, version_info, api_status,
    ScopeViewSet, ServiceViewSet, ServiceFieldViewSet, ServiceTabViewSet,
    CartViewSet, CartItemViewSet,
    OrderViewSet, OrderItemViewSet, QuoteViewSet,
    TicketViewSet, TicketMessageViewSet, TicketAttachmentViewSet, TicketFileTypeViewSet, 
    TicketCategoryViewSet, ContentFilterLogViewSet, ReviewViewSet,
    register, login, me, UserViewSet, UploadView,
    password_reset_request, password_reset_confirm, phone_verification_request,
    phone_verification_confirm, change_password,
    # New order management endpoints
    create_order, get_user_orders, get_order_by_id, update_order_status,
    create_quote, get_quotes_by_order, accept_quote,
    add_order_to_cart, remove_from_cart,
    process_payment, download_invoice, get_service_fields,
    # Notification endpoints
    get_user_notifications, mark_notification_read, mark_all_notifications_read,
    # Contractor endpoints
    get_contractor_orders, get_contractor_proposals, get_contractor_active_projects,
    get_contractor_stats, create_contractor_proposal, get_contractor_workshops,
    create_contractor_workshop, check_contractor_manufacturing_service,
    # Ticket endpoints
    create_ticket, create_ticket_message,
    # hCaptcha endpoints
    captcha_fallback_status, captcha_fallback_verify, hcaptcha_stats, hcaptcha_attempts,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'scopes', ScopeViewSet, basename='scope')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'service-fields', ServiceFieldViewSet, basename='servicefield')
router.register(r'service-tabs', ServiceTabViewSet, basename='servicetab')
router.register(r'carts', CartViewSet, basename='cart')
router.register(r'cart-items', CartItemViewSet, basename='cartitem')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'order-items', OrderItemViewSet, basename='orderitem')
router.register(r'quotes', QuoteViewSet, basename='quote')
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'ticket-messages', TicketMessageViewSet, basename='ticketmessage')
router.register(r'ticket-attachments', TicketAttachmentViewSet, basename='ticketattachment')
router.register(r'ticket-file-types', TicketFileTypeViewSet, basename='ticketfiletype')
router.register(r'ticket-categories', TicketCategoryViewSet, basename='ticketcategory')
router.register(r'content-filter-logs', ContentFilterLogViewSet, basename='contentfilterlog')
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('health/', health, name='health'),
    path('version/', version_info, name='version_info'),
    path('status/', api_status, name='api_status'),
    path('v1/auth/register/', register, name='register'),
    path('v1/auth/login/', login, name='login'),
    path('v1/auth/me/', me, name='me'),
    path('v1/auth/password-reset-request/', password_reset_request, name='password_reset_request'),
    path('v1/auth/password-reset-confirm/', password_reset_confirm, name='password_reset_confirm'),
    path('v1/auth/phone-verification-request/', phone_verification_request, name='phone_verification_request'),
    path('v1/auth/phone-verification-confirm/', phone_verification_confirm, name='phone_verification_confirm'),
    path('v1/auth/change-password/', change_password, name='change_password'),
    path('v1/upload/', UploadView.as_view(), name='upload'),
    
    # Order Management Endpoints
    path('v1/orders/create/', create_order, name='create_order'),
    path('v1/orders/user/', get_user_orders, name='get_user_orders'),
    path('v1/orders/<uuid:order_id>/', get_order_by_id, name='get_order_by_id'),
    path('v1/orders/<uuid:order_id>/status/', update_order_status, name='update_order_status'),
    
    # Service Fields Endpoint
    path('v1/services/<uuid:service_id>/fields/', get_service_fields, name='get_service_fields'),
    
    # Quote Management Endpoints
    path('v1/quotes/', create_quote, name='create_quote'),
    path('v1/quotes/order/<uuid:order_id>/', get_quotes_by_order, name='get_quotes_by_order'),
    path('v1/quotes/<uuid:quote_id>/accept/', accept_quote, name='accept_quote'),
    
    # Cart Management Endpoints
    path('v1/cart/add-order/', add_order_to_cart, name='add_order_to_cart'),
    path('v1/cart/remove/<uuid:cart_item_id>/', remove_from_cart, name='remove_from_cart'),
    
    # Payment Endpoints
    path('v1/payments/process/', process_payment, name='process_payment'),
    path('v1/orders/<uuid:order_id>/invoice/', download_invoice, name='download_invoice'),
    
    # Notification Endpoints
    path('v1/notifications/', get_user_notifications, name='get_user_notifications'),
    path('v1/notifications/<uuid:notification_id>/read/', mark_notification_read, name='mark_notification_read'),
    path('v1/notifications/read-all/', mark_all_notifications_read, name='mark_all_notifications_read'),
    
    # Contractor Endpoints
    path('v1/contractor/orders/', get_contractor_orders, name='get_contractor_orders'),
    path('v1/contractor/proposals/', get_contractor_proposals, name='get_contractor_proposals'),
    path('v1/contractor/active-projects/', get_contractor_active_projects, name='get_contractor_active_projects'),
    path('v1/contractor/stats/', get_contractor_stats, name='get_contractor_stats'),
    path('v1/contractor/proposals/create/', create_contractor_proposal, name='create_contractor_proposal'),
    path('v1/contractor/workshops/', get_contractor_workshops, name='get_contractor_workshops'),
    path('v1/contractor/workshops/create/', create_contractor_workshop, name='create_contractor_workshop'),
    path('v1/contractor/check-manufacturing/', check_contractor_manufacturing_service, name='check_contractor_manufacturing_service'),
    
    # Ticket Management Endpoints
    path('v1/tickets/create/', create_ticket, name='create_ticket'),
    path('v1/tickets/<uuid:ticket_id>/messages/', create_ticket_message, name='create_ticket_message'),
    
    # hCaptcha Fallback Endpoints
    path('v1/captcha/fallback/', captcha_fallback_status, name='captcha_fallback_status'),
    path('v1/captcha/fallback/verify/', captcha_fallback_verify, name='captcha_fallback_verify'),
    
    # hCaptcha Admin Endpoints
    path('v1/admin/hcaptcha/stats/', hcaptcha_stats, name='hcaptcha_stats'),
    path('v1/admin/hcaptcha/attempts/', hcaptcha_attempts, name='hcaptcha_attempts'),
    
    # Aliases for requested endpoints
    path('v1/categories/', ScopeViewSet.as_view({'get': 'list'}), name='categories'),
    path('v1/projects/', OrderViewSet.as_view({'get': 'list', 'post': 'create'}), name='projects'),
    path('v1/bids/', QuoteViewSet.as_view({'get': 'list', 'post': 'create'}), name='bids'),
    path('v1/', include(router.urls)),
] 