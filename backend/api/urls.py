from django.urls import path, include
from django.http import HttpResponseRedirect
from rest_framework.routers import DefaultRouter
from .views import (
    health, version_info, api_status, csrf_token,
    ScopeViewSet, ServiceViewSet, ServiceFieldViewSet, ServiceTabViewSet,
    CartViewSet, CartItemViewSet,
    OrderViewSet, OrderItemViewSet, QuoteViewSet,
    TicketViewSet, TicketMessageViewSet, TicketAttachmentViewSet, TicketFileTypeViewSet, 
    TicketCategoryViewSet, ContentFilterLogViewSet, ReviewViewSet,
    customer_register, contractor_register, login, refresh_token, logout, me, UserViewSet, UploadView,
    password_reset_request, password_reset_confirm, phone_verification_request,
    phone_verification_confirm, change_password, password_reset_request_sms, sms_credit,
    verify_user_phone, password_reset_confirm_sms,
    # New order management endpoints
    create_order, get_user_orders, get_order_by_id, update_order_status,
    update_order_item_status, mark_project_delivered, confirm_project_completion,
    create_quote, get_quotes_by_order, accept_quote, reject_quote,
    add_order_to_cart, remove_from_cart,
    process_payment, download_invoice, get_service_fields,
    # Notification endpoints
    get_user_notifications, mark_notification_read, mark_all_notifications_read,
    # Contractor endpoints
    get_contractor_orders, get_contractor_proposals, get_contractor_active_projects,
    get_contractor_stats, create_contractor_proposal, get_contractor_workshops,
    create_contractor_workshop, check_contractor_manufacturing_service,
    get_contractor_ratings, get_contractor_rating_stats,
    # Ticket endpoints
    create_ticket, create_ticket_message,
    # Captcha endpoints (Turnstile only)
    turnstile_stats, turnstile_attempts,
            # Support system endpoints
            create_support_feedback, get_support_feedbacks, ask_ai_support, get_support_stats, get_all_support_feedbacks,
            submit_ai_feedback, get_ai_analytics, get_ai_interactions,
            # Blog system endpoints
            get_blog_posts, get_blog_post, get_blog_categories, get_featured_posts, get_recent_posts,
            create_blog_post, create_blog_comment, get_blog_comments,
)

# Import file management views
# from .file_views import (
#     upload_content_file, download_content_file, delete_content_file, get_file_info
# )

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
    path('csrf-token/', csrf_token, name='csrf_token'),
    path('version/', version_info, name='version_info'),
    path('status/', api_status, name='api_status'),
    path('v1/auth/customer-register/', customer_register, name='customer_register'),
    path('v1/auth/contractor-register/', contractor_register, name='contractor_register'),
    path('v1/auth/login/', login, name='login'),
    path('v1/auth/refresh/', refresh_token, name='refresh_token'),
    path('v1/auth/logout/', logout, name='logout'),
    path('v1/auth/me/', me, name='me'),
    path('v1/auth/password-reset-request/', password_reset_request, name='password_reset_request'),
    path('v1/auth/password-reset-request-sms/', password_reset_request_sms, name='password_reset_request_sms'),
    path('v1/auth/password-reset-confirm/', password_reset_confirm, name='password_reset_confirm'),
    path('v1/auth/password-reset-confirm-sms/', password_reset_confirm_sms, name='password_reset_confirm_sms'),
    path('v1/auth/phone-verification-request/', phone_verification_request, name='phone_verification_request'),
    path('v1/auth/phone-verification-confirm/', phone_verification_confirm, name='phone_verification_confirm'),
    path('v1/auth/verify-user-phone/', verify_user_phone, name='verify_user_phone'),
    path('v1/auth/change-password/', change_password, name='change_password'),
    path('v1/sms/credit/', sms_credit, name='sms_credit'),
    path('v1/upload/', UploadView.as_view(), name='upload'),
    
    # Order Management Endpoints
    path('v1/orders/create/', create_order, name='create_order'),
    path('v1/orders/user/', get_user_orders, name='get_user_orders'),
    path('v1/orders/<uuid:order_id>/', get_order_by_id, name='get_order_by_id'),
    path('v1/orders/<uuid:order_id>/status/', update_order_status, name='update_order_status'),
    
    # Order Item Status Management
    path('v1/order-items/<uuid:item_id>/status/', update_order_item_status, name='update_order_item_status'),
    path('v1/order-items/<uuid:item_id>/deliver/', mark_project_delivered, name='mark_project_delivered'),
    path('v1/order-items/<uuid:item_id>/confirm/', confirm_project_completion, name='confirm_project_completion'),
    
    # Service Fields Endpoint
    path('v1/services/<uuid:service_id>/fields/', get_service_fields, name='get_service_fields'),
    
    # Quote Management Endpoints
    path('v1/quotes/', create_quote, name='create_quote'),
    path('v1/quotes/order/<uuid:order_id>/', get_quotes_by_order, name='get_quotes_by_order'),
    path('v1/quotes/<uuid:quote_id>/accept/', accept_quote, name='accept_quote'),
    path('v1/quotes/<uuid:quote_id>/reject/', reject_quote, name='reject_quote'),
    
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
    path('v1/contractor/ratings/', get_contractor_ratings, name='get_contractor_ratings'),
    path('v1/contractor/rating-stats/', get_contractor_rating_stats, name='get_contractor_rating_stats'),
    
    # Ticket Management Endpoints
    path('v1/tickets/create/', create_ticket, name='create_ticket'),
    path('v1/tickets/<uuid:ticket_id>/messages/', create_ticket_message, name='create_ticket_message'),
    
    # Turnstile Admin Endpoints
    path('v1/admin/turnstile/stats/', turnstile_stats, name='turnstile_stats'),
    path('v1/admin/turnstile/attempts/', turnstile_attempts, name='turnstile_attempts'),
    
    # Support System Endpoints
    path('v1/support/feedback/', create_support_feedback, name='create_support_feedback'),
    path('v1/support/feedback/my/', get_support_feedbacks, name='get_support_feedbacks'),
    path('v1/support/ask/', ask_ai_support, name='ask_ai_support'),
    
    # AI Learning Endpoints
    path('v1/ai/feedback/', submit_ai_feedback, name='submit_ai_feedback'),
    path('v1/ai/analytics/', get_ai_analytics, name='get_ai_analytics'),
    path('v1/ai/interactions/', get_ai_interactions, name='get_ai_interactions'),
    
            # Support Admin Endpoints
            path('v1/admin/support/stats/', get_support_stats, name='get_support_stats'),
            path('v1/admin/support/feedbacks/', get_all_support_feedbacks, name='get_all_support_feedbacks'),
            
            # Blog System Endpoints
            path('v1/blog/posts/', get_blog_posts, name='get_blog_posts'),
            path('v1/blog/posts/<str:slug>/', get_blog_post, name='get_blog_post'),
            path('v1/blog/categories/', get_blog_categories, name='get_blog_categories'),
            path('v1/blog/featured/', get_featured_posts, name='get_featured_posts'),
            path('v1/blog/recent/', get_recent_posts, name='get_recent_posts'),
            path('v1/blog/posts/<str:slug>/comments/', get_blog_comments, name='get_blog_comments'),
            path('v1/blog/posts/<str:slug>/comments/create/', create_blog_comment, name='create_blog_comment'),
            
            # Blog Admin Endpoints
            path('v1/admin/blog/posts/create/', create_blog_post, name='create_blog_post'),
            
            # File Management Endpoints (موقتاً غیرفعال)
            # path('v1/files/upload/', upload_content_file, name='upload_content_file'),
            # path('v1/files/<str:content_id>/download/', download_content_file, name='download_content_file'),
            # path('v1/files/<str:content_id>/delete/', delete_content_file, name='delete_content_file'),
            # path('v1/files/<str:content_id>/info/', get_file_info, name='get_file_info'),
    
    # Aliases for requested endpoints
    path('v1/categories/', ScopeViewSet.as_view({'get': 'list'}), name='categories'),
    path('v1/projects/', OrderViewSet.as_view({'get': 'list', 'post': 'create'}), name='projects'),
    path('v1/bids/', QuoteViewSet.as_view({'get': 'list', 'post': 'create'}), name='bids'),
    
    # Direct ticket endpoints (for compatibility)
    path('tickets/', TicketViewSet.as_view({'get': 'list', 'post': 'create'}), name='tickets_direct'),
    
    path('v1/', include(router.urls)),
    
    # Redirect /api/ to /api/v1/
    path('', lambda request: HttpResponseRedirect('/api/v1/')),
] 