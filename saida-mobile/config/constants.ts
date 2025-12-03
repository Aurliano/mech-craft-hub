/**
 * Configuration constants for the Saida mobile app
 */

// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://saydatech.ir';
export const API_ROOT = process.env.EXPO_PUBLIC_API_ROOT || '/api';

// Token storage keys
export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

// App configuration
export const APP_NAME = 'سایدا';
export const APP_VERSION = '1.0.0';

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/v1/auth/login/',
  REGISTER_CUSTOMER: '/v1/auth/customer-register/',
  REGISTER_CONTRACTOR: '/v1/auth/contractor-register/',
  REGISTER_SPECIALIST: '/v1/auth/specialist-register/',
  REFRESH_TOKEN: '/v1/auth/refresh/',
  LOGOUT: '/v1/auth/logout/',
  ME: '/v1/auth/me/',
  PASSWORD_RESET_REQUEST: '/v1/auth/password-reset-request/',
  PASSWORD_RESET_CONFIRM: '/v1/auth/password-reset-confirm/',
  PASSWORD_RESET_REQUEST_SMS: '/v1/auth/password-reset-request-sms/',
  PASSWORD_RESET_CONFIRM_SMS: '/v1/auth/password-reset-confirm-sms/',
  PHONE_VERIFICATION_REQUEST: '/v1/auth/phone-verification-request/',
  PHONE_VERIFICATION_CONFIRM: '/v1/auth/phone-verification-confirm/',
  VERIFY_USER_PHONE: '/v1/auth/verify-user-phone/',
  CHECK_PHONE_VERIFICATION: '/v1/auth/check-phone-verification/',
  CHANGE_PASSWORD: '/v1/auth/change-password/',
  
  // Services
  SERVICES: '/v1/services/',
  SERVICE_FIELDS: '/v1/service-fields/',
  
  // Orders
  ORDERS_CREATE: '/v1/orders/create/',
  ORDERS_USER: '/v1/orders/user/',
  ORDERS_BY_ID: '/v1/orders/',
  
  // Cart
  CART: '/v1/cart/',
  CART_ITEMS: '/v1/cart/items/',
  ADD_TO_CART: '/v1/cart/add/',
  REMOVE_FROM_CART: '/v1/cart/remove/',
  
  // Quotes
  QUOTES_CREATE: '/v1/quotes/create/',
  QUOTES_BY_ORDER: '/v1/quotes/order/',
  ACCEPT_QUOTE: '/v1/quotes/accept/',
  REJECT_QUOTE: '/v1/quotes/reject/',
  
  // Payments
  INITIATE_PAYMENT: '/v1/payments/initiate/',
  PAYMENT_SUMMARY: '/v1/payments/summary/',
  
  // Notifications
  NOTIFICATIONS: '/v1/notifications/',
  MARK_NOTIFICATION_READ: '/v1/notifications/mark-read/',
  MARK_ALL_NOTIFICATIONS_READ: '/v1/notifications/mark-all-read/',
  
  // Tickets
  TICKETS_CREATE: '/v1/tickets/create/',
  TICKETS_MESSAGES: '/v1/tickets/',
  
  // Blog
  BLOG_POSTS: '/v1/blog/posts/',
  BLOG_POST: '/v1/blog/posts/',
  BLOG_CATEGORIES: '/v1/blog/categories/',
  
  // Upload
  UPLOAD: '/v1/upload/',
} as const;

// User roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  CONTRACTOR: 'contractor',
  SPECIALIST: 'specialist',
} as const;

// Order statuses
export const ORDER_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Quote statuses
export const QUOTE_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const;

