from rest_framework.decorators import api_view, permission_classes, action, parser_classes
from rest_framework.response import Response
from rest_framework import viewsets, permissions, status, filters
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters_drf
from django.db import models
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
from .models import (
    User,
    Scope, Service, ServiceField, ServiceTab,
    Cart, CartItem, Order, OrderItem, Quote, Workshop, ContractorService,
    Ticket, TicketMessage, TicketAttachment, TicketFileType, TicketCategory, TicketParticipant,
    ContentFilterLog, Review, MediaFile,
    PasswordResetToken, PhoneVerificationCode, Payment, Notification, OrderStatusLog,
    ScientificContent, OrderProposal, MaterialEstimate, OrderStatus, MaterialEstimation,
    DeliveryFile, JobSeeker, WorkRequest, JobMatch, WorkContract,
    SpecialistProfile, SpecialistHireRequest, JobSeekerHireRequest,
    Conversation, ConversationParticipant, DirectMessage, DirectMessageAttachment
)
from .pagination import StandardResultsSetPagination
from .exceptions import (
    NotFoundException
)
from .versioning import get_version_info
from .serializers import (
    ScopeSerializer, ServiceSerializer, ServiceFieldSerializer, ServiceTabSerializer,
    CartSerializer, CartItemSerializer, OrderSerializer, OrderItemSerializer, QuoteSerializer,
    TicketSerializer, TicketMessageSerializer, TicketAttachmentSerializer, TicketFileTypeSerializer,
    TicketCategorySerializer, ContentFilterLogSerializer,
    ReviewSerializer, CustomerRegisterSerializer, ContractorRegisterSerializer, LoginSerializer, UserSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer, PhoneVerificationRequestSerializer,
    PhoneVerificationConfirmSerializer, ChangePasswordSerializer,
    CreateOrderSerializer, OrderStatusUpdateSerializer, CreateQuoteSerializer,
    NotificationSerializer, ScientificContentSerializer, ScientificContentListSerializer, ScientificContentCreateSerializer,
    OrderProposalSerializer, CreateOrderProposalSerializer, MaterialEstimateSerializer, CreateMaterialEstimateSerializer,
    OrderStatusSerializer, OrderStatusLogSerializer, PaymentSerializer, ProcessPaymentSerializer,
    MaterialEstimationSerializer, MaterialEstimationCreateSerializer,
    JobSeekerSerializer, JobSeekerCreateSerializer, JobSeekerPublicSerializer, WorkRequestSerializer, WorkRequestCreateSerializer,
    JobMatchSerializer, JobMatchCreateSerializer, WorkContractSerializer, WorkContractCreateSerializer,
    SpecialistProfileSerializer, SpecialistProfileCreateSerializer, SpecialistProfilePublicSerializer,
    SpecialistHireRequestSerializer, SpecialistHireRequestCreateSerializer,
    JobSeekerHireRequestSerializer, JobSeekerHireRequestCreateSerializer,
    UserPublicProfileSerializer, DirectMessageSerializer, ConversationSerializer
)
import os
import random
import string
from django.conf import settings
from django.utils import timezone
from django.utils.crypto import get_random_string
from uuid import uuid4
import logging
import requests  # type: ignore
import hmac
import hashlib
from .utils.turnstile import (
    check_fallback_available,
    get_fallback_captcha_data, verify_fallback_captcha, get_turnstile_stats
)
from django.http import FileResponse
import mimetypes

# Configure logger
logger = logging.getLogger(__name__)


# Custom Filters
class ServiceFilter(filters_drf.FilterSet):
    scope = filters_drf.UUIDFilter(field_name='scope__id')
    type = filters_drf.ChoiceFilter(choices=Service.SERVICE_TYPES)
    is_active = filters_drf.BooleanFilter()
    min_price = filters_drf.NumberFilter(field_name='base_price', lookup_expr='gte')
    max_price = filters_drf.NumberFilter(field_name='base_price', lookup_expr='lte')
    
    class Meta:
        model = Service
        fields = ['scope', 'type', 'is_active', 'min_price', 'max_price']


class OrderFilter(filters_drf.FilterSet):
    status = filters_drf.ChoiceFilter(choices=Order.ORDER_STATUS)
    customer = filters_drf.CharFilter(field_name='customer__username')
    min_amount = filters_drf.NumberFilter(field_name='total_amount', lookup_expr='gte')
    max_amount = filters_drf.NumberFilter(field_name='total_amount', lookup_expr='lte')
    created_after = filters_drf.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = filters_drf.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        model = Order
        fields = ['status', 'customer', 'min_amount', 'max_amount', 'created_after', 'created_before']


# Utilities for payment amounts
def toman_to_rial(amount_toman: int) -> int:
    try:
        return int(amount_toman) * 10
    except Exception:
        return 0


def rial_to_toman(amount_rial: int) -> int:
    try:
        return int(amount_rial) // 10
    except Exception:
        return 0


def get_bitpay_base_url() -> str:
    """
    Get BitPay base URL.
    طبق نمونه‌کد رسمی BitPay، آدرس صحیح https://bitpay.ir است
    و نه api.bitpay.ir؛ در صورت تنظیم اشتباه، اینجا تصحیح می‌شود.
    """
    base = getattr(settings, 'BITPAY_BASE_URL', 'https://bitpay.ir') or 'https://bitpay.ir'
    if 'api.bitpay.ir' in base:
        base = 'https://bitpay.ir'
    return base.rstrip('/')


def bitpay_gateway_verify(trans_id: str, id_get: str):
    """
    Verify BitPay payment using /payment/gateway-result-second.
    Returns (ok, result_dict_or_none, error_message_or_none).
    """
    base_url = get_bitpay_base_url()
    verify_url = f"{base_url}/payment/gateway-result-second"
    data = {
        'api': settings.BITPAY_API_KEY,
        'trans_id': trans_id,
        'id_get': id_get,
        'json': 1,
    }
    try:
        resp = requests.post(verify_url, data=data, timeout=20)
    except requests.exceptions.RequestException as e:
        logger.warning('BitPay verify connection error: %s', str(e))
        return False, None, 'خطا در ارتباط با درگاه برای تایید پرداخت'

    if resp.status_code != 200:
        logger.warning('BitPay verify bad status %s, body=%s', resp.status_code, resp.text[:200])
        return False, None, 'خطا در تایید پرداخت'

    try:
        result = resp.json()
    except ValueError:
        logger.warning('BitPay verify non-JSON response: %s', resp.text[:200])
        return False, None, 'پاسخ نامعتبر از درگاه'

    status_val = str(result.get('status', '')).strip()
    if status_val not in ('1', 'success', '200'):
        # وضعیت ناموفق
        return False, result, 'پرداخت ناموفق بود'

    return True, result, None


def bitpay_gateway_send(order: Order, amount_toman: int, description: str):
    """
    Call BitPay `/payment/gateway-send` and return (ok, redirect_url, error_message, id_get).
    amount_toman بر حسب تومان است؛ برای درگاه به ریال تبدیل می‌شود.
    id_get را در Payment.webhook_nonce ذخیره کنید تا در callback با آن پرداخت را پیدا کنیم.
    """
    base_url = get_bitpay_base_url()
    gateway_url = f"{base_url}/payment/gateway-send"
    rial_amount = toman_to_rial(amount_toman)
    data = {
        'api': settings.BITPAY_API_KEY,
        'redirect': settings.BITPAY_CALLBACK_URL or getattr(settings, 'FRONTEND_URL', ''),
        'amount': rial_amount,
        # BitPay فقط factorId عددی را به‌درستی برمی‌گرداند؛ از order_number استفاده می‌کنیم
        'factorId': getattr(order, 'order_number', '') or '',
        'name': getattr(order.customer, 'username', '') or '',
        'email': getattr(order.customer, 'email', '') or '',
        'description': description or '',
    }
    try:
        resp = requests.post(gateway_url, data=data, timeout=20)
    except requests.exceptions.RequestException as e:
        logger.warning('BitPay gateway-send connection error: %s', str(e))
        return False, None, 'خطا در اتصال به درگاه پرداخت'

    if resp.status_code != 200:
        logger.warning('BitPay gateway-send bad status %s, body=%s', resp.status_code, resp.text[:200])
        return False, None, 'خطا در اتصال به درگاه پرداخت'

    id_get = (resp.text or '').strip()
    try:
        if int(id_get) <= 0:
            logger.warning('BitPay gateway-send invalid id_get=%s', id_get)
            return False, None, 'خطای درگاه پرداخت'
    except ValueError:
        logger.warning('BitPay gateway-send non-numeric id_get=%s', id_get)
        return False, None, 'خطای درگاه پرداخت'

    redirect_url = f"{base_url}/payment/gateway-{id_get}-get"
    return True, redirect_url, None, id_get


def compute_order_payment_summary(order: Order) -> dict:
    """Compute material/project amounts (in Toman) and recommended payables. 4-phase payment (25% each)."""
    # Material
    material_total = 0
    material_paid = False
    try:
        if hasattr(order, 'material_estimate') and order.material_estimate:
            material_total = int(order.material_estimate.estimated_cost or 0)
            material_paid = bool(order.material_estimate.is_paid)
    except Exception:
        material_total = 0

    # Project proposal / total from accepted quote
    proposal_price = None
    try:
        accepted = order.proposals.filter(status='accepted').order_by('-created_at').first()
        if accepted:
            proposal_price = int(accepted.price)
    except Exception:
        proposal_price = None

    project_total = int(float(order.total_amount)) if (order.total_amount and float(order.total_amount) > 0) else (proposal_price or 0)
    phase_amount = int(project_total * 0.25) if project_total else 0  # 25% per phase

    # Which phases are paid: project_progress_phase=1 means phase 1 paid, =2 means phases 1&2 paid, etc.
    progress_phase = getattr(order, 'project_progress_phase', 0) or 0
    phases_paid = [progress_phase >= 1, progress_phase >= 2, progress_phase >= 3, progress_phase >= 4]
    # Also check Payment records (for backward compat with project_advance/project_final)
    for pt in ['project_phase_1', 'project_phase_2', 'project_phase_3', 'project_phase_4']:
        idx = int(pt.split('_')[-1]) - 1
        if 0 <= idx < 4 and order.payments.filter(payment_type=pt, status='paid').exists():
            phases_paid[idx] = True

    # suggested_next: which phase to pay next (1-4), or material first for manufacturing
    has_manufacturing = order.items.filter(service__type='manufacturing').exists()
    suggested_next = None
    if has_manufacturing and not material_paid and material_total > 0:
        suggested_next = 'material'
    elif project_total > 0:
        for i in range(4):
            if not phases_paid[i]:
                suggested_next = f'project_phase_{i + 1}'
                break

    return {
        'order_id': str(order.id),
        'order_number': order.order_number,
        'has_manufacturing': has_manufacturing,
        'material': {
            'total': material_total,
            'is_paid': material_paid,
        },
        'project': {
            'total': project_total,
            'phase_amount': phase_amount,
            'phase_1': {'amount': phase_amount, 'is_paid': phases_paid[0]},
            'phase_2': {'amount': phase_amount, 'is_paid': phases_paid[1]},
            'phase_3': {'amount': phase_amount, 'is_paid': phases_paid[2]},
            'phase_4': {'amount': phase_amount, 'is_paid': phases_paid[3]},
            'progress_phase': progress_phase,
        },
        'suggested_next_payment': suggested_next,
        'currency': 'TOMAN',
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_order_payment_summary(request, order_id: str):
    """Return a breakdown of material/project amounts for checkout UI."""
    try:
        if request.user.is_staff:
            order = Order.objects.get(id=order_id)
        else:
            order = Order.objects.get(id=order_id, customer=request.user)
        return Response(compute_order_payment_summary(order))
    except Order.DoesNotExist:
        return Response({'detail': 'سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    """Initiate a BitPay payment and create a Payment record (amount in Toman)."""
    serializer = ProcessPaymentSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    
    try:
        order = Order.objects.get(id=data['order'])
        # Only owner may initiate payment
        if order.customer != request.user and not request.user.is_staff:
            return Response({'detail': 'دسترسی غیرمجاز'}, status=status.HTTP_403_FORBIDDEN)

        # Create pending payment
        payment = Payment.objects.create(
            order=order,
            amount=data['amount'],
            payment_type=data['payment_type'],
            status='pending'
        )

        ok, redirect_url, error_msg, id_get = bitpay_gateway_send(
            order=order,
            amount_toman=int(data['amount']),
            description=data.get('description', ''),
        )
        if not ok or not redirect_url:
            return Response(
                {'detail': error_msg or 'خطای درگاه پرداخت'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        if id_get:
            payment.webhook_nonce = id_get
            payment.save(update_fields=['webhook_nonce'])

        # Return payment URL to client
        return Response({
            'payment_id': str(payment.id),
            'gateway': 'bitpay',
            'redirect_url': redirect_url,
        })
    except Order.DoesNotExist:
        return Response({'detail': 'سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def initiate_payment_material(request, order_id):
    """Initiate payment for material estimate"""
    try:
        order = Order.objects.get(id=order_id)
        if order.customer != request.user and not request.user.is_staff:
            return Response({'detail': 'دسترسی غیرمجاز'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get material estimate
        material_estimate = getattr(order, 'material_estimate', None)
        if not material_estimate:
            return Response({'detail': 'برآورد متریال برای این سفارش وجود ندارد'}, status=status.HTTP_404_NOT_FOUND)
        
        if material_estimate.is_paid:
            return Response({'detail': 'هزینه متریال قبلاً پرداخت شده است'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create payment data and call initiate_payment logic directly
        from .serializers import ProcessPaymentSerializer
        payment_data = {
            'order': str(order_id),
            'amount': material_estimate.estimated_cost,
            'payment_type': 'material',
            'description': request.data.get('description', 'پرداخت هزینه متریال')
        }
        serializer = ProcessPaymentSerializer(data=payment_data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        # Create pending payment
        payment = Payment.objects.create(
            order=order,
            amount=data['amount'],
            payment_type=data['payment_type'],
            status='pending'
        )

        ok, redirect_url, error_msg, id_get = bitpay_gateway_send(
            order=order,
            amount_toman=int(data['amount']),
            description=data.get('description', ''),
        )
        if not ok or not redirect_url:
            return Response(
                {'detail': error_msg or 'خطای درگاه پرداخت'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        if id_get:
            payment.webhook_nonce = id_get
            payment.save(update_fields=['webhook_nonce'])

        # Return payment URL to client
        return Response({
            'payment_id': str(payment.id),
            'gateway': 'bitpay',
            'redirect_url': redirect_url,
        })
    except Order.DoesNotExist:
        return Response({'detail': 'سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def initiate_payment_project_advance(request, order_id):
    """Initiate payment for project advance (50%)"""
    try:
        order = Order.objects.get(id=order_id)
        if order.customer != request.user and not request.user.is_staff:
            return Response({'detail': 'دسترسی غیرمجاز'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get payment summary
        summary = compute_order_payment_summary(order)
        advance_amount = summary['project']['advance_50']
        
        if advance_amount <= 0:
            return Response({'detail': 'مبلغ پیش‌پرداخت نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create payment data and call initiate_payment logic directly
        from .serializers import ProcessPaymentSerializer
        payment_data = {
            'order': str(order_id),
            'amount': advance_amount,
            'payment_type': 'project_advance',
            'description': request.data.get('description', 'پیش‌پرداخت پروژه (50%)')
        }
        serializer = ProcessPaymentSerializer(data=payment_data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        # Create pending payment
        payment = Payment.objects.create(
            order=order,
            amount=data['amount'],
            payment_type=data['payment_type'],
            status='pending'
        )

        ok, redirect_url, error_msg, id_get = bitpay_gateway_send(
            order=order,
            amount_toman=int(data['amount']),
            description=data.get('description', ''),
        )
        if not ok or not redirect_url:
            return Response(
                {'detail': error_msg or 'خطای درگاه پرداخت'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        if id_get:
            payment.webhook_nonce = id_get
            payment.save(update_fields=['webhook_nonce'])

        # Return payment URL to client
        return Response({
            'payment_id': str(payment.id),
            'gateway': 'bitpay',
            'redirect_url': redirect_url,
        })
    except Order.DoesNotExist:
        return Response({'detail': 'سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


def _initiate_phase_payment(request, order_id: str, phase: int) -> Response:
    """Helper: Initiate payment for project phase 1-4 (25% each). Amount in Toman, sent to gateway as Rials (×10)."""
    try:
        order = Order.objects.get(id=order_id)
        if order.customer != request.user and not request.user.is_staff:
            return Response({'detail': 'دسترسی غیرمجاز'}, status=status.HTTP_403_FORBIDDEN)

        summary = compute_order_payment_summary(order)
        phase_key = f'phase_{phase}'
        phase_data = summary['project'].get(phase_key, {})
        amount = phase_data.get('amount', 0)
        if phase_data.get('is_paid'):
            return Response({'detail': f'مرحله {phase} قبلاً پرداخت شده است'}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            return Response({'detail': 'مبلغ مرحله نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)

        payment_type = f'project_phase_{phase}'
        description = request.data.get('description', f'پرداخت مرحله {phase} پروژه (۲۵٪)')

        payment = Payment.objects.create(
            order=order,
            amount=amount,
            payment_type=payment_type,
            status='pending'
        )

        # درگاه پرداخت مبلغ را به ریال می‌خواهد؛ قیمت تومان × 10
        ok, redirect_url, error_msg, id_get = bitpay_gateway_send(
            order=order,
            amount_toman=int(amount),
            description=description,
        )
        if not ok or not redirect_url:
            return Response(
                {'detail': error_msg or 'خطای درگاه پرداخت'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        if id_get:
            payment.webhook_nonce = id_get
            payment.save(update_fields=['webhook_nonce'])

        return Response({
            'payment_id': str(payment.id),
            'gateway': 'bitpay',
            'redirect_url': redirect_url,
        })
    except Order.DoesNotExist:
        return Response({'detail': 'سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def initiate_payment_project_phase(request, order_id, phase: int):
    """Initiate payment for project phase 1-4 (25% each)."""
    if phase not in (1, 2, 3, 4):
        return Response({'detail': 'شماره مرحله باید بین ۱ تا ۴ باشد'}, status=status.HTTP_400_BAD_REQUEST)
    return _initiate_phase_payment(request, order_id, phase)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def initiate_payment_project_final(request, order_id):
    """Initiate payment for project final payment (50%) - kept for backward compatibility"""
    try:
        order = Order.objects.get(id=order_id)
        if order.customer != request.user and not request.user.is_staff:
            return Response({'detail': 'دسترسی غیرمجاز'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get payment summary
        summary = compute_order_payment_summary(order)
        final_amount = summary['project']['final_50']
        
        if final_amount <= 0:
            return Response({'detail': 'مبلغ تسویه نهایی نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create payment data and call initiate_payment logic directly
        from .serializers import ProcessPaymentSerializer
        payment_data = {
            'order': str(order_id),
            'amount': final_amount,
            'payment_type': 'project_final',
            'description': request.data.get('description', 'تسویه نهایی پروژه (50%)')
        }
        serializer = ProcessPaymentSerializer(data=payment_data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        # Create pending payment
        payment = Payment.objects.create(
            order=order,
            amount=data['amount'],
            payment_type=data['payment_type'],
            status='pending'
        )

        ok, redirect_url, error_msg, id_get = bitpay_gateway_send(
            order=order,
            amount_toman=int(data['amount']),
            description=data.get('description', ''),
        )
        if not ok or not redirect_url:
            return Response(
                {'detail': error_msg or 'خطای درگاه پرداخت'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        if id_get:
            payment.webhook_nonce = id_get
            payment.save(update_fields=['webhook_nonce'])

        # Return payment URL to client
        return Response({
            'payment_id': str(payment.id),
            'gateway': 'bitpay',
            'redirect_url': redirect_url,
        })
    except Order.DoesNotExist:
        return Response({'detail': 'سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def bitpay_webhook(request):
    """
    Handle BitPay callback/webhook to confirm payment and update order status.

    - GET: کاربر بعد از پرداخت به این آدرس هدایت می‌شود (?trans_id=&id_get=)
           و ما با gateway-result-second وضعیت را استعلام می‌کنیم.
    - POST: وبهوک (در صورت استفاده از وبهوک JSON جداگانه)
    """
    try:
        # 1) حالت GET: callback پس از بازگشت کاربر از درگاه
        if request.method == 'GET':
            trans_id = request.query_params.get('trans_id') or request.query_params.get('transaction_id') or ''
            id_get = request.query_params.get('id_get') or request.query_params.get('id') or ''
            if not trans_id or not id_get:
                return Response({'detail': 'پارامترهای بازگشت از درگاه نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)

            ok, result, error_msg = bitpay_gateway_verify(trans_id, id_get)
            if not ok:
                # اگر پاسخ معتبر ولی ناموفق بود، همچنان نتیجه را برمی‌گردانیم
                return Response(
                    {
                        'detail': error_msg or 'پرداخت ناموفق بود',
                        'result': result or {},
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # اول با id_get پرداخت معلق را پیدا کنیم (در زمان ایجاد درگاه webhook_nonce را ست کرده‌ایم)
            payment_by_nonce = Payment.objects.filter(webhook_nonce=id_get, status='pending').select_related('order').first()
            if payment_by_nonce:
                order = payment_by_nonce.order
                payment = payment_by_nonce
            else:
                # fallback: پیدا کردن سفارش از factorId برگشتی از درگاه
                factor_id = str(result.get('factorId') or result.get('factor_id') or '').strip()
                if not factor_id or factor_id == '0':
                    return Response({'detail': 'شناسه سفارش (factorId) نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)

                order = Order.objects.filter(order_number=factor_id).first()
                if not order and factor_id.isdigit():
                    order = Order.objects.filter(order_number__endswith=factor_id).first()
                if not order:
                    order = Order.objects.filter(order_number__icontains=factor_id).first()
                if not order:
                    logger.warning('BitPay webhook: no order for factorId=%r', factor_id)
                    return Response({'detail': 'سفارش مرتبط با این پرداخت یافت نشد'}, status=status.HTTP_404_NOT_FOUND)

                payment = order.payments.filter(status='pending').order_by('-created_at').first()
                if not payment:
                    return Response({'detail': 'پرداخت معلق برای این سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)

            # Idempotency first: if we already processed this trans_id, return success (retries get 200, not 404)
            existing_paid = order.payments.filter(gateway_transaction_id=trans_id, status='paid').first()
            if existing_paid:
                amount_rial = int(str(result.get('amount', 0)) or 0)
                amount_toman = rial_to_toman(amount_rial)
                return Response(
                    {
                        'detail': 'پرداخت قبلاً تایید شده است',
                        'order_id': str(order.id),
                        'amount_toman': amount_toman,
                        'payment_type': existing_paid.payment_type,
                    }
                )

            amount_rial = int(str(result.get('amount', 0)) or 0)
            amount_toman = rial_to_toman(amount_rial)

            payment.status = 'paid'
            payment.gateway_transaction_id = trans_id
            payment.gateway_response = result
            payment.paid_at = timezone.now()
            payment.save()

            # اعمال لاجیک تجاری مشابه وبهوک قبلی
            if payment.payment_type == 'material':
                try:
                    material_estimate = order.material_estimate
                    material_estimate.is_paid = True
                    material_estimate.save()
                except MaterialEstimate.DoesNotExist:
                    pass
                order.status = 'material_paid'
                order.save()
                OrderStatus.objects.create(order=order, status='material_paid', description='پرداخت متریال تایید شد')
            elif payment.payment_type in ('project_advance', 'project_phase_1'):
                order.status = 'project_paid'
                order.project_progress_phase = 1
                order.save()
                OrderStatus.objects.create(order=order, status='project_paid', description='پرداخت مرحله ۱ تایید شد - ددلاین پروژه آغاز شد')
                _notify_contractor_on_payment(order, payment)
            elif payment.payment_type == 'project_phase_2':
                order.project_progress_phase = 2
                order.save()
                OrderStatus.objects.create(order=order, status='project_paid', description='پرداخت مرحله ۲ تایید شد')
                _notify_contractor_on_payment(order, payment)
            elif payment.payment_type == 'project_phase_3':
                order.project_progress_phase = 3
                order.save()
                OrderStatus.objects.create(order=order, status='project_paid', description='پرداخت مرحله ۳ تایید شد')
                _notify_contractor_on_payment(order, payment)
            elif payment.payment_type in ('project_final', 'project_phase_4'):
                order.project_progress_phase = 4
                order.status = 'shipping'
                order.save()
                OrderStatus.objects.create(order=order, status='shipping', description='تسویه نهایی تایید شد - ارسال در حال انجام')
                _notify_contractor_on_payment(order, payment)

            return Response(
                {
                    'detail': 'پرداخت تایید شد',
                    'order_id': str(order.id),
                    'amount_toman': amount_toman,
                    'payment_type': payment.payment_type,
                }
            )

        # 2) حالت POST: وبهوک JSON (در صورت پشتیبانی در آینده)
        payload = request.data if hasattr(request, 'data') else {}
        # Optional HMAC verification if BitPay provides signature in headers (example: X-BitPay-Signature)
        signature = request.META.get('HTTP_X_BITPAY_SIGNATURE') or request.headers.get('X-BitPay-Signature') if hasattr(request, 'headers') else None
        if signature and settings.BITPAY_WEBHOOK_SECRET:
            try:
                raw_body = request.body
                expected = hmac.new(settings.BITPAY_WEBHOOK_SECRET.encode('utf-8'), raw_body, hashlib.sha256).hexdigest()
                if not hmac.compare_digest(expected, signature):
                    logger.warning('BitPay webhook signature mismatch')
                    return Response({'detail': 'امضای وبهوک نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.warning('BitPay webhook signature check error: %s', str(e))
        order_id = payload.get('order_id')
        amount_rial = int(str(payload.get('amount', 0)) or 0)
        trans_id = str(payload.get('trans_id') or payload.get('transaction_id') or '')
        nonce = str(payload.get('nonce') or '')

        if not order_id:
            return Response({'detail': 'شناسه سفارش نامعتبر است'}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.get(id=order_id)
        amount_toman = rial_to_toman(amount_rial)

        # Idempotency: if we already processed this transaction id or nonce, ignore
        if trans_id and order.payments.filter(gateway_transaction_id=trans_id, status='paid').exists():
            return Response({'detail': 'قبلا پردازش شده است'})

        payment = order.payments.filter(status='pending').order_by('-created_at').first()
        if not payment:
            return Response({'detail': 'پرداخت معلق یافت نشد'}, status=status.HTTP_404_NOT_FOUND)

        # Verify with BitPay verify endpoint for security (recommended by their docs)
        verify_ok = False
        try:
            verify_payload = { 'api': settings.BITPAY_API_KEY, 'trans_id': trans_id }
            vresp = requests.post(f"{get_bitpay_base_url()}/api/verify", json=verify_payload, timeout=20)
            if vresp.status_code == 200:
                vbody = vresp.json()
                verify_ok = bool(vbody.get('success'))
        except Exception:
            verify_ok = False

        if verify_ok:
            payment.status = 'paid'
            payment.gateway_transaction_id = str(payload.get('trans_id') or payload.get('transaction_id') or '')
            payment.gateway_response = payload
            payment.paid_at = timezone.now()
            if nonce:
                payment.webhook_nonce = nonce
            payment.save()

            # Apply business rules by type (همانند بالا)
            if payment.payment_type == 'material':
                try:
                    material_estimate = order.material_estimate
                    material_estimate.is_paid = True
                    material_estimate.save()
                except MaterialEstimate.DoesNotExist:
                    pass
                order.status = 'material_paid'
                order.save()
                OrderStatus.objects.create(order=order, status='material_paid', description='پرداخت متریال تایید شد')
            elif payment.payment_type in ('project_advance', 'project_phase_1'):
                order.status = 'project_paid'
                order.project_progress_phase = 1
                order.save()
                OrderStatus.objects.create(order=order, status='project_paid', description='پرداخت مرحله ۱ تایید شد - ددلاین پروژه آغاز شد')
                _notify_contractor_on_payment(order, payment)
            elif payment.payment_type == 'project_phase_2':
                order.project_progress_phase = 2
                order.save()
                OrderStatus.objects.create(order=order, status='project_paid', description='پرداخت مرحله ۲ تایید شد')
                _notify_contractor_on_payment(order, payment)
            elif payment.payment_type == 'project_phase_3':
                order.project_progress_phase = 3
                order.save()
                OrderStatus.objects.create(order=order, status='project_paid', description='پرداخت مرحله ۳ تایید شد')
                _notify_contractor_on_payment(order, payment)
            elif payment.payment_type in ('project_final', 'project_phase_4'):
                order.project_progress_phase = 4
                order.status = 'shipping'
                order.save()
                OrderStatus.objects.create(order=order, status='shipping', description='تسویه نهایی تایید شد - ارسال در حال انجام')
                _notify_contractor_on_payment(order, payment)

            return Response({'detail': 'پرداخت تایید شد'})
        else:
            payment.status = 'failed'
            payment.gateway_response = payload
            payment.save()
            return Response({'detail': 'پرداخت ناموفق بود'}, status=status.HTTP_400_BAD_REQUEST)
    except Order.DoesNotExist:
        return Response({'detail': 'سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.exception('BitPay webhook error: %s', str(e))
        return Response({'detail': 'خطای داخلی سرور'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class QuoteFilter(filters_drf.FilterSet):
    status = filters_drf.ChoiceFilter(choices=Quote.status.field.choices)
    contractor = filters_drf.CharFilter(field_name='contractor__username')
    min_price = filters_drf.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = filters_drf.NumberFilter(field_name='price', lookup_expr='lte')
    min_delivery_days = filters_drf.NumberFilter(field_name='delivery_days', lookup_expr='gte')
    max_delivery_days = filters_drf.NumberFilter(field_name='delivery_days', lookup_expr='lte')
    
    class Meta:
        model = Quote
        fields = ['status', 'contractor', 'min_price', 'max_price', 'min_delivery_days', 'max_delivery_days']


class TicketFilter(filters_drf.FilterSet):
    status = filters_drf.ChoiceFilter(choices=Ticket.status.field.choices)
    priority = filters_drf.ChoiceFilter(choices=Ticket.priority.field.choices)
    category = filters_drf.CharFilter(field_name='category__name')
    creator = filters_drf.CharFilter(field_name='creator__username')
    created_after = filters_drf.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = filters_drf.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        model = Ticket
        fields = ['status', 'priority', 'category', 'creator', 'created_after', 'created_before']


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    """Health check endpoint for Docker and load balancers"""
    # Keep this endpoint dependency-free from DB/cache/timezone to avoid failing container health
    return Response({
        "status": "ok"
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def csrf_token(request):
    """Get CSRF token for frontend"""
    token = get_token(request)
    return Response({
        "csrfToken": token
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def version_info(request):
    """Get API version information"""
    return Response(get_version_info())


@api_view(["GET"])
@permission_classes([AllowAny])
def api_status(request):
    """Get comprehensive API status"""
    return Response({
        'status': 'operational',
        'version': request.version or 'v1',
        'timestamp': timezone.now().isoformat(),
        'services': {
            'database': 'operational',
            'authentication': 'operational',
            'file_upload': 'operational',
            'notifications': 'operational'
        },
        'uptime': '99.9%',
        'response_time': '< 100ms'
    })


@api_view(["POST"]) 
@permission_classes([AllowAny])
def customer_register(request):
    """Customer registration with Turnstile validation"""
    from .serializers import CustomerRegisterSerializer
    serializer = CustomerRegisterSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    
    # Return success response with user data and phone verification info
    return Response({
        'success': True,
        'message': 'ثبت‌نام با موفقیت انجام شد. لطفاً شماره تلفن خود را تأیید کنید.',
        'user': UserSerializer(user).data,
        'phone_verification_required': True,
        'phone': user.phone
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"]) 
@permission_classes([AllowAny])
def contractor_register(request):
    """Contractor registration with Turnstile validation"""
    from .serializers import ContractorRegisterSerializer
    serializer = ContractorRegisterSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    
    # Return success response with user data and phone verification info
    return Response({
        'success': True,
        'message': 'ثبت‌نام پیمانکار با موفقیت انجام شد. لطفاً شماره تلفن خود را تأیید کنید.',
        'user': UserSerializer(user).data,
        'phone_verification_required': True,
        'phone': user.phone
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"]) 
@permission_classes([AllowAny])
def specialist_register(request):
    """Specialist registration"""
    from .serializers import CustomerRegisterSerializer
    from .models import Role, UserRole
    
    # Use CustomerRegisterSerializer for basic user creation
    serializer = CustomerRegisterSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    
    # Assign specialist role to the user
    try:
        specialist_role = Role.objects.get(name='specialist')
    except Role.DoesNotExist:
        # If specialist role doesn't exist, create it
        specialist_role = Role.objects.create(
            name='specialist',
            display_name='نیروی متخصص',
            description='نیروهای متخصص جویای کار'
        )
    
    # Create UserRole if it doesn't exist
    UserRole.objects.get_or_create(
        user=user,
        role=specialist_role,
        defaults={'is_active': True}
    )
    
    # Return success response with user data and phone verification info
    return Response({
        'success': True,
        'message': 'ثبت‌نام نیروی متخصص با موفقیت انجام شد. لطفاً شماره تلفن خود را تأیید کنید.',
        'user': UserSerializer(user).data,
        'phone_verification_required': True,
        'phone': user.phone
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """Login with Turnstile validation"""
    from .utils.jwt_utils import JWTManager
    
    serializer = LoginSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    
    user = serializer.validated_data['user']
    
    # Generate JWT tokens using JWTManager
    try:
        tokens = JWTManager.create_tokens_for_user(user)
        
        # Determine user role for proper redirect
        user_roles = user.roles.all() if hasattr(user, 'roles') else []
        role_names = [role.role.name for role in user_roles if role.role] if user_roles else []
        
        # Determine dashboard URL based on role
        # Admin must take precedence if user has multiple roles
        dashboard_url = '/'
        if 'admin' in role_names:
            dashboard_url = '/admin/dashboard'
        elif 'contractor' in role_names:
            dashboard_url = '/contractor-dashboard'
        elif 'customer' in role_names:
            dashboard_url = '/dashboard'
        
        return Response({
            'success': True,
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'access_expires': tokens['access_expires'],
            'refresh_expires': tokens['refresh_expires'],
            'user': UserSerializer(user).data,
            'roles': role_names,
            'dashboard_url': dashboard_url,
            'message': 'ورود با موفقیت انجام شد'
        })
    except Exception as e:
        return Response({
            'error': True,
            'message': 'خطا در ایجاد توکن',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_token(request):
    """Refresh JWT access token"""
    from .utils.jwt_utils import JWTManager
    
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response({
            'error': True,
            'message': 'توکن تازه‌سازی مورد نیاز است',
            'code': 'refresh_token_required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    result = JWTManager.refresh_access_token(refresh_token)
    
    if result['success']:
        return Response({
            'access': result['access'],
            'access_expires': result['access_expires']
        })
    else:
        return Response({
            'error': True,
            'message': result['message'],
            'code': result['error']
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout user and blacklist refresh token"""
    from rest_framework_simplejwt.tokens import RefreshToken
    from rest_framework_simplejwt.exceptions import TokenError
    
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({
            'message': 'با موفقیت خارج شدید'
        })
    except TokenError:
        return Response({
            'error': True,
            'message': 'توکن نامعتبر است'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': True,
            'message': 'خطا در خروج از سیستم',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"]) 
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_my_profile(request):
    """Update current user profile (organization, first_name, last_name)."""
    user = request.user
    data = request.data
    if isinstance(data.get('organization'), str):
        user.organization = data['organization'].strip()[:200]
    if isinstance(data.get('first_name'), str):
        user.first_name = data['first_name'].strip()[:150]
    if isinstance(data.get('last_name'), str):
        user.last_name = data['last_name'].strip()[:150]
    user.save(update_fields=['organization', 'first_name', 'last_name', 'updated_at'])
    return Response(UserSerializer(user).data)


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
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ServiceFilter
    search_fields = ['name', 'description', 'scope__display_name']
    ordering_fields = ['name', 'base_price', 'created_at', 'estimated_delivery_days']
    ordering = ['name']



class ServiceTabViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ServiceTab.objects.filter(is_active=True).select_related('service').order_by('service', 'order')
    serializer_class = ServiceTabSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        service_id = self.request.query_params.get('service')
        
        if service_id:
            queryset = queryset.filter(service_id=service_id)
        
        return queryset




class ServiceFieldViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ServiceField.objects.all().select_related('service', 'tab')
    serializer_class = ServiceFieldSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        service_id = self.request.query_params.get('service')
        tab_id = self.request.query_params.get('tab')
        
        if service_id:
            if tab_id:
                # فیلدهای مخصوص یک تب (فقط اگر تب فعال باشد)
                queryset = queryset.filter(
                    service_id=service_id, 
                    tab_id=tab_id,
                    tab__is_active=True
                )
            else:
                # همه فیلدهای سرویس (فیلدهای بدون تب + فیلدهای تب‌های فعال)
                queryset = queryset.filter(
                    service_id=service_id
                ).filter(
                    models.Q(tab__isnull=True) | models.Q(tab__is_active=True)
                )
        
        return queryset.order_by('tab', 'order', 'name')


class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.select_related('customer').all().order_by('-created_at')
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]


class CartItemViewSet(viewsets.ModelViewSet):
    queryset = CartItem.objects.select_related('cart', 'service').all().order_by('-added_at')
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related('customer').all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = OrderFilter
    search_fields = ['order_number', 'customer__username', 'notes']
    ordering_fields = ['created_at', 'updated_at', 'total_amount', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        # Users can only see their own orders unless they're admin
        if self.request.user.is_staff:
            return Order.objects.select_related('customer').all()
        return Order.objects.filter(customer=self.request.user).select_related('customer')

    def perform_destroy(self, instance):
        # Admin can delete any order, users can only delete submitted ones
        if not self.request.user.is_staff and instance.status != 'submitted':
            raise PermissionDenied("فقط سفارش‌های ثبت شده قابل حذف هستند.")
        instance.delete()

    def perform_update(self, serializer):
        instance = serializer.instance
        if instance.status != 'submitted':
            raise PermissionDenied("فقط سفارش‌های ثبت شده قابل ویرایش هستند.")
        
        order = serializer.save()
        
        # Notify contractors about order update
        # This is a heavy operation if there are many contractors, so use it carefully
        # ideally this should be a background task
        try:
            contractors = User.objects.filter(user_roles__role__name='contractor', user_roles__is_active=True)
            for contractor in contractors:
                # Avoid notifying the customer if they are also a contractor
                if contractor != order.customer:
                    create_notification(
                        user=contractor,
                        notification_type='order_status', # Reusing existing type or use 'system'
                        title='بروزرسانی سفارش',
                        message=f'سفارش شماره {order.order_number} ویرایش شد.',
                        related_order=order
                    )
        except Exception as e:
            logger.error(f"Error notifying contractors: {e}")


class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.select_related('order', 'service', 'assigned_contractor').all()
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]


class QuoteViewSet(viewsets.ModelViewSet):
    queryset = Quote.objects.select_related('order_item', 'contractor').all()
    serializer_class = QuoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = QuoteFilter
    search_fields = ['contractor__username', 'notes', 'order_item__service__name']
    ordering_fields = ['created_at', 'price', 'delivery_days', 'status']
    ordering = ['-created_at']
    
    def perform_update(self, serializer):
        quote = serializer.save()
        
        # Notify customer about quote update
        try:
            order = quote.order_item.order
            create_notification(
                user=order.customer,
                notification_type='quote_received',
                title='پیشنهاد ویرایش شد',
                message=f'پیمانکار {quote.contractor.username} پیشنهاد خود را برای سفارش {order.order_number} ویرایش کرد',
                related_order=order,
                related_quote=quote
            )
        except Exception as e:
            logger.error(f"Error notifying customer about quote update: {e}")
    
    def get_queryset(self):
        # Users can see quotes for their orders or their own quotes
        if self.request.user.is_staff:
            return Quote.objects.select_related('order_item', 'contractor').all()
        return Quote.objects.filter(
            models.Q(order_item__order__customer=self.request.user) | 
            models.Q(contractor=self.request.user)
        ).select_related('order_item', 'contractor')


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.select_related('category', 'creator', 'order').all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TicketFilter
    search_fields = ['subject', 'creator__username', 'category__display_name']
    ordering_fields = ['created_at', 'last_activity_at', 'priority', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        # Users can see their own tickets or tickets they participate in
        if self.request.user.is_staff:
            return Ticket.objects.select_related('category', 'creator', 'order').all()
        return Ticket.objects.filter(
            models.Q(creator=self.request.user) | 
            models.Q(participants__user=self.request.user)
        ).select_related('category', 'creator', 'order').distinct()
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'destroy':
            # Only admins can delete tickets
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['post'])
    def respond(self, request, pk=None):
        """Admin response to ticket"""
        if not request.user.is_staff:
            return Response({'detail': 'فقط مدیران می‌توانند پاسخ دهند'}, status=status.HTTP_403_FORBIDDEN)
        
        ticket = self.get_object()
        content = request.data.get('content', '')
        
        if not content:
            return Response({'detail': 'محتوای پاسخ الزامی است'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create admin response message
        message = TicketMessage.objects.create(
            ticket=ticket,
            sender=request.user,
            content=content,
            is_internal=False  # Admin responses are visible to customer
        )
        
        # Update ticket status
        ticket.status = 'waiting_response'
        ticket.last_activity_at = timezone.now()
        ticket.save()
        
        serializer = TicketMessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close ticket (admin only)"""
        if not request.user.is_staff:
            return Response({'detail': 'فقط مدیران می‌توانند تیکت را ببندند'}, status=status.HTTP_403_FORBIDDEN)
        
        ticket = self.get_object()
        ticket.status = 'closed'
        ticket.last_activity_at = timezone.now()
        ticket.save()
        
        serializer = self.get_serializer(ticket)
        return Response(serializer.data)


class TicketMessageViewSet(viewsets.ModelViewSet):
    queryset = TicketMessage.objects.select_related('ticket', 'sender').all()
    serializer_class = TicketMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can see messages from their own tickets
        if self.request.user.is_staff:
            return TicketMessage.objects.select_related('ticket', 'sender').all()
        return TicketMessage.objects.filter(
            models.Q(ticket__creator=self.request.user) | 
            models.Q(ticket__participants__user=self.request.user)
        ).select_related('ticket', 'sender').distinct()


class TicketAttachmentViewSet(viewsets.ModelViewSet):
    queryset = TicketAttachment.objects.select_related('message', 'file_type').all()
    serializer_class = TicketAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can see attachments from their own tickets
        if self.request.user.is_staff:
            return TicketAttachment.objects.select_related('message', 'file_type').all()
        return TicketAttachment.objects.filter(
            models.Q(message__ticket__creator=self.request.user) | 
            models.Q(message__ticket__participants__user=self.request.user)
        ).select_related('message', 'file_type').distinct()


class TicketFileTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TicketFileType.objects.filter(is_active=True)
    serializer_class = TicketFileTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class TicketCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TicketCategory.objects.all().order_by('name')
    serializer_class = TicketCategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class ContentFilterLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ContentFilterLog.objects.select_related('user', 'reviewed_by').all()
    serializer_class = ContentFilterLogSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__username', 'violation_type', 'detected_content']
    ordering_fields = ['created_at', 'confidence_score']
    ordering = ['-created_at']


class MaterialEstimationViewSet(viewsets.ModelViewSet):
    """ViewSet for Material Estimation management"""
    queryset = MaterialEstimation.objects.all().select_related(
        'order_item__order__customer', 'order_item__service', 'estimator'
    ).order_by('-created_at')
    serializer_class = MaterialEstimationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'order_item__order__customer', 'estimator']
    search_fields = ['material_name', 'material_type', 'supplier_name']
    ordering_fields = ['created_at', 'total_price', 'delivery_time']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MaterialEstimationCreateSerializer
        return MaterialEstimationSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by order item if provided
        order_item_id = self.request.query_params.get('order_item')
        if order_item_id:
            queryset = queryset.filter(order_item_id=order_item_id)
        
        # Filter by order if provided
        order_id = self.request.query_params.get('order')
        if order_id:
            queryset = queryset.filter(order_item__order_id=order_id)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve material estimation"""
        estimation = self.get_object()
        estimation.status = 'approved'
        estimation.approved_by = request.user
        estimation.approved_at = timezone.now()
        estimation.save()
        
        serializer = self.get_serializer(estimation)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject material estimation"""
        estimation = self.get_object()
        rejection_reason = request.data.get('rejection_reason', '')
        
        estimation.status = 'rejected'
        estimation.rejection_reason = rejection_reason
        estimation.save()
        
        serializer = self.get_serializer(estimation)
        return Response(serializer.data)


class OrderStatusLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Order Status Log - Admin only"""
    queryset = OrderStatusLog.objects.all().select_related(
        'order__customer', 'changed_by'
    ).order_by('-changed_at')
    serializer_class = OrderStatusLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['order', 'changed_by', 'new_status']
    search_fields = ['order__order_number', 'changed_by__username', 'reason']
    ordering_fields = ['changed_at', 'order__order_number']
    ordering = ['-changed_at']
    
    def get_queryset(self):
        # Only admins can see status logs
        if self.request.user.is_staff:
            return OrderStatusLog.objects.all().select_related(
                'order__customer', 'changed_by'
            ).order_by('-changed_at')
        return OrderStatusLog.objects.none()
    
    @action(detail=False, methods=['get'])
    def by_order(self, request):
        """Get status logs for a specific order"""
        order_id = request.query_params.get('order_id')
        if not order_id:
            return Response({'detail': 'order_id parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        logs = self.get_queryset().filter(order_id=order_id)
        serializer = self.get_serializer(logs, many=True)
        return Response(serializer.data)


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.select_related('order_item', 'customer', 'contractor', 'approved_by').all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]




class ScientificContentViewSet(viewsets.ModelViewSet):
    queryset = ScientificContent.objects.filter(status='published').select_related('author').order_by('-published_at')
    serializer_class = ScientificContentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['content_type', 'category', 'author']
    search_fields = ['title', 'excerpt', 'content']
    ordering_fields = ['published_at', 'view_count', 'like_count']
    ordering = ['-published_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ScientificContentListSerializer
        elif self.action == 'create':
            return ScientificContentCreateSerializer
        return ScientificContentSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by content type
        content_type = self.request.query_params.get('content_type')
        if content_type:
            queryset = queryset.filter(content_type=content_type)
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        return queryset


# Workforce Management Viewsets

class JobSeekerViewSet(viewsets.ModelViewSet):
    """ViewSet for job seeker profiles"""
    serializer_class = JobSeekerSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        """Users can see their own profile, admins and support can see all"""
        from .models import Role
        
        # Check if user is admin or support staff
        is_admin_or_support = False
        if self.request.user.is_staff:
            is_admin_or_support = True
        else:
            # Check user roles
            user_roles = self.request.user.user_roles.filter(is_active=True).select_related('role')
            is_admin_or_support = any(
                role.role.name in ['admin', 'support'] 
                for role in user_roles
            )
        
        if is_admin_or_support:
            return JobSeeker.objects.select_related('user', 'service_scope').prefetch_related('services').all()
        return JobSeeker.objects.filter(user=self.request.user).select_related('user', 'service_scope').prefetch_related('services')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return JobSeekerCreateSerializer
        return JobSeekerSerializer


class WorkRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for work requests"""
    serializer_class = WorkRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        """Contractors can see their own requests, admins can see all"""
        if self.request.user.is_staff:
            return WorkRequest.objects.select_related('contractor', 'workshop', 'service_scope').prefetch_related('required_services').all()
        return WorkRequest.objects.filter(contractor=self.request.user).select_related('contractor', 'workshop', 'service_scope').prefetch_related('required_services')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return WorkRequestCreateSerializer
        return WorkRequestSerializer


class JobMatchViewSet(viewsets.ModelViewSet):
    """ViewSet for job matches"""
    serializer_class = JobMatchSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        """Admins can see all matches, users can see their own matches"""
        if self.request.user.is_staff:
            return JobMatch.objects.select_related('work_request', 'job_seeker', 'suggested_by', 'work_request__contractor').all()
        
        # Filter matches where user is contractor or job seeker
        return JobMatch.objects.filter(
            models.Q(work_request__contractor=self.request.user) |
            models.Q(job_seeker__user=self.request.user)
        ).select_related('work_request', 'job_seeker', 'work_request__contractor')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return JobMatchCreateSerializer
        return JobMatchSerializer


class WorkContractViewSet(viewsets.ModelViewSet):
    """ViewSet for work contracts"""
    serializer_class = WorkContractSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        """Contractors and job seekers can see their own contracts, admins can see all"""
        if self.request.user.is_staff:
            return WorkContract.objects.select_related('work_request', 'job_seeker', 'contractor').all()
        
        # Filter contracts where user is contractor or job seeker
        return WorkContract.objects.filter(
            models.Q(contractor=self.request.user) |
            models.Q(job_seeker__user=self.request.user)
        ).select_related('work_request', 'job_seeker', 'contractor')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return WorkContractCreateSerializer
        return WorkContractSerializer


class SpecialistProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for specialist profiles"""
    serializer_class = SpecialistProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        """Users can see their own profile, admins can see all"""
        from .models import Role
        
        # Check if user is admin or support staff
        is_admin_or_support = False
        if self.request.user.is_staff:
            is_admin_or_support = True
        else:
            # Check user roles
            user_roles = self.request.user.user_roles.filter(is_active=True).select_related('role')
            is_admin_or_support = any(
                role.role.name in ['admin', 'support'] 
                for role in user_roles
            )
        
        if is_admin_or_support:
            return SpecialistProfile.objects.select_related('user', 'reviewed_by').prefetch_related('specializations', 'specialization_services').all()
        return SpecialistProfile.objects.filter(user=self.request.user).select_related('user').prefetch_related('specializations', 'specialization_services')
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return SpecialistProfileCreateSerializer
        return SpecialistProfileSerializer


class SpecialistHireRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for specialist hire requests"""
    serializer_class = SpecialistHireRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        """Admins can see all requests, users can see their own requests"""
        if self.request.user.is_staff:
            return SpecialistHireRequest.objects.select_related('requester', 'specialist_profile', 'handled_by').all()
        return SpecialistHireRequest.objects.filter(requester=self.request.user).select_related('requester', 'specialist_profile')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SpecialistHireRequestCreateSerializer
        return SpecialistHireRequestSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def get_scientific_content_categories(request):
    """دریافت دسته‌بندی‌های محتوای علمی (آرایه مستقیم)"""
    categories = ScientificContent.CATEGORY_CHOICES
    return Response([
        {'value': value, 'label': label} for value, label in categories
    ])


class UploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({
                'error': True,
                'message': 'فایل الزامی است',
                'details': 'لطفاً یک فایل انتخاب کنید',
                'code': 'file_required'
            }, status=status.HTTP_400_BAD_REQUEST)
        ext = os.path.splitext(file_obj.name)[1]
        new_name = f"{uuid4().hex}{ext}"
        rel_path = f"uploads/{new_name}"

        # Try saving to MEDIA_ROOT; on permission error, fall back to /tmp/uploads
        saved_ok = False
        error_msg = None
        try:
            upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
            os.makedirs(upload_dir, exist_ok=True)
            dest_path = os.path.join(upload_dir, new_name)
            with open(dest_path, 'wb') as dest:
                for chunk in file_obj.chunks():
                    dest.write(chunk)
            saved_ok = True
        except Exception as e:
            error_msg = str(e)
        
        if not saved_ok:
            return Response({
                'error': True,
                'message': 'آپلود فایل ناموفق بود',
                'details': 'خطا در ذخیره فایل. لطفاً دوباره تلاش کنید',
                'code': 'upload_failed'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # Validate/normalize context_id to UUID if provided; otherwise generate one
        raw_context_id = request.data.get('context_id')
        try:
            context_uuid = uuid4() if not raw_context_id else uuid4() if len(str(raw_context_id)) == 0 else __import__('uuid').UUID(str(raw_context_id))
        except Exception:
            context_uuid = uuid4()

        media = MediaFile.objects.create(
            filename=new_name,
            original_name=file_obj.name,
            file_path=rel_path,
            mime_type=file_obj.content_type or '',
            file_size=file_obj.size,
            uploaded_by=request.user,
            context=request.data.get('context', 'other'),
            context_id=context_uuid,
        )
        # Build URL; if MEDIA_URL not usable in current env, return relative path
        url = f"{settings.MEDIA_URL}{rel_path}" if getattr(settings, 'MEDIA_URL', None) else rel_path
        return Response({'id': str(media.id), 'url': url, 'original_name': media.original_name})


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_request(request):
    """Request password reset"""
    serializer = PasswordResetRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    email = serializer.validated_data['email']
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'detail': 'کاربری با این ایمیل یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
    
    # Generate token
    token = get_random_string(50)
    expires_at = timezone.now() + timezone.timedelta(hours=1)
    
    # Create password reset token
    PasswordResetToken.objects.create(
        user=user,
        token=token,
        expires_at=expires_at
    )
    
    # Send email (in production, you would send actual email)
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    
    # For development, just return the URL
    return Response({
        'detail': 'لینک بازنشانی رمز عبور ارسال شد',
        'reset_url': reset_url  # Only for development
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def sms_credit(request):
    """Get SMS credit balance"""
    from .services.sms_service import sms_service
    
    # Only admin users can check SMS credit
    if not request.user.is_staff:
        return Response({'detail': 'دسترسی غیرمجاز'}, status=status.HTTP_403_FORBIDDEN)
    
    credit_result = sms_service.get_credit()
    
    if credit_result['success']:
        return Response({
            'credit': credit_result['credit'],
            'message': credit_result['message']
        })
    else:
        return Response({
            'error': credit_result['error']
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_request_sms(request):
    """Request password reset via SMS"""
    from .services.sms_service import sms_service
    from django.conf import settings
    
    serializer = PasswordResetRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    email = serializer.validated_data['email']
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'detail': 'کاربری با این ایمیل یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user has phone number
    if not user.phone:
        return Response({'detail': 'شماره تلفن برای این کاربر ثبت نشده است'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check rate limiting
    if sms_service.rate_limit_check(user.phone, 'password_reset'):
        return Response({
            'detail': 'درخواست بازیابی رمز عبور بیش از حد مجاز است. لطفاً چند دقیقه صبر کنید.'
        }, status=status.HTTP_429_TOO_MANY_REQUESTS)
    
    # Generate 6-digit code
    code = ''.join(random.choices(string.digits, k=6))
    expires_at = timezone.now() + timezone.timedelta(minutes=10)  # 10 minutes
    
    # Clean up old unused tokens for this user
    PasswordResetToken.objects.filter(user=user, is_used=False).delete()
    
    # Create password reset token with SMS code
    PasswordResetToken.objects.create(
        user=user,
        token=code,  # Use code as token for SMS reset
        expires_at=expires_at
    )
    
    # Send SMS using SMS.ir
    template_id = getattr(settings, 'SMS_TEMPLATE_ID_PASSWORD_RESET', None)
    sms_result = sms_service.send_password_reset_code(user.phone, code, template_id)
    
    if sms_result['success']:
        logger.info(f"Password reset SMS sent successfully to {user.phone}")
        return Response({
            'detail': 'کد بازیابی رمز عبور ارسال شد',
            'phone': user.phone,  # Include phone in response
            'expires_in': 600,  # 10 minutes
            'message_id': sms_result.get('message_id')
        })
    else:
        logger.error(f"Failed to send password reset SMS to {user.phone}: {sms_result.get('error')}")
        # In development, still return the code for testing
        if settings.DEBUG:
            return Response({
                'detail': 'خطا در ارسال پیامک (حالت توسعه)',
                'code': code,  # Only for development
                'expires_in': 600,
                'sms_error': sms_result.get('error')
            })
        else:
            return Response({
                'detail': 'خطا در ارسال پیامک. لطفاً دوباره تلاش کنید.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_confirm_sms(request):
    """Confirm password reset code sent via SMS"""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    token = serializer.validated_data['token']  # This is the SMS code
    new_password = serializer.validated_data.get('new_password')
    verify_only = serializer.validated_data.get('verify_only', False)
    
    try:
        # Find password reset token with SMS code
        reset_token = PasswordResetToken.objects.get(token=token, is_used=False)
    except PasswordResetToken.DoesNotExist:
        return Response({'detail': 'کد تأیید نامعتبر یا استفاده شده'}, status=status.HTTP_400_BAD_REQUEST)
    
    if reset_token.is_expired():
        return Response({'detail': 'کد تأیید منقضی شده'}, status=status.HTTP_400_BAD_REQUEST)
    
    if verify_only:
        # Just verify the code without changing password
        return Response({'detail': 'کد تأیید معتبر است'})
    
    # Update password
    if not new_password:
        return Response({'detail': 'رمز عبور جدید الزامی است'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = reset_token.user
    user.set_password(new_password)
    user.save()
    
    # Mark token as used
    reset_token.is_used = True
    reset_token.save()
    
    return Response({'detail': 'رمز عبور با موفقیت تغییر یافت'})


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """Confirm password reset"""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    token = serializer.validated_data['token']
    new_password = serializer.validated_data['new_password']
    
    try:
        reset_token = PasswordResetToken.objects.get(token=token, is_used=False)
    except PasswordResetToken.DoesNotExist:
        return Response({'detail': 'توکن نامعتبر یا استفاده شده'}, status=status.HTTP_400_BAD_REQUEST)
    
    if reset_token.is_expired():
        return Response({'detail': 'توکن منقضی شده'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Update password
    user = reset_token.user
    user.set_password(new_password)
    user.save()
    
    # Mark token as used
    reset_token.is_used = True
    reset_token.save()
    
    return Response({'detail': 'رمز عبور با موفقیت تغییر یافت'})


@api_view(["POST"])
@permission_classes([AllowAny])
def phone_verification_request(request):
    """Request phone verification code"""
    from .services.sms_service import sms_service
    from django.conf import settings
    
    serializer = PhoneVerificationRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    phone = serializer.validated_data['phone']
    
    # Check rate limiting
    if sms_service.rate_limit_check(phone, 'verification'):
        return Response({
            'detail': 'درخواست ارسال کد بیش از حد مجاز است. لطفاً چند دقیقه صبر کنید.'
        }, status=status.HTTP_429_TOO_MANY_REQUESTS)
    
    # Generate 6-digit code
    code = ''.join(random.choices(string.digits, k=6))
    expires_at = timezone.now() + timezone.timedelta(minutes=2)  # 120 seconds
    
    # Create verification code
    PhoneVerificationCode.objects.create(
        user=None,  # Will be set after verification
        phone=phone,
        code=code,
        expires_at=expires_at
    )
    
    # Send SMS using SMS.ir
    template_id = getattr(settings, 'SMS_TEMPLATE_ID_VERIFICATION', None)
    sms_result = sms_service.send_verification_code(phone, code, template_id)
    
    if sms_result['success']:
        logger.info(f"Verification SMS sent successfully to {phone}")
        return Response({
            'detail': 'کد تأیید ارسال شد',
            'expires_in': 120,
            'message_id': sms_result.get('message_id')
        })
    else:
        logger.error(f"Failed to send verification SMS to {phone}: {sms_result.get('error')}")
        # In development, still return the code for testing
        if settings.DEBUG:
            return Response({
                'detail': 'خطا در ارسال پیامک (حالت توسعه)',
                'code': code,  # Only for development
                'expires_in': 120,
                'sms_error': sms_result.get('error')
            })
        else:
            return Response({
                'detail': 'خطا در ارسال پیامک. لطفاً دوباره تلاش کنید.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([AllowAny])
def phone_verification_confirm(request):
    """Confirm phone verification code"""
    serializer = PhoneVerificationConfirmSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    phone = serializer.validated_data['phone']
    code = serializer.validated_data['code']
    
    try:
        verification_code = PhoneVerificationCode.objects.get(
            phone=phone, 
            code=code, 
            is_used=False
        )
    except PhoneVerificationCode.DoesNotExist:
        return Response({'detail': 'کد تأیید نامعتبر'}, status=status.HTTP_400_BAD_REQUEST)
    
    if verification_code.is_expired():
        return Response({'detail': 'کد تأیید منقضی شده'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Mark code as used
    verification_code.is_used = True
    verification_code.save()
    
    # If user is provided, mark phone as verified
    if verification_code.user:
        verification_code.user.is_phone_verified = True
        verification_code.user.save()
    
    # Return success response with additional info
    response_data = {
        'success': True,
        'detail': 'شماره تلفن با موفقیت تأیید شد',
        'phone': phone,
        'verified': True
    }
    
    # If user exists, include user info
    if verification_code.user:
        response_data['user'] = UserSerializer(verification_code.user).data
        response_data['message'] = 'شماره تلفن تأیید شد. حالا می‌توانید وارد شوید.'
    else:
        response_data['message'] = 'شماره تلفن تأیید شد. لطفاً وارد شوید.'
    
    return Response(response_data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_phone_verification_status(request):
    """Check if user's phone is verified"""
    user = request.user
    
    return Response({
        'phone': user.phone,
        'is_phone_verified': user.is_phone_verified,
        'verification_required': not user.is_phone_verified,
        'message': 'شماره تلفن تأیید شده است' if user.is_phone_verified else 'شماره تلفن نیاز به تأیید دارد'
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_user_phone(request):
    """Verify authenticated user's phone number"""
    from .services.sms_service import sms_service
    from django.conf import settings
    
    serializer = PhoneVerificationRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    phone = serializer.validated_data['phone']
    user = request.user
    
    # Check if phone matches user's phone
    if user.phone != phone:
        return Response({'detail': 'شماره تلفن با شماره ثبت شده مطابقت ندارد'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if already verified
    if user.is_phone_verified:
        return Response({'detail': 'شماره تلفن قبلاً تأیید شده است'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check rate limiting
    if sms_service.rate_limit_check(phone, 'verification'):
        return Response({
            'detail': 'درخواست ارسال کد بیش از حد مجاز است. لطفاً چند دقیقه صبر کنید.'
        }, status=status.HTTP_429_TOO_MANY_REQUESTS)
    
    # Generate 6-digit code
    code = ''.join(random.choices(string.digits, k=6))
    expires_at = timezone.now() + timezone.timedelta(minutes=2)  # 120 seconds
    
    # Create verification code linked to user
    PhoneVerificationCode.objects.create(
        user=user,
        phone=phone,
        code=code,
        expires_at=expires_at
    )
    
    # Send SMS using SMS.ir
    template_id = getattr(settings, 'SMS_TEMPLATE_ID_VERIFICATION', None)
    sms_result = sms_service.send_verification_code(phone, code, template_id)
    
    if sms_result['success']:
        logger.info(f"User phone verification SMS sent successfully to {phone}")
        return Response({
            'detail': 'کد تأیید ارسال شد',
            'expires_in': 120,
            'message_id': sms_result.get('message_id')
        })
    else:
        logger.error(f"Failed to send user phone verification SMS to {phone}: {sms_result.get('error')}")
        # In development, still return the code for testing
        if settings.DEBUG:
            return Response({
                'detail': 'خطا در ارسال پیامک (حالت توسعه)',
                'code': code,  # Only for development
                'expires_in': 120,
                'sms_error': sms_result.get('error')
            })
        else:
            return Response({
                'detail': 'خطا در ارسال پیامک. لطفاً دوباره تلاش کنید.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password"""
    serializer = ChangePasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    old_password = serializer.validated_data['old_password']
    new_password = serializer.validated_data['new_password']
    
    user = request.user
    
    if not user.check_password(old_password):
        return Response({'detail': 'رمز عبور فعلی اشتباه است'}, status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(new_password)
    user.save()
    
    return Response({'detail': 'رمز عبور با موفقیت تغییر یافت'})


# Order Management Endpoints
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_order(request):
    """Create a new order"""
    serializer = CreateOrderSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    try:
        data = serializer.validated_data
        customer = request.user
        
        # Create order
        order = Order.objects.create(
            customer=customer,
            status=data.get('status', 'submitted'),
            notes=data.get('notes', ''),
            documentation_options=data.get('documentation_options', {}),
            total_amount=0  # Will be calculated later
        )
        
        # Create notification for order submission
        create_notification(
            user=customer,
            notification_type='order_status',
            title='سفارش جدید ثبت شد',
            message=f'سفارش شما با شماره {order.order_number} با موفقیت ثبت شد',
            related_order=order
        )
        
        # Create order items
        items_data = data.get('items', [])
        total_amount = 0
        manufacturing_service_ids = set()
        for item_data in items_data:
            service = Service.objects.get(id=item_data['service'])
            order_item = OrderItem.objects.create(
                order=order,
                service=service,
                field_values=item_data.get('field_values', {}),
                needs_documentation=item_data.get('needs_documentation', False)
            )
            # Use service base_price as initial price (will be updated when quote is accepted)
            if service.base_price:
                total_amount += float(service.base_price)
            # Track manufacturing services for contractor SMS notifications
            if getattr(service, 'type', None) == 'manufacturing':
                manufacturing_service_ids.add(service.id)
        
        # Calculate total amount from service base prices (integer Toman)
        order.total_amount = int(round(total_amount))
        order.save()

        # Notify relevant manufacturing contractors via SMS if order includes manufacturing services
        try:
            if manufacturing_service_ids:
                from .services.sms_service import sms_service
                from django.conf import settings

                template_id = getattr(settings, 'SMS_TEMPLATE_ID_MANUFACTURING_ORDER', None)

                contractors = User.objects.filter(
                    contractor_services__service__id__in=manufacturing_service_ids,
                    contractor_services__is_active=True,
                    is_active=True
                ).distinct()

                for contractor in contractors:
                    # Build contractor full name for template variable #CONTRACTOR#
                    first_name = (contractor.first_name or '').strip()
                    last_name = (contractor.last_name or '').strip()
                    full_name = f"{first_name} {last_name}".strip() or contractor.username

                    # In-app notification for contractor (browser/PWA)
                    create_notification(
                        user=contractor,
                        notification_type='order_status',
                        title='سفارش جدید ساخت و تولید',
                        message='سفارش جدیدی در سایت ثبت شده است. با ورود به پنل جزئیات را ببینید و پیشنهاد قیمتی ارسال کنید.',
                        related_order=order
                    )

                    # SMS: skip if no phone
                    if not getattr(contractor, 'phone', None):
                        continue
                    sms_service.send_new_manufacturing_order_notification(
                        contractor.phone,
                        full_name,
                        template_id
                    )
        except Exception as e:
            # Do not block order creation if SMS sending fails
            logger.error(f"Error sending manufacturing order SMS notifications: {str(e)}")
        
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_orders(request):
    """Get orders for the current user"""
    if request.user.is_staff:
        # Admin sees all orders
        orders = Order.objects.all().order_by('-created_at')
    else:
            orders = Order.objects.filter(customer=request.user).order_by('-created_at')
    return Response(OrderSerializer(orders, many=True).data)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def get_order_by_id(request, order_id):
    """
    Get, update or delete a specific order by ID.
    
    - GET:    بازگرداندن جزئیات سفارش
    - PATCH:  ویرایش سفارش (فقط برای مشتری و زمانی که وضعیت سفارش submitted است)
    - DELETE: حذف سفارش (فقط برای مشتری و زمانی که وضعیت سفارش submitted است؛ ادمین برای همه)
    """
    try:
        # --- GET: existing behaviour (with contractor support) ---
        if request.method == "GET":
            # Allow both customers and contractors to view orders
            if hasattr(request.user, 'role') and getattr(getattr(request.user, 'role', None), 'name', None) == 'contractor':
                # Contractors can view orders they have quotes for
                order = Order.objects.get(id=order_id)
                from .models import Quote
                if not Quote.objects.filter(order_item__order=order, contractor=request.user).exists():
                    return Response({'detail': 'شما دسترسی به این سفارش ندارید'}, status=status.HTTP_403_FORBIDDEN)
            else:
                # Customers can view their own orders
                order = Order.objects.get(id=order_id, customer=request.user)
            return Response(OrderSerializer(order).data)

        # For PATCH / DELETE we only allow owner or staff; contractors نباید بتوانند ویرایش/حذف کنند
        if request.user.is_staff:
            order = Order.objects.get(id=order_id)
        else:
            order = Order.objects.get(id=order_id, customer=request.user)

        # --- PATCH: update order (notes, documentation_options, items' field_values, needs_documentation) ---
        if request.method == "PATCH":
            # Non-staff users can only edit submitted orders
            if (not request.user.is_staff) and order.status != 'submitted':
                return Response(
                    {'detail': 'فقط سفارش‌های در حالت ثبت شده (submitted) قابل ویرایش هستند.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            data = request.data

            # Update simple fields
            if 'notes' in data:
                order.notes = data.get('notes') or ''
            if 'documentation_options' in data and isinstance(data.get('documentation_options'), dict):
                order.documentation_options = data.get('documentation_options') or {}

            # ادمین/مدیر می‌تواند پیشرفت پروژه را ویرایش کند
            if request.user.is_staff and 'project_progress_phase' in data:
                val = data.get('project_progress_phase')
                if val is not None and 0 <= int(val) <= 4:
                    order.project_progress_phase = int(val)

            # Update nested items if provided
            items_data = data.get('items', [])
            if isinstance(items_data, list) and items_data:
                for item_data in items_data:
                    item_id = item_data.get('id')
                    if not item_id:
                        return Response({'detail': 'شناسه آیتم سفارش (id) الزامی است.'},
                                        status=status.HTTP_400_BAD_REQUEST)
                    try:
                        order_item = order.items.get(id=item_id)
                    except OrderItem.DoesNotExist:
                        return Response(
                            {'detail': f'آیتمی با شناسه {item_id} برای این سفارش یافت نشد.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                    # field_values
                    if 'field_values' in item_data and isinstance(item_data.get('field_values'), dict):
                        order_item.field_values = item_data.get('field_values') or {}

                    # needs_documentation
                    if 'needs_documentation' in item_data:
                        order_item.needs_documentation = bool(item_data.get('needs_documentation'))

                    order_item.save()

            order.save()
            return Response(OrderSerializer(order).data)

        # --- DELETE: delete order ---
        if request.method == "DELETE":
            # Admin can delete any order, users can only delete submitted ones
            if (not request.user.is_staff) and order.status != 'submitted':
                return Response(
                    {'detail': 'فقط سفارش‌های در حالت ثبت شده (submitted) قابل حذف هستند.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            order.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        # Should not reach here
        return Response({'detail': 'متد پشتیبانی نمی‌شود.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    except Order.DoesNotExist:
        return Response({'detail': 'سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_service_fields(request, service_id):
    """Get fields for a specific service"""
    try:
        service = Service.objects.get(id=service_id)
        # Return only fields from active tabs or fields without tabs
        fields = ServiceField.objects.filter(
            service=service
        ).filter(
            models.Q(tab__isnull=True) | models.Q(tab__is_active=True)
        ).order_by('tab', 'order', 'name')
        return Response(ServiceFieldSerializer(fields, many=True).data)
    except Service.DoesNotExist:
        raise NotFoundException('سرویس یافت نشد', 'سرویس مورد نظر وجود ندارد')


# Order Proposal Management
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_order_proposal(request):
    """Create a proposal for an order"""
    serializer = CreateOrderProposalSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    try:
        data = serializer.validated_data
        contractor = request.user
        
        # Check if contractor has access to this order
        order = Order.objects.get(id=data['order'])
        
        # Create proposal
        proposal = OrderProposal.objects.create(
            order=order,
            contractor=contractor,
            price=data['price'],
            delivery_days=data['delivery_days'],
            description=data['description']
        )
        
        return Response(OrderProposalSerializer(proposal).data, status=status.HTTP_201_CREATED)
    except Order.DoesNotExist:
        return Response({'detail': 'سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_order_proposals(request, order_id):
    """Get proposals for a specific order"""
    try:
        order = Order.objects.get(id=order_id)
        
        # Check permissions
        if request.user != order.customer and not request.user.is_staff:
            return Response({'detail': 'شما دسترسی به این سفارش ندارید'}, status=status.HTTP_403_FORBIDDEN)
        
        proposals = OrderProposal.objects.filter(order=order).order_by('-created_at')
        return Response(OrderProposalSerializer(proposals, many=True).data)
    except Order.DoesNotExist:
        return Response({'detail': 'سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def accept_order_proposal(request, proposal_id):
    """Accept a proposal"""
    try:
        proposal = OrderProposal.objects.get(id=proposal_id)
        
        # Check permissions
        if request.user != proposal.order.customer:
            return Response({'detail': 'شما دسترسی به این سفارش ندارید'}, status=status.HTTP_403_FORBIDDEN)

        # Business rule: For manufacturing orders, material must be paid before accepting contractor proposal
        order = proposal.order
        has_manufacturing = order.items.filter(service__type='manufacturing').exists()
        if has_manufacturing:
            material_estimate = getattr(order, 'material_estimate', None)
            if not material_estimate or not material_estimate.is_paid:
                return Response(
                    {
                        'detail': 'ابتدا باید هزینه برآورد متریال پرداخت شود تا بتوانید پیشنهاد پیمانکار را بپذیرید.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Update proposal status
        proposal.status = 'accepted'
        proposal.save()
        
        # Update order status
        proposal.order.status = 'proposal_accepted'
        proposal.order.save()
        
        # Create status history
        OrderStatus.objects.create(
            order=proposal.order,
            status='proposal_accepted',
            description=f'پیشنهاد {proposal.contractor.username} پذیرفته شد',
            created_by=request.user
        )
        
        return Response({'detail': 'پیشنهاد با موفقیت پذیرفته شد'})
    except OrderProposal.DoesNotExist:
        return Response({'detail': 'پیشنهاد یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


# Material Estimate Management
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_material_estimate(request):
    """Create material estimate for manufacturing order"""
    serializer = CreateMaterialEstimateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    try:
        data = serializer.validated_data
        order = Order.objects.get(id=data['order'])
        
        # Check if order is manufacturing type
        manufacturing_items = order.items.filter(service__type='manufacturing')
        if not manufacturing_items.exists():
            return Response({'detail': 'این سفارش مربوط به ساخت و تولید نیست'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create or update material estimate
        material_estimate, created = MaterialEstimate.objects.get_or_create(
            order=order,
            defaults={
                'estimated_cost': data['estimated_cost'],
                'description': data['description']
            }
        )
        
        if not created:
            material_estimate.estimated_cost = data['estimated_cost']
            material_estimate.description = data['description']
            material_estimate.save()
        
        return Response(MaterialEstimateSerializer(material_estimate).data, status=status.HTTP_201_CREATED)
    except Order.DoesNotExist:
        return Response({'detail': 'سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_material_estimate(request, order_id):
    """Get material estimate for an order"""
    try:
        order = Order.objects.get(id=order_id)
        
        # Check permissions
        if request.user != order.customer and not request.user.is_staff:
            return Response({'detail': 'شما دسترسی به این سفارش ندارید'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            material_estimate = MaterialEstimate.objects.get(order=order)
            return Response(MaterialEstimateSerializer(material_estimate).data)
        except MaterialEstimate.DoesNotExist:
            return Response({'detail': 'برآورد متریال برای این سفارش وجود ندارد'}, status=status.HTTP_404_NOT_FOUND)
    except Order.DoesNotExist:
        return Response({'detail': 'سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_order_status(request, order_id):
    """Update order status"""
    serializer = OrderStatusUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    try:
        # Only owner or staff can change
        if request.user.is_staff:
            order = Order.objects.get(id=order_id)
        else:
            order = Order.objects.get(id=order_id, customer=request.user)
        old_status = order.status
        new_status = serializer.validated_data['status']

        # Prevent skipping material payment for manufacturing orders
        if new_status in ['proposal_accepted', 'project_paid', 'in_progress']:
            has_manufacturing = order.items.filter(service__type='manufacturing').exists()
            if has_manufacturing:
                material_estimate = getattr(order, 'material_estimate', None)
                if not material_estimate or not material_estimate.is_paid:
                    return Response({'detail': 'ابتدا هزینه متریال باید پرداخت شود.'}, status=status.HTTP_400_BAD_REQUEST)

        order.status = new_status
        order.save()
        
        # Log status change (new model)
        OrderStatus.objects.create(
            order=order,
            status=new_status,
            description=f'تغییر وضعیت از {old_status} به {new_status}',
            created_by=request.user if request.user.is_authenticated else None
        )
        
        # Also log in OrderStatusLog for detailed tracking
        OrderStatusLog.objects.create(
            order=order,
            previous_status=old_status,
            new_status=new_status,
            changed_by=request.user,
            reason=f'تغییر وضعیت توسط {request.user.username}'
        )
        
        return Response({'detail': 'وضعیت سفارش با موفقیت تغییر یافت'})
    except Order.DoesNotExist:
        return Response({'detail': 'سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_order_item_status(request, item_id):
    """Update order item status"""
    try:
        order_item = OrderItem.objects.get(id=item_id)
        
        # Check permissions
        if order_item.order.customer != request.user and order_item.assigned_contractor != request.user:
            return Response({'detail': 'دسترسی غیرمجاز'}, status=status.HTTP_403_FORBIDDEN)
        
        new_status = request.data.get('status')
        if not new_status:
            return Response({'detail': 'وضعیت جدید الزامی است'}, status=status.HTTP_400_BAD_REQUEST)
        
        order_item.status = new_status
        order_item.save()
        
        # Update order status based on item status
        if new_status == 'in_progress':
            order_item.order.status = 'in_progress'
            order_item.order.save()
        elif new_status == 'completed':
            # Check if all items are completed
            all_completed = not order_item.order.items.filter(status__in=['pending', 'quoted', 'accepted', 'in_progress']).exists()
            if all_completed:
                order_item.order.status = 'completed'
                order_item.order.save()
        
        return Response(OrderItemSerializer(order_item).data)
    except OrderItem.DoesNotExist:
        return Response({'detail': 'آیتم سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_project_delivered(request, item_id):
    """Mark project as delivered by contractor"""
    try:
        order_item = OrderItem.objects.get(id=item_id, assigned_contractor=request.user)
        
        if order_item.status != 'in_progress':
            return Response({'detail': 'فقط پروژه‌های در حال انجام قابل تحویل هستند'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        order_item.status = 'delivered'
        order_item.actual_delivery = timezone.now()
        order_item.save()
        
        # Create notification for customer
        create_notification(
            user=order_item.order.customer,
            notification_type='order_completed',
            title='پروژه تحویل داده شد',
            message=f'پروژه {order_item.service.name} توسط پیمانکار تحویل داده شد',
            related_order=order_item.order
        )
        
        return Response(OrderItemSerializer(order_item).data)
    except OrderItem.DoesNotExist:
        return Response({'detail': 'آیتم سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def confirm_project_completion(request, item_id):
    """Confirm project completion by customer"""
    try:
        order_item = OrderItem.objects.get(id=item_id)
        
        if order_item.order.customer != request.user:
            return Response({'detail': 'دسترسی غیرمجاز'}, status=status.HTTP_403_FORBIDDEN)
        
        if order_item.status != 'delivered':
            return Response({'detail': 'فقط پروژه‌های تحویل داده شده قابل تایید هستند'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        order_item.status = 'completed'
        order_item.save()
        
        # Update order status
        order_item.order.status = 'completed'
        order_item.order.save()
        
        # Create notification for contractor
        create_notification(
            user=order_item.assigned_contractor,
            notification_type='order_completed',
            title='پروژه تایید شد',
            message=f'پروژه {order_item.service.name} توسط مشتری تایید شد',
            related_order=order_item.order
        )
        
        return Response(OrderItemSerializer(order_item).data)
    except OrderItem.DoesNotExist:
        return Response({'detail': 'آیتم سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


# Ticket Management Endpoints
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_ticket_message(request):
    """Create a new ticket message with content filtering"""
    from .utils.content_filter import content_filter
    from .utils.file_handler import file_upload_handler, ocr_processor
    
    try:
        ticket_id = request.data.get('ticket_id')
        content = request.data.get('content', '')
        files = request.FILES.getlist('files')
        
        # Get ticket
        try:
            ticket = Ticket.objects.get(id=ticket_id)
        except Ticket.DoesNotExist:
            return Response({'error': 'تیکت یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user can access this ticket
        if not (ticket.creator == request.user or 
                ticket.participants.filter(user=request.user).exists() or 
                request.user.is_staff):
            return Response({'error': 'شما دسترسی به این تیکت ندارید'}, status=status.HTTP_403_FORBIDDEN)
        
        # Content filtering
        filter_result = content_filter.filter_content(content, str(request.user.id))
        
        if filter_result.is_violation:
            # Log the violation
            ContentFilterLog.objects.create(
                user=request.user,
                ticket=ticket,
                violation_type=filter_result.violation_type,
                detected_content=filter_result.detected_content,
                original_content=content,
                action_taken=filter_result.action,
                confidence_score=filter_result.confidence
            )
            
            if filter_result.action == 'block':
                return Response({
                    'error': 'پیام شما حاوی اطلاعات تماس است و نمی‌تواند ارسال شود',
                    'violation_type': filter_result.violation_type,
                    'detected_content': filter_result.detected_content
                }, status=status.HTTP_400_BAD_REQUEST)
            elif filter_result.action == 'quarantine':
                # Create message but mark ticket as quarantined
                ticket.status = 'quarantined'
                ticket.save()
                
                message = TicketMessage.objects.create(
                    ticket=ticket,
                    sender=request.user,
                    content=content,
                    is_internal=False
                )
                
                return Response({
                    'message': 'پیام شما در انتظار بررسی قرار گرفت',
                    'ticket_status': 'quarantined',
                    'message_id': str(message.id)
                }, status=status.HTTP_201_CREATED)
        
        # Create message
        message = TicketMessage.objects.create(
            ticket=ticket,
            sender=request.user,
            content=content,
            is_internal=False
        )
        
        # Handle file uploads
        uploaded_files = []
        for file in files:
            upload_result = file_upload_handler.save_file(file, str(ticket_id), str(message.id))
            if upload_result['success']:
                # Get file type
                file_type = TicketFileType.objects.get(name=upload_result['file_info']['file_type'])
                
                # Create attachment
                attachment = TicketAttachment.objects.create(
                    message=message,
                    file_type=file_type,
                    filename=upload_result['file_info']['filename'],
                    original_filename=upload_result['file_info']['original_filename'],
                    file_path=upload_result['file_info']['file_path'],
                    mime_type=upload_result['file_info']['mime_type'],
                    file_size=upload_result['file_info']['file_size'],
                    attachment_type='other'
                )
                
                # Process OCR for images and PDFs
                if file_type.category in ['image', 'document']:
                    ocr_text = ocr_processor.extract_text_from_image(attachment.file_path)
                    if ocr_text:
                        attachment.ocr_text = ocr_text
                        attachment.is_processed = True
                        attachment.save()
                        
                        # Check OCR text for violations
                        ocr_filter_result = content_filter.filter_content(ocr_text, str(request.user.id))
                        if ocr_filter_result.is_violation:
                            ContentFilterLog.objects.create(
                                user=request.user,
                                ticket=ticket,
                                message=message,
                                violation_type=ocr_filter_result.violation_type,
                                detected_content=ocr_filter_result.detected_content,
                                original_content=ocr_text,
                                action_taken=ocr_filter_result.action,
                                confidence_score=ocr_filter_result.confidence
                            )
                
                uploaded_files.append(attachment)
        
        # Update ticket last activity
        ticket.last_activity_at = timezone.now()
        ticket.save()
        
        return Response({
            'message': 'پیام با موفقیت ارسال شد',
            'message_id': str(message.id),
            'uploaded_files': len(uploaded_files)
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': f'خطا در ارسال پیام: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_ticket(request):
    """Create a new ticket"""
    from .utils.content_filter import content_filter
    
    try:
        category_id = request.data.get('category_id')
        subject = request.data.get('subject', '')
        content = request.data.get('content', '')
        order_id = request.data.get('order_id')
        priority = request.data.get('priority', 'medium')
        
        # Get category
        try:
            category = TicketCategory.objects.get(id=category_id)
        except TicketCategory.DoesNotExist:
            return Response({'error': 'دسته‌بندی تیکت یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if order is required and valid
        order = None
        if category.requires_order:
            if not order_id:
                return Response({'error': 'برای این نوع تیکت، انتخاب سفارش الزامی است'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                order = Order.objects.get(id=order_id, customer=request.user)
                # Check if order is in progress
                if order.status != 'in_progress':
                    return Response({'error': 'فقط برای سفارشات در حال انجام می‌توان تیکت ایجاد کرد'}, status=status.HTTP_400_BAD_REQUEST)
            except Order.DoesNotExist:
                return Response({'error': 'سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
        
        # Content filtering for subject and content
        subject_filter = content_filter.filter_content(subject, str(request.user.id))
        content_filter_result = content_filter.filter_content(content, str(request.user.id))
        
        if subject_filter.is_violation or content_filter_result.is_violation:
            return Response({
                'error': 'موضوع یا محتوای تیکت حاوی اطلاعات تماس است',
                'violations': {
                    'subject': subject_filter.detected_content if subject_filter.is_violation else None,
                    'content': content_filter_result.detected_content if content_filter_result.is_violation else None
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create ticket
        ticket = Ticket.objects.create(
            category=category,
            subject=subject,
            creator=request.user,
            order=order,
            priority=priority,
            status='open'
        )
        
        # Add creator as participant
        TicketParticipant.objects.create(
            ticket=ticket,
            user=request.user,
            role='creator'
        )
        
        # Create initial message
        if content:
            TicketMessage.objects.create(
                ticket=ticket,
                sender=request.user,
                content=content,
                is_internal=False
            )
        
        return Response({
            'message': 'تیکت با موفقیت ایجاد شد',
            'ticket_id': str(ticket.id)
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': f'خطا در ایجاد تیکت: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


# Quote Management Endpoints
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_quote(request):
    """Create a quote for an order item"""
    serializer = CreateQuoteSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    try:
        data = serializer.validated_data
        contractor = request.user
        
        # Check if contractor has permission for this service
        order_item = OrderItem.objects.get(id=data['order_item'])
        
        # Check if contractor already has a quote for this order item
        existing_quote = Quote.objects.filter(
            order_item=order_item,
            contractor=contractor
        ).first()
        
        if existing_quote:
            return Response({
                'detail': 'شما قبلاً برای این آیتم سفارش پیشنهاد ارسال کرده‌اید',
                'existing_quote_id': str(existing_quote.id),
                'existing_quote_status': existing_quote.status
            }, status=status.HTTP_400_BAD_REQUEST)
        
        quote = Quote.objects.create(
            order_item=order_item,
            contractor=contractor,
            price=data['price'],
            documentation_price=data.get('documentation_price', 0),
            delivery_days=data['delivery_days'],
            documentation_days=data.get('documentation_days', 0),
            notes=data.get('notes', '')
        )
        
        # Create notification for quote received
        create_notification(
            user=order_item.order.customer,
            notification_type='quote_received',
            title='پیشنهاد جدید دریافت شد',
            message=f'پیمانکار {contractor.username} برای سفارش {order_item.order.order_number} پیشنهاد جدیدی ارسال کرد',
            related_order=order_item.order,
            related_quote=quote
        )
        
        return Response(QuoteSerializer(quote).data, status=status.HTTP_201_CREATED)
    except OrderItem.DoesNotExist:
        return Response({'detail': 'آیتم سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_quotes_by_order(request, order_id):
    """Get quotes for a specific order"""
    from .models import Quote
    
    try:
        # Allow both customers and contractors to view quotes
        if hasattr(request.user, 'role') and request.user.role.name == 'contractor':
            # Contractors can view quotes for orders they have access to
            order = Order.objects.get(id=order_id)
            # Check if contractor has any quotes for this order
            if not Quote.objects.filter(order_item__order=order, contractor=request.user).exists():
                return Response({'detail': 'شما دسترسی به این سفارش ندارید'}, status=status.HTTP_403_FORBIDDEN)
        else:
            # Customers can view quotes for their own orders
            order = Order.objects.get(id=order_id, customer=request.user)
        
        quotes = Quote.objects.filter(order_item__order=order)
        return Response(QuoteSerializer(quotes, many=True).data)
    except Order.DoesNotExist:
        return Response({'detail': 'سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def accept_quote(request, quote_id):
    """Accept a quote"""
    try:
        quote = Quote.objects.get(id=quote_id)
        order = quote.order_item.order
        
        # Check if user is the customer
        if order.customer != request.user:
            return Response({'detail': 'دسترسی غیرمجاز'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if quote is still pending
        if quote.status != 'pending':
            return Response({'detail': 'این پیشنهاد قبلاً تایید یا رد شده است'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Reject all other quotes for this order item
        Quote.objects.filter(
            order_item=quote.order_item,
            status='pending'
        ).exclude(id=quote.id).update(status='rejected')
        
        # Accept the quote
        quote.status = 'accepted'
        quote.save()
        
        # Update order item status
        quote.order_item.status = 'accepted'
        quote.order_item.assigned_contractor = quote.contractor
        quote.order_item.price = quote.price
        quote.order_item.estimated_delivery = timezone.now() + timezone.timedelta(days=quote.delivery_days)
        quote.order_item.save()
        
        # Update order status
        order.status = 'quoted'
        order.total_amount = quote.price + quote.documentation_price
        order.save()
        
        # Create notification for quote acceptance
        create_notification(
            user=quote.contractor,
            notification_type='quote_accepted',
            title='پیشنهاد شما تایید شد',
            message=f'پیشنهاد شما برای سفارش {order.order_number} توسط مشتری تایید شد',
            related_order=order,
            related_quote=quote
        )
        
        # Create notification for rejected quotes
        rejected_quotes = Quote.objects.filter(
            order_item=quote.order_item,
            status='rejected'
        )
        for rejected_quote in rejected_quotes:
            create_notification(
                user=rejected_quote.contractor,
                notification_type='quote_rejected',
                title='پیشنهاد شما رد شد',
                message=f'پیشنهاد شما برای سفارش {order.order_number} رد شد',
                related_order=order,
                related_quote=rejected_quote
            )
        
        return Response(QuoteSerializer(quote).data)
    except Quote.DoesNotExist:
        return Response({'detail': 'پیشنهاد یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def reject_quote(request, quote_id):
    """Reject a quote"""
    try:
        quote = Quote.objects.get(id=quote_id)
        order = quote.order_item.order
        
        # Check if user is the customer
        if order.customer != request.user:
            return Response({'detail': 'دسترسی غیرمجاز'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if quote is still pending
        if quote.status != 'pending':
            return Response({'detail': 'این پیشنهاد قبلاً تایید یا رد شده است'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Reject the quote
        quote.status = 'rejected'
        quote.save()
        
        # Create notification for quote rejection
        create_notification(
            user=quote.contractor,
            notification_type='quote_rejected',
            title='پیشنهاد شما رد شد',
            message=f'پیشنهاد شما برای سفارش {order.order_number} رد شد',
            related_order=order,
            related_quote=quote
        )
        
        return Response(QuoteSerializer(quote).data)
    except Quote.DoesNotExist:
        return Response({'detail': 'پیشنهاد یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


# Cart Management Endpoints
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_order_to_cart(request):
    """Add an order to cart (for quoted orders)"""
    try:
        order_id = request.data.get('order')
        order = Order.objects.get(id=order_id, customer=request.user)
        
        if order.status != 'quoted':
            return Response({'detail': 'فقط سفارشات قیمت‌گذاری شده قابل اضافه کردن به سبد خرید هستند'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create cart
        cart, created = Cart.objects.get_or_create(customer=request.user)
        
        # Add order items to cart
        for item in order.items.filter(status='accepted'):
            CartItem.objects.create(
                cart=cart,
                service=item.service,
                field_values=item.field_values,
                needs_documentation=item.needs_documentation
            )
        
        return Response({'detail': 'سفارش به سبد خرید اضافه شد'})
    except Order.DoesNotExist:
        return Response({'detail': 'سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, cart_item_id):
    """Remove item from cart"""
    try:
        cart_item = CartItem.objects.get(id=cart_item_id, cart__customer=request.user)
        cart_item.delete()
        return Response({'detail': 'آیتم از سبد خرید حذف شد'})
    except CartItem.DoesNotExist:
        return Response({'detail': 'آیتم یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


# Payment Endpoints (legacy simple payment – currently غیرفعال برای جلوگیری از ثبت اشتباه)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def process_payment(request):
    """
    این endpoint دیگر برای ثبت پرداخت استفاده نمی‌شود.
    برای پرداخت، لطفاً از دکمه‌های پرداخت مرحله‌ای (۱ تا ۴) یا
    دکمه‌های مخصوص پیش‌پرداخت/تسویه در هر سفارش استفاده کنید.
    """
    return Response(
        {'detail': 'این نوع پرداخت در نسخه فعلی غیرفعال است. لطفاً از پرداخت مرحله‌ای هر سفارش استفاده کنید.'},
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_invoice(request, order_id):
    """Download invoice for completed order"""
    try:
        order = Order.objects.get(id=order_id, customer=request.user)
        
        if order.status != 'confirmed':
            return Response({'detail': 'فقط سفارشات تایید شده فاکتور دارند'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Generate invoice (simplified - in real app, generate PDF)
        invoice_data = {
            'order_number': order.order_number,
            'customer': order.customer.username,
            'total_amount': order.total_amount,
            'items': [OrderItemSerializer(item).data for item in order.items.all()],
            'created_at': order.created_at
        }
        
        return Response(invoice_data)
    except Order.DoesNotExist:
        return Response({'detail': 'سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


# Notification Management Endpoints
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_notifications(request):
    """Get notifications for the current user (optional ?limit= for bell dropdown)."""
    qs = Notification.objects.filter(user=request.user).order_by('-created_at')
    try:
        limit = request.query_params.get('limit')
        if limit is not None:
            qs = qs[: max(1, min(100, int(limit)))]
    except (ValueError, TypeError):
        pass
    return Response(NotificationSerializer(qs, many=True).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Mark a notification as read"""
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.is_read = True
        notification.save()
        return Response(NotificationSerializer(notification).data)
    except Notification.DoesNotExist:
        return Response({'detail': 'اعلان یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """Mark all notifications as read for the current user"""
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'detail': 'همه اعلان‌ها به عنوان خوانده شده علامت‌گذاری شدند'})


def create_notification(user, notification_type, title, message, related_order=None, related_quote=None):
    """Helper function to create notifications"""
    Notification.objects.create(
        user=user,
        type=notification_type,
        title=title,
        message=message,
        related_order=related_order,
        related_quote=related_quote
    )


def _notify_contractor_on_payment(order, payment):
    """اعلان به پیمانکار پس از پرداخت توسط سفارش‌دهنده"""
    try:
        contractor = None
        for item in order.items.select_related('assigned_contractor'):
            if item.assigned_contractor and item.assigned_contractor != order.customer:
                contractor = item.assigned_contractor
                break
        if contractor:
            create_notification(
                user=contractor,
                notification_type='payment_completed',
                title='پرداخت سفارش انجام شد',
                message=f'مشتری سفارش {order.order_number} را پرداخت کرد. ددلاین پروژه آغاز شده است.',
                related_order=order
            )
    except Exception as e:
        logger.warning('Failed to notify contractor on payment: %s', str(e))


# Contractor-specific endpoints
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_contractor_orders(request):
    """Get orders available for contractor bidding"""
    # Get orders that are in pending or submitted status
    # Exclude orders created by the current contractor
    orders = Order.objects.filter(
        status__in=['submitted', 'in_review']
    ).exclude(customer=request.user).prefetch_related('items__service').order_by('-created_at')
    
    return Response(OrderSerializer(orders, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_contractor_proposals(request):
    """Get proposals made by the current contractor"""
    proposals = Quote.objects.filter(
        contractor=request.user
    ).select_related('order_item__order', 'order_item__service').order_by('-created_at')
    
    return Response(QuoteSerializer(proposals, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_contractor_active_projects(request):
    """Get active projects for the contractor"""
    # Get order items where contractor is assigned and status is in_progress
    active_projects = OrderItem.objects.filter(
        assigned_contractor=request.user,
        status='in_progress'
    ).select_related('order', 'service').order_by('-created_at')
    
    projects_data = []
    for item in active_projects:
        # Calculate days left based on estimated delivery
        days_left = 0
        if item.estimated_delivery:
            from django.utils import timezone
            now = timezone.now()
            if item.estimated_delivery > now:
                days_left = (item.estimated_delivery - now).days
        
        projects_data.append({
            'id': item.id,
            'order_number': item.order.order_number,
            'title': f"{item.service.name} - {item.order.notes or 'بدون عنوان'}",
            'deadline': item.estimated_delivery,
            'days_left': days_left,
            'status': item.status,
            'price': item.price
        })
    
    return Response(projects_data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_contractor_stats(request):
    """Get contractor statistics"""
    total_proposals = Quote.objects.filter(contractor=request.user).count()
    accepted_proposals = Quote.objects.filter(
        contractor=request.user, 
        status='accepted'
    ).count()
    active_projects = OrderItem.objects.filter(
        assigned_contractor=request.user,
        status='in_progress'
    ).count()
    
    # Calculate average rating
    reviews = Review.objects.filter(contractor=request.user, is_approved=True)
    avg_rating = 0
    if reviews.exists():
        avg_rating = sum(review.rating for review in reviews) / reviews.count()
    
    return Response({
        'total_proposals': total_proposals,
        'accepted_proposals': accepted_proposals,
        'active_projects': active_projects,
        'rating': round(avg_rating, 1)
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_contractor_proposal(request):
    """Create a new proposal for an order item"""
    serializer = CreateQuoteSerializer(data=request.data)
    if serializer.is_valid():
        # Check if contractor already has a proposal for this order item
        existing_proposal = Quote.objects.filter(
            order_item=serializer.validated_data['order_item'],
            contractor=request.user
        ).exists()
        
        if existing_proposal:
            return Response(
                {'detail': 'شما قبلاً برای این سفارش پیشنهاد ثبت کرده‌اید'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create the proposal
        proposal = Quote.objects.create(
            order_item_id=serializer.validated_data['order_item'],
            contractor=request.user,
            price=serializer.validated_data['price'],
            documentation_price=serializer.validated_data['documentation_price'],
            delivery_days=serializer.validated_data['delivery_days'],
            documentation_days=serializer.validated_data['documentation_days'],
            notes=serializer.validated_data.get('notes', '')
        )
        
        # Create notification for the customer
        order_item = proposal.order_item
        create_notification(
            user=order_item.order.customer,
            notification_type='quote_received',
            title='پیشنهاد جدید دریافت شد',
            message=f'پیشنهاد جدیدی برای سفارش {order_item.order.order_number} دریافت شد',
            related_order=order_item.order,
            related_quote=proposal
        )
        
        return Response(QuoteSerializer(proposal).data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def get_public_workshops(request):
    """Get all active and approved workshops (public endpoint for manufacturing page)"""
    from django.db import connection
    from .models import Workshop
    
    # Check which fields exist in database
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='workshops'
        """)
        existing_columns = {row[0] for row in cursor.fetchall()}
    
    # Build query safely - only use fields that exist
    try:
        workshops = Workshop.objects.filter(is_active=True).select_related('owner')
        
        # Only filter by is_approved if column exists
        if 'is_approved' in existing_columns:
            workshops = workshops.filter(is_approved=True)
        
        # Optional filter by workshop class (only if column exists)
        workshop_class = request.query_params.get('class', None)
        if workshop_class and workshop_class in ['A', 'B', 'C'] and 'workshop_class' in existing_columns:
            workshops = workshops.filter(workshop_class=workshop_class)
        
        # Use only() to select only existing fields
        select_fields = ['id', 'code', 'name', 'description', 'capabilities', 'machines', 'owner_id']
        if 'province' in existing_columns:
            select_fields.append('province')
        if 'city' in existing_columns:
            select_fields.append('city')
        if 'workshop_class' in existing_columns:
            select_fields.append('workshop_class')
        if 'workers_count' in existing_columns:
            select_fields.append('workers_count')
        
        workshops = workshops.only(*select_fields)
        
        workshops_data = []
        for workshop in workshops:
            workshop_data = {
                'id': workshop.id,
                'code': workshop.code,
                'name': workshop.name,
                'description': workshop.description or '',
                'capabilities': workshop.capabilities or [],
                'machines': workshop.machines or [],
            }
            # Owner (contractor) for profile/message link
            if hasattr(workshop, 'owner_id') and workshop.owner_id:
                owner = workshop.owner
                workshop_data['owner_id'] = str(workshop.owner_id)
                workshop_data['owner_display_name'] = ((owner.first_name or '') + ' ' + (owner.last_name or '')).strip() or owner.username
            else:
                workshop_data['owner_id'] = None
                workshop_data['owner_display_name'] = None
            
            # Add optional fields if they exist
            if 'province' in existing_columns:
                workshop_data['province'] = getattr(workshop, 'province', None)
            if 'city' in existing_columns:
                workshop_data['city'] = getattr(workshop, 'city', None)
            if 'workshop_class' in existing_columns:
                workshop_data['workshop_class'] = getattr(workshop, 'workshop_class', None)
            if 'workers_count' in existing_columns:
                workshop_data['workers_count'] = getattr(workshop, 'workers_count', None)
            
            workshops_data.append(workshop_data)
        
        return Response(workshops_data)
    except Exception as e:
        # Fallback: try to return basic data without problematic fields
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Error fetching public workshops with full fields: {str(e)}")
        
        # Try fallback query with only basic fields
        try:
            workshops = Workshop.objects.filter(is_active=True).select_related('owner').only('id', 'code', 'name', 'description', 'capabilities', 'machines', 'owner_id')
            workshops_data = []
            for workshop in workshops:
                workshops_data.append({
                    'id': workshop.id,
                    'code': workshop.code,
                    'name': workshop.name,
                    'description': workshop.description or '',
                    'capabilities': workshop.capabilities or [],
                    'machines': workshop.machines or [],
                    'owner_id': str(workshop.owner_id) if workshop.owner_id else None,
                    'owner_display_name': (
                        ((workshop.owner.first_name or '') + ' ' + (workshop.owner.last_name or '')).strip()
                        or workshop.owner.username
                    ) if workshop.owner_id and getattr(workshop, 'owner', None) else None,
                })
            logger.info(f"Fallback query succeeded, returning {len(workshops_data)} workshops")
            return Response(workshops_data)
        except Exception as e2:
            logger.error(f"Fallback query also failed: {str(e2)}")
            return Response([], status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_contractor_workshops(request):
    """Get workshops owned by the contractor (no service prerequisite)."""
    workshops = Workshop.objects.filter(owner=request.user, is_active=True)
    
    workshops_data = []
    for workshop in workshops:
        workshops_data.append({
            'id': workshop.id,
            'code': workshop.code,
            'name': workshop.name,
            'address': workshop.address,
            'description': workshop.description,
            'province': workshop.province,
            'city': workshop.city,
            'postal_address': workshop.postal_address,
            'manager_name': workshop.manager_name,
            'manager_phone': workshop.manager_phone,
            'capabilities': workshop.capabilities,
            'machines': workshop.machines,
            'documents': workshop.documents,
            'workers_count': workshop.workers_count,
            'is_approved': workshop.is_approved,
            'workshop_class': workshop.workshop_class,
            'status': 'تایید شده' if workshop.is_approved else ('در انتظار تایید' if workshop.is_active else 'غیرفعال'),
            'created_at': workshop.created_at
        })
    
    return Response(workshops_data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_contractor_workshop(request):
    """Create a new workshop for the contractor (requires contractor role only)."""
    # Allow only active contractors to create workshops
    is_contractor = request.user.user_roles.filter(role__name='contractor', is_active=True).exists()
    if not is_contractor:
        return Response({
            'error': True,
            'message': 'شما دسترسی به این بخش را ندارید',
            'details': 'تنها پیمانکاران می‌توانند کارگاه ثبت کنند'
        }, status=status.HTTP_403_FORBIDDEN)
    
    data = request.data
    required_fields = ['name', 'address', 'province', 'city', 'postal_address', 'manager_name', 'manager_phone']
    
    for field in required_fields:
        if field not in data or not str(data.get(field, '')).strip():
            return Response(
                {'error': True, 'message': 'اطلاعات ناقص است', 'details': f'فیلد {field} الزامی است'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Sanitize documents: accept only relative file paths; drop blob: and absolute paths
    def _sanitize_documents(docs):
        from urllib.parse import unquote
        import os as _os
        if not isinstance(docs, dict):
            return {}
        sanitized = {}
        for key, values in docs.items():
            if not isinstance(values, (list, tuple)):
                continue
            clean_list = []
            for v in values:
                if not isinstance(v, str):
                    continue
                s = unquote(v).strip()
                # reject blob: and full URLs
                if s.startswith('blob:') or s.startswith('http://') or s.startswith('https://'):
                    continue
                # strip leading slashes and MEDIA_ROOT parts if present
                s = s.lstrip('/')
                # common mistake: including 'app/backend/media/' prefix
                s = s.replace('app/backend/media/', '').replace('/app/backend/media/', '')
                # normalize
                s_norm = _os.path.normpath(s)
                # allow only user-uploads or deliveries roots
                if s_norm.startswith('user-uploads') or s_norm.startswith('deliveries'):
                    clean_list.append(s_norm)
            if clean_list:
                sanitized[key] = clean_list
        return sanitized
    
    documents = _sanitize_documents(data.get('documents', {}))
    
    workshop = Workshop.objects.create(
        name=data['name'],
        address=data['address'],
        description=data.get('description', ''),
        province=data['province'],
        city=data['city'],
        postal_address=data['postal_address'],
        manager_name=data['manager_name'],
        manager_phone=data['manager_phone'],
        workers_count=data.get('workers_count', 0),
        capabilities=data.get('capabilities', []),
        machines=data.get('machines', []),
        documents=documents,
        owner=request.user,
        is_approved=False  # New workshops need admin approval
    )
    
    return Response({
        'id': workshop.id,
        'code': workshop.code,
        'name': workshop.name,
        'address': workshop.address,
        'description': workshop.description,
        'province': workshop.province,
        'city': workshop.city,
        'postal_address': workshop.postal_address,
        'manager_name': workshop.manager_name,
        'manager_phone': workshop.manager_phone,
        'capabilities': workshop.capabilities,
        'machines': workshop.machines,
        'status': 'فعال',
        'created_at': workshop.created_at
    }, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def get_all_workshops_for_admin(request):
    """Get all workshops for admin review (both approved and pending)"""
    from .models import Workshop
    from django.db import connection
    
    # Check which fields exist in database
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='workshops'
        """)
        existing_columns = {row[0] for row in cursor.fetchall()}
    
    try:
        # Get all workshops (both approved and pending)
        workshops = Workshop.objects.all().order_by('-created_at')
        
        # Use only() to select only existing fields
        select_fields = ['id', 'code', 'name', 'address', 'description', 'owner', 
                        'is_active', 'created_at', 'province', 'city', 'postal_address',
                        'manager_name', 'manager_phone', 'capabilities', 'machines']
        if 'is_approved' in existing_columns:
            select_fields.append('is_approved')
        if 'workshop_class' in existing_columns:
            select_fields.append('workshop_class')
        if 'documents' in existing_columns:
            select_fields.append('documents')
        if 'workers_count' in existing_columns:
            select_fields.append('workers_count')
        
        workshops = workshops.only(*select_fields)
        
        workshops_data = []
        for workshop in workshops:
            workshop_data = {
                'id': workshop.id,
                'code': workshop.code,
                'name': workshop.name,
                'address': workshop.address,
                'description': workshop.description or '',
                'owner': {
                    'id': str(workshop.owner.id),
                    'username': workshop.owner.username,
                    'email': workshop.owner.email if hasattr(workshop.owner, 'email') else None
                },
                'is_active': workshop.is_active,
                'created_at': workshop.created_at,
                'province': getattr(workshop, 'province', None),
                'city': getattr(workshop, 'city', None),
                'postal_address': getattr(workshop, 'postal_address', None),
                'manager_name': getattr(workshop, 'manager_name', None),
                'manager_phone': getattr(workshop, 'manager_phone', None),
                'capabilities': workshop.capabilities or [],
                'machines': workshop.machines or [],
            }
            
            # Add optional fields if they exist
            if 'is_approved' in existing_columns:
                workshop_data['is_approved'] = getattr(workshop, 'is_approved', False)
            if 'workshop_class' in existing_columns:
                workshop_data['workshop_class'] = getattr(workshop, 'workshop_class', None)
            if 'documents' in existing_columns:
                workshop_data['documents'] = getattr(workshop, 'documents', {})
            if 'workers_count' in existing_columns:
                workshop_data['workers_count'] = getattr(workshop, 'workers_count', None)
            
            # Add status field
            if 'is_approved' in existing_columns:
                is_approved = getattr(workshop, 'is_approved', False)
                workshop_data['status'] = 'تایید شده' if is_approved else ('در انتظار تایید' if workshop.is_active else 'غیرفعال')
            else:
                workshop_data['status'] = 'فعال' if workshop.is_active else 'غیرفعال'
            
            workshops_data.append(workshop_data)
        
        return Response(workshops_data)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error fetching all workshops for admin: {str(e)}")
        return Response({'error': 'خطا در دریافت اطلاعات کارگاه‌ها'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def approve_workshop(request, workshop_id):
    """Approve or reject a workshop and optionally set its class"""
    from .models import Workshop
    from django.db import connection
    
    try:
        workshop = Workshop.objects.get(id=workshop_id)
    except Workshop.DoesNotExist:
        return Response({'error': 'کارگاه یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if fields exist
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='workshops'
        """)
        existing_columns = {row[0] for row in cursor.fetchall()}
    
    # Get approval data
    is_approved = request.data.get('is_approved')
    workshop_class = request.data.get('workshop_class')
    rejection_reason = request.data.get('rejection_reason', '')
    
    # Validate workshop_class if provided
    if workshop_class and workshop_class not in ['A', 'B', 'C']:
        return Response({'error': 'کلاس کارگاه باید A، B یا C باشد'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Capture previous approval state (for SMS notification)
    was_approved = getattr(workshop, 'is_approved', False) if 'is_approved' in existing_columns else False
    
    # Update workshop
    if 'is_approved' in existing_columns:
        if is_approved is not None:
            workshop.is_approved = is_approved
    
    if 'workshop_class' in existing_columns:
        if workshop_class is not None:
            if is_approved and not workshop_class:
                return Response({'error': 'برای تایید کارگاه باید کلاس کارگاه را مشخص کنید (A, B یا C)'}, status=status.HTTP_400_BAD_REQUEST)
            workshop.workshop_class = workshop_class if is_approved else ''
    elif is_approved and workshop_class:
        # If is_approved=True but workshop_class column doesn't exist, just save without class
        # This allows backward compatibility during migration
        pass
    
    workshop.save()
    
    # Notify workshop owner (in-app + SMS) when it transitions to approved
    try:
        if 'is_approved' in existing_columns:
            now_approved = getattr(workshop, 'is_approved', False)
            if now_approved and not was_approved:
                owner = getattr(workshop, 'owner', None)
                if owner:
                    workshop_name = workshop.name
                    # In-app notification for owner (browser/PWA)
                    create_notification(
                        user=owner,
                        notification_type='system',
                        title='تایید کارگاه',
                        message=f'درخواست شما برای ثبت کارگاه «{workshop_name}» مورد تایید قرار گرفت. به شبکه همکاران خوش آمدید.',
                        related_order=None,
                        related_quote=None
                    )
                    # SMS
                    if getattr(owner, 'phone', None):
                        from .services.sms_service import sms_service
                        from django.conf import settings
                        template_id = getattr(settings, 'SMS_TEMPLATE_ID_APPROVE_WORKSHOP', None)
                        sms_service.send_workshop_approval_notification(
                            owner.phone,
                            workshop_name,
                            template_id
                        )
    except Exception as e:
        # Do not block approval if notification/SMS sending fails
        logger.error(f"Error sending workshop approval notification/SMS: {str(e)}")
    
    # Return updated workshop data
    workshop_data = {
        'id': workshop.id,
        'code': workshop.code,
        'name': workshop.name,
        'is_approved': getattr(workshop, 'is_approved', False) if 'is_approved' in existing_columns else False,
        'workshop_class': getattr(workshop, 'workshop_class', None) if 'workshop_class' in existing_columns else None,
        'status': 'تایید شده' if (getattr(workshop, 'is_approved', False) if 'is_approved' in existing_columns else False) else 'در انتظار تایید'
    }
    
    return Response({
        'message': 'کارگاه با موفقیت به‌روزرسانی شد',
        'workshop': workshop_data
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_contractor_manufacturing_service(request):
    """Return true if the user is an active contractor (no hard dependency on a specific service)."""
    try:
        # User is considered eligible if they have an active contractor role
        is_contractor = request.user.user_roles.filter(role__name='contractor', is_active=True).exists()
        return Response({
            'has_manufacturing_service': is_contractor,
            'service_name': None
        }, status=status.HTTP_200_OK)
    except Exception:
        return Response({
            'error': True,
            'message': 'خطا در بررسی نقش کاربر'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_public_specialists(request):
    """Get all approved specialist profiles (public endpoint)"""
    try:
        specialists = SpecialistProfile.objects.filter(is_approved=True).select_related('user').prefetch_related('specializations', 'specialization_services')
        
        # Optional filters
        province = request.query_params.get('province')
        if province:
            specialists = specialists.filter(province=province)
        
        city = request.query_params.get('city')
        if city:
            specialists = specialists.filter(city=city)
        
        # Serialize with public serializer (no contact info)
        serializer = SpecialistProfilePublicSerializer(specialists, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error getting public specialists: {str(e)}")
        return Response({'error': 'خطا در دریافت اطلاعات نیروهای متخصص'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_public_job_seekers(request):
    """Get all active and available job seeker profiles (public endpoint)"""
    try:
        job_seekers = JobSeeker.objects.filter(
            is_active=True,
            is_available=True
        ).select_related('service_scope').prefetch_related('services')
        
        # Optional filters
        service_scope = request.query_params.get('service_scope')
        if service_scope:
            job_seekers = job_seekers.filter(service_scope_id=service_scope)
        
        # Log for debugging
        logger.info(f"get_public_job_seekers: Found {job_seekers.count()} job seekers")
        
        # Serialize with public serializer (no user info, only ID)
        serializer = JobSeekerPublicSerializer(job_seekers, many=True)
        logger.info(f"get_public_job_seekers: Serialized {len(serializer.data)} job seekers")
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error getting public job seekers: {str(e)}", exc_info=True)
        return Response({'error': 'خطا در دریافت اطلاعات جویندگان کار'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_job_seeker_hire_request(request):
    """Create a hire request for a job seeker (contractor to admin)"""
    try:
        logger.info(f"create_job_seeker_hire_request: User {request.user.username} attempting to create hire request")
        
        # Check if user is contractor
        from .models import Role
        user_roles = request.user.user_roles.filter(is_active=True).select_related('role')
        is_contractor = any(role.role.name == 'contractor' for role in user_roles)
        
        logger.info(f"create_job_seeker_hire_request: User {request.user.username} is_contractor={is_contractor}")
        
        if not is_contractor:
            logger.warning(f"create_job_seeker_hire_request: User {request.user.username} is not a contractor")
            return Response(
                {'error': 'فقط پیمانکاران می‌توانند درخواست جذب نیرو ثبت کنند'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = JobSeekerHireRequestCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            hire_request = serializer.save()
            logger.info(f"create_job_seeker_hire_request: Created hire request {hire_request.id} for job seeker {hire_request.job_seeker.id}")
            
            # Create notification for admin
            from .models import Notification
            from .models import Role
            admin_role = Role.objects.filter(name='admin').first()
            if admin_role:
                admin_users = admin_role.user_roles.filter(is_active=True).select_related('user')
                notification_count = 0
                for admin_role_obj in admin_users:
                    Notification.objects.create(
                        user=admin_role_obj.user,
                        notification_type='hire_request',
                        title='درخواست جذب نیروی کاریابی جدید',
                        message=f'پیمانکار {request.user.username} درخواست جذب نیروی کاریابی {hire_request.job_seeker.id} را ثبت کرده است',
                    )
                    notification_count += 1
                logger.info(f"create_job_seeker_hire_request: Created {notification_count} notifications for admins")
            else:
                logger.warning("create_job_seeker_hire_request: No admin role found, skipping notification")
            
            response_serializer = JobSeekerHireRequestSerializer(hire_request)
            return Response({
                'message': 'درخواست جذب نیرو با موفقیت ثبت شد',
                'hire_request': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        logger.warning(f"create_job_seeker_hire_request: Serializer validation failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error creating job seeker hire request: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def approve_specialist_profile(request, specialist_id):
    """Approve or reject a specialist profile"""
    try:
        specialist = SpecialistProfile.objects.get(id=specialist_id)
    except SpecialistProfile.DoesNotExist:
        return Response({'error': 'پروفایل نیروی متخصص یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get approval data
    is_approved = request.data.get('is_approved')
    admin_notes = request.data.get('admin_notes', '')
    
    # Update specialist profile
    if is_approved is not None:
        specialist.is_approved = is_approved
        specialist.reviewed_by = request.user
        specialist.reviewed_at = timezone.now()
        specialist.admin_notes = admin_notes
        specialist.save()
    
    # Return updated specialist data
    serializer = SpecialistProfileSerializer(specialist)
    return Response({
        'message': 'پروفایل نیروی متخصص با موفقیت به‌روزرسانی شد',
        'specialist': serializer.data
    })


# --- User Profile & Direct Messaging ---

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_public_users(request):
    """List users for profile search (public info only). Excludes current user."""
    search = request.GET.get('search', '').strip()
    queryset = User.objects.exclude(id=request.user.id).filter(is_active=True)
    if search:
        queryset = queryset.filter(
            models.Q(username__icontains=search) |
            models.Q(first_name__icontains=search) |
            models.Q(last_name__icontains=search)
        )
    queryset = queryset.order_by('username')[:50]
    return Response(UserPublicProfileSerializer(queryset, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_public_profile(request, user_id):
    """Get public profile of a user by ID"""
    try:
        user = User.objects.get(id=user_id, is_active=True)
    except User.DoesNotExist:
        return Response({'error': 'کاربر یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
    if user.id == request.user.id:
        return Response({'error': 'برای مشاهده پروفایل خود از صفحه پروفایل استفاده کنید'}, status=status.HTTP_400_BAD_REQUEST)
    return Response(UserPublicProfileSerializer(user).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_user_avatar(request):
    """Upload or update user avatar"""
    from .file_managers import user_file_manager
    
    file = request.FILES.get('file')
    if not file:
        return Response({'error': 'فایل الزامی است'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate file type (images only)
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if file.content_type not in allowed_types:
        return Response({'error': 'فقط فایل‌های تصویری مجاز هستند'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check file size (max 5MB)
    max_size = 5 * 1024 * 1024  # 5MB
    if file.size > max_size:
        return Response({'error': 'حجم فایل نباید بیشتر از 5 مگابایت باشد'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Delete old avatar if exists
        if request.user.profile_image:
            # Optionally delete old file from storage
            pass
        
        # Upload new avatar
        result = user_file_manager.upload_file(
            file,
            f'avatar_{request.user.id}_{file.name}',
            file.content_type,
            user_id=request.user.id,
            order_id=None
        )
        
        if result['success']:
            # Update user profile_image
            request.user.profile_image = result['file_path']
            request.user.save()
            
            return Response({
                'message': 'آواتار با موفقیت آپلود شد',
                'profile_image': request.user.profile_image
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': result.get('error', 'خطا در آپلود فایل')
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error uploading avatar: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_user_avatar(request):
    """Delete user avatar"""
    try:
        if request.user.profile_image:
            # Optionally delete file from storage
            request.user.profile_image = None
            request.user.save()
            return Response({'message': 'آواتار با موفقیت حذف شد'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'آواتاری برای حذف وجود ندارد'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error deleting avatar: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_user_resume(request):
    """Upload or update user resume"""
    from .file_managers import user_file_manager
    
    file = request.FILES.get('file')
    if not file:
        return Response({'error': 'فایل الزامی است'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate file type (PDF, DOC, DOCX)
    allowed_types = ['application/pdf', 'application/msword', 
                     'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if file.content_type not in allowed_types:
        return Response({'error': 'فقط فایل‌های PDF و Word مجاز هستند'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check file size (max 10MB)
    max_size = 10 * 1024 * 1024  # 10MB
    if file.size > max_size:
        return Response({'error': 'حجم فایل نباید بیشتر از 10 مگابایت باشد'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Delete old resume if exists
        if request.user.resume_file:
            # Optionally delete old file from storage
            pass
        
        # Upload new resume
        result = user_file_manager.upload_file(
            file,
            f'resume_{request.user.id}_{file.name}',
            file.content_type,
            user_id=request.user.id,
            order_id=None
        )
        
        if result['success']:
            # Update user resume_file
            request.user.resume_file = result['file_path']
            request.user.save()
            
            return Response({
                'message': 'رزومه با موفقیت آپلود شد',
                'resume_file': request.user.resume_file
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': result.get('error', 'خطا در آپلود فایل')
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error uploading resume: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_user_resume(request):
    """Delete user resume"""
    try:
        if request.user.resume_file:
            # Optionally delete file from storage
            request.user.resume_file = ''
            request.user.save()
            return Response({'message': 'رزومه با موفقیت حذف شد'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'رزومه‌ای برای حذف وجود ندارد'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error deleting resume: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_conversations(request):
    """List current user's conversations"""
    # Get conversations where user is a participant
    user_participations = ConversationParticipant.objects.filter(user=request.user).select_related('conversation')
    conv_ids = [cp.conversation_id for cp in user_participations]
    convs = Conversation.objects.filter(id__in=conv_ids).order_by('-updated_at')
    return Response(ConversationSerializer(convs, many=True, context={'request': request}).data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def get_or_create_conversation(request, user_id):
    """Get or create a conversation with a specific user"""
    try:
        other_user = User.objects.get(id=user_id, is_active=True)
    except User.DoesNotExist:
        return Response({'error': 'کاربر یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
    if other_user.id == request.user.id:
        return Response({'error': 'نمی‌توانید با خودتان چت کنید'}, status=status.HTTP_400_BAD_REQUEST)

    # Find existing conversation using ConversationParticipant
    # Get all conversations where current user is a participant
    user_conv_ids = ConversationParticipant.objects.filter(user=request.user).values_list('conversation_id', flat=True)
    # Find conversations that also have the other user as participant
    other_user_participations = ConversationParticipant.objects.filter(
        user=other_user,
        conversation_id__in=user_conv_ids
    ).select_related('conversation')
    
    if other_user_participations.exists():
        conv = other_user_participations.first().conversation
        return Response(ConversationSerializer(conv, context={'request': request}).data)

    # Create new conversation
    conv = Conversation.objects.create()
    ConversationParticipant.objects.create(conversation=conv, user=request.user)
    ConversationParticipant.objects.create(conversation=conv, user=other_user)
    return Response(ConversationSerializer(conv, context={'request': request}).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_conversation_messages(request, conversation_id):
    """List messages in a conversation"""
    # Check if user is a participant
    if not ConversationParticipant.objects.filter(conversation_id=conversation_id, user=request.user).exists():
        return Response({'error': 'مکالمه یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
    try:
        conv = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response({'error': 'مکالمه یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
    messages = conv.messages.order_by('created_at')
    return Response(DirectMessageSerializer(messages, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def send_direct_message(request, conversation_id):
    """Send a message in a conversation. Accepts multipart: content (required or optional if files), and optional file attachments."""
    import os
    from .file_managers import user_file_manager
    
    # Allowed extensions for message attachments (images, PDF, archive, CAD, 3D)
    ALLOWED_EXTENSIONS = {
        '.jpg', '.jpeg', '.png', '.gif', '.webp',
        '.pdf', '.zip', '.rar',
        '.dwg', '.dxf', '.step', '.stp', '.iges', '.igs', '.stl', '.obj',
    }
    MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB
    MAX_FILES_PER_MESSAGE = 5
    
    if not ConversationParticipant.objects.filter(conversation_id=conversation_id, user=request.user).exists():
        return Response({'error': 'مکالمه یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
    try:
        conv = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response({'error': 'مکالمه یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
    
    content = (request.data.get('content') or request.POST.get('content') or '').strip()
    files = request.FILES.getlist('files') or request.FILES.getlist('file') or []
    
    if not content and not files:
        return Response({'error': 'متن پیام یا حداقل یک پیوست الزامی است'}, status=status.HTTP_400_BAD_REQUEST)
    if len(files) > MAX_FILES_PER_MESSAGE:
        return Response({'error': f'حداکثر {MAX_FILES_PER_MESSAGE} فایل در هر پیام مجاز است'}, status=status.HTTP_400_BAD_REQUEST)
    
    for f in files:
        ext = os.path.splitext(getattr(f, 'name', ''))[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            return Response({'error': f'نوع فایل مجاز نیست: {ext}. مجاز: عکس، PDF، ZIP، RAR، فایل‌های CAD و مدل سه‌بعدی'}, status=status.HTTP_400_BAD_REQUEST)
        if f.size > MAX_FILE_SIZE:
            return Response({'error': f'حجم هر فایل حداکثر ۲۵ مگابایت باشد'}, status=status.HTTP_400_BAD_REQUEST)
    
    msg = DirectMessage.objects.create(conversation=conv, sender=request.user, content=content or '(پیوست)')
    
    for f in files:
        safe_name = os.path.basename(getattr(f, 'name', 'file'))[:200]
        content_type = getattr(f, 'content_type', 'application/octet-stream')
        result = user_file_manager.upload_file(
            f,
            f"msg_{conv.id}_{safe_name}",
            content_type,
            user_id=request.user.id,
            order_id=None,
        )
        if result.get('success'):
            DirectMessageAttachment.objects.create(
                message=msg,
                file_path=result['file_path'],
                file_name=safe_name,
                content_type=content_type,
                file_size=result.get('file_size', 0),
            )
        else:
            logger.warning(f"Message attachment upload failed: {result.get('error')}")
    
    conv.updated_at = timezone.now()
    conv.save(update_fields=['updated_at'])
    return Response(DirectMessageSerializer(msg, context={'request': request}).data, status=status.HTTP_201_CREATED)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_messages_read(request, conversation_id):
    """Mark messages in a conversation as read"""
    # Check if user is a participant
    if not ConversationParticipant.objects.filter(conversation_id=conversation_id, user=request.user).exists():
        return Response({'error': 'مکالمه یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
    try:
        conv = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response({'error': 'مکالمه یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
    conv.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
    return Response({'message': 'ok'})


# Turnstile Statistics and Admin
@api_view(["GET"])
@permission_classes([IsAdminUser])
def turnstile_stats(request):
    """Get Turnstile statistics for admin"""
    from .models import TurnstileAttempt
    
    days = int(request.GET.get('days', 30))
    stats = TurnstileAttempt.get_stats(days)
    system_stats = get_turnstile_stats()
    
    return Response({
        'attempts': stats,
        'system': system_stats
    })


@api_view(["GET"])
@permission_classes([IsAdminUser])
def turnstile_attempts(request):
    """Get Turnstile attempts for admin review"""
    from .models import TurnstileAttempt
    from django.core.paginator import Paginator
    
    attempts = TurnstileAttempt.objects.all().order_by('-created_at')
    
    # Pagination
    page = int(request.GET.get('page', 1))
    per_page = int(request.GET.get('per_page', 50))
    paginator = Paginator(attempts, per_page)
    
    try:
        page_obj = paginator.page(page)
    except Exception:
        page_obj = paginator.page(1)
    
    return Response({
        'count': paginator.count,
        'num_pages': paginator.num_pages,
        'current_page': page,
        'results': [
            {
                'id': attempt.id,
                'created_at': attempt.created_at,
                'ip': attempt.ip,
                'user': attempt.user.username if attempt.user else None,
                'endpoint': attempt.endpoint,
                'success': attempt.success,
                'error_message': attempt.error_message,
                'user_agent': attempt.user_agent
            }
            for attempt in page_obj.object_list
        ]
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_contractor_ratings(request):
    """Get all ratings for a contractor"""
    try:
        # Get all reviews for the contractor
        reviews = Review.objects.filter(
            contractor=request.user,
            is_approved=True
        ).select_related('customer', 'order_item').order_by('-created_at')
        
        # Serialize the reviews
        ratings_data = []
        for review in reviews:
            ratings_data.append({
                'id': str(review.id),
                'customer': {
                    'id': str(review.customer.id),
                    'username': review.customer.username,
                    'first_name': review.customer.first_name,
                    'last_name': review.customer.last_name,
                },
                'order_item': {
                    'id': str(review.order_item.id),
                    'service_name': review.order_item.service.name if review.order_item.service else 'Unknown Service',
                },
                'rating': review.rating,
                'comment': review.comment,
                'created_at': review.created_at.isoformat(),
            })
        
        return Response(ratings_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_contractor_rating_stats(request):
    """Get rating statistics for a contractor"""
    try:
        # Get all approved reviews for the contractor
        reviews = Review.objects.filter(
            contractor=request.user,
            is_approved=True
        )
        
        if not reviews.exists():
            return Response({
                'total_ratings': 0,
                'average_rating': 0,
                'rating_breakdown': {
                    '5_star': 0,
                    '4_star': 0,
                    '3_star': 0,
                    '2_star': 0,
                    '1_star': 0,
                }
            })
        
        # Calculate statistics
        total_ratings = reviews.count()
        average_rating = sum(review.rating for review in reviews) / total_ratings
        
        # Calculate rating breakdown
        rating_breakdown = {
            '5_star': reviews.filter(rating=5).count(),
            '4_star': reviews.filter(rating=4).count(),
            '3_star': reviews.filter(rating=3).count(),
            '2_star': reviews.filter(rating=2).count(),
            '1_star': reviews.filter(rating=1).count(),
        }
        
        return Response({
            'total_ratings': total_ratings,
            'average_rating': round(average_rating, 1),
            'rating_breakdown': rating_breakdown
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Support System Views
@api_view(["POST"])
@permission_classes([AllowAny])
def create_support_feedback(request):
    """Create support feedback with AI response"""
    from .serializers import SupportFeedbackCreateSerializer
    from .models import SupportFeedback
    from .utils.gemini_ai import get_ai_response
    
    serializer = SupportFeedbackCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Create feedback instance
        feedback_data = serializer.validated_data.copy()
        
        # Add user if authenticated
        if request.user.is_authenticated:
            feedback_data['user'] = request.user
        
        # Create feedback
        feedback = SupportFeedback.objects.create(**feedback_data)
        
        # Generate AI response if there's any user input
        user_input = ""
        if feedback.personal_feedback:
            user_input = feedback.personal_feedback
        elif feedback.used_services is not None or feedback.satisfaction_rating is not None:
            # Create a summary of the feedback for AI
            user_input = f"کاربر بازخورد داده است. استفاده از خدمات: {feedback.used_services}, امتیاز رضایت: {feedback.satisfaction_rating}"
        
        if user_input:
            # Prepare context for AI
            context = {
                'used_services': feedback.used_services,
                'satisfaction_rating': feedback.satisfaction_rating,
                'personal_feedback': feedback.personal_feedback
            }
            
            # Get AI response
            ai_result = get_ai_response(user_input, context)
            
            # Update feedback with AI response
            feedback.ai_response = ai_result['response']
            feedback.ai_model_used = ai_result['model_used']
            feedback.ai_prompt_tokens = ai_result['prompt_tokens']
            feedback.ai_response_tokens = ai_result['response_tokens']
            feedback.save()
        
        # Return response
        from .serializers import SupportFeedbackSerializer
        response_serializer = SupportFeedbackSerializer(feedback, context={'request': request})
        
        return Response({
            'feedback': response_serializer.data,
            'ai_response': feedback.ai_response,
            'message': 'بازخورد شما با موفقیت ثبت شد.'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_support_feedbacks(request):
    """Get user's support feedbacks"""
    from .models import SupportFeedback
    from .serializers import SupportFeedbackSerializer
    from django.core.paginator import Paginator
    
    feedbacks = SupportFeedback.objects.filter(user=request.user).order_by('-created_at')
    
    # Pagination
    page = int(request.GET.get('page', 1))
    per_page = int(request.GET.get('per_page', 20))
    paginator = Paginator(feedbacks, per_page)
    
    try:
        page_obj = paginator.page(page)
    except Exception:
        page_obj = paginator.page(1)
    
    serializer = SupportFeedbackSerializer(page_obj.object_list, many=True, context={'request': request})
    
    return Response({
        'count': paginator.count,
        'num_pages': paginator.num_pages,
        'current_page': page_obj.number,
        'results': serializer.data
    })


@api_view(["GET"])
@permission_classes([IsAdminUser])
def get_support_stats(request):
    """Get support system statistics for admin"""
    from .models import SupportFeedback
    from .serializers import SupportStatsSerializer
    
    days = int(request.GET.get('days', 30))
    stats = SupportFeedback.get_stats(days)
    
    serializer = SupportStatsSerializer(stats)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def get_all_support_feedbacks(request):
    """Get all support feedbacks for admin review"""
    from .models import SupportFeedback
    from .serializers import SupportFeedbackSerializer
    from django.core.paginator import Paginator
    
    feedbacks = SupportFeedback.objects.all().order_by('-created_at')
    
    # Pagination
    page = int(request.GET.get('page', 1))
    per_page = int(request.GET.get('per_page', 50))
    paginator = Paginator(feedbacks, per_page)
    
    try:
        page_obj = paginator.page(page)
    except Exception:
        page_obj = paginator.page(1)
    
    serializer = SupportFeedbackSerializer(page_obj.object_list, many=True, context={'request': request})
    
    return Response({
        'count': paginator.count,
        'num_pages': paginator.num_pages,
        'current_page': page_obj.number,
        'results': serializer.data
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def ask_ai_support(request):
    """Enhanced AI support question endpoint with context awareness"""
    from .utils.gemini_ai_enhanced import get_enhanced_ai_response
    
    question = request.data.get('question', '').strip()
    if not question:
        return Response({'error': 'سوال الزامی است'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Prepare enhanced context
        context = {}
        
        if request.user.is_authenticated:
            context['user_authenticated'] = True
            context['user_type'] = 'authenticated'
            
            # Get user role
            user_roles = request.user.user_roles.filter(is_active=True)
            if user_roles.exists():
                context['user_role'] = user_roles.first().role.name
            
            # Get user's service history
            user_orders = Order.objects.filter(customer=request.user)
            context['active_orders_count'] = user_orders.filter(
                status__in=['submitted', 'in_review', 'quoted', 'accepted', 'in_progress']
            ).count()
            
            # Get user's expertise areas (if contractor)
            if context.get('user_role') == 'contractor':
                contractor_services = request.user.contractor_services.filter(is_active=True)
                expertise_areas = []
                for cs in contractor_services:
                    scope_name = cs.service.scope.display_name
                    if scope_name not in expertise_areas:
                        expertise_areas.append(scope_name)
                context['expertise_areas'] = expertise_areas
            
            # Check if user has used services before
            context['used_services'] = user_orders.exists()
            
        else:
            context['user_authenticated'] = False
            context['user_type'] = 'anonymous'
        
        # Get AI response with enhanced context
        ai_result = get_enhanced_ai_response(question, context)
        
        # Log the interaction for learning
        try:
            from .models import AIInteractionLog
            
            # Create interaction log
            interaction = AIInteractionLog.objects.create(
                user=request.user if request.user.is_authenticated else None,
                user_input=question,
                ai_response=ai_result['response'],
                user_context=context,
                prompt_tokens=ai_result.get('prompt_tokens', 0),
                response_tokens=ai_result.get('response_tokens', 0),
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                session_id=request.session.session_key
            )
            
            # NOTE: تحلیل یادگیری موقتاً غیرفعال شد تا از تداخل مدل‌ها جلوگیری شود
            
        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.warning(f"Could not log AI interaction: {e}")
        
        return Response({
            'question': question,
            'response': ai_result['response'],
            'model_used': ai_result['model_used'],
            'error': ai_result['error'],
            'context_used': ai_result.get('context_used', False),
            'specialized_knowledge_used': ai_result.get('specialized_knowledge_used', False)
        })
        
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error in ask_ai_support: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([AllowAny])
def submit_ai_feedback(request):
    """Submit feedback for AI responses"""
    from .models import AIInteractionLog
    from .utils.ai_learning import response_optimizer
    
    interaction_id = request.data.get('interaction_id')
    satisfaction = request.data.get('satisfaction')
    feedback_text = request.data.get('feedback_text', '')
    response_helpful = request.data.get('response_helpful')
    response_accurate = request.data.get('response_accurate')
    
    if not interaction_id:
        return Response({'error': 'شناسه تعامل الزامی است'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        interaction = AIInteractionLog.objects.get(id=interaction_id)
        
        # Update interaction with feedback
        if satisfaction:
            interaction.user_satisfaction = satisfaction
        if feedback_text:
            interaction.user_feedback_text = feedback_text
        if response_helpful is not None:
            interaction.response_helpful = response_helpful
        if response_accurate is not None:
            interaction.response_accurate = response_accurate
        
        interaction.save()
        
        # Update pattern effectiveness if applicable
        try:
            from .models import AIResponsePattern
            patterns = AIResponsePattern.objects.filter(
                trigger_keywords__overlap=interaction.keywords_detected
            )
            for pattern in patterns:
                response_optimizer.update_pattern_effectiveness(pattern, interaction)
        except Exception as e:
            logger.warning(f"Could not update pattern effectiveness: {e}")
        
        return Response({
            'message': 'بازخورد با موفقیت ثبت شد',
            'interaction_id': str(interaction.id)
        })
        
    except AIInteractionLog.DoesNotExist:
        return Response({'error': 'تعامل یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error submitting AI feedback: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def get_ai_analytics(request):
    """Get AI analytics and performance metrics"""
    from .models import AIInteractionLog, AIResponsePattern
    
    try:
        # Get date range from query parameters
        days = int(request.GET.get('days', 30))
        from django.utils import timezone
        from datetime import timedelta
        
        since = timezone.now() - timedelta(days=days)
        
        # Basic statistics
        total_interactions = AIInteractionLog.objects.filter(created_at__gte=since).count()
        authenticated_interactions = AIInteractionLog.objects.filter(
            created_at__gte=since, 
            user__isnull=False
        ).count()
        
        # Satisfaction distribution
        satisfaction_stats = {}
        for choice in AIInteractionLog.SATISFACTION_LEVELS:
            count = AIInteractionLog.objects.filter(
                created_at__gte=since,
                user_satisfaction=choice[0]
            ).count()
            satisfaction_stats[choice[1]] = count
        
        # Domain distribution
        domain_stats = {}
        domains = ['مکاترونیک', 'مکانیک', 'کامپیوتر', 'برق', 'متاورس', 'عمومی']
        for domain in domains:
            count = AIInteractionLog.objects.filter(
                created_at__gte=since,
                domain_identified=domain
            ).count()
            domain_stats[domain] = count
        
        # Response quality metrics
        avg_quality_score = AIInteractionLog.objects.filter(
            created_at__gte=since
        ).aggregate(avg_score=models.Avg('response_quality_score'))['avg_score'] or 0
        
        # Pattern effectiveness
        active_patterns = AIResponsePattern.objects.filter(is_active=True).count()
        most_used_pattern = AIResponsePattern.objects.filter(
            is_active=True
        ).order_by('-usage_count').first()
        
        return Response({
            'period_days': days,
            'total_interactions': total_interactions,
            'authenticated_interactions': authenticated_interactions,
            'anonymous_interactions': total_interactions - authenticated_interactions,
            'satisfaction_distribution': satisfaction_stats,
            'domain_distribution': domain_stats,
            'average_quality_score': round(avg_quality_score, 2),
            'active_patterns_count': active_patterns,
            'most_used_pattern': {
                'type': most_used_pattern.pattern_type if most_used_pattern else None,
                'usage_count': most_used_pattern.usage_count if most_used_pattern else 0,
                'success_rate': most_used_pattern.success_rate if most_used_pattern else 0
            } if most_used_pattern else None
        })
        
    except Exception as e:
        logger.error(f"Error getting AI analytics: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def get_ai_interactions(request):
    """Get AI interactions with pagination"""
    from .models import AIInteractionLog
    from django.core.paginator import Paginator
    
    try:
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))
        
        interactions = AIInteractionLog.objects.all().order_by('-created_at')
        
        # Pagination
        paginator = Paginator(interactions, page_size)
        page_obj = paginator.get_page(page)
        
        # Serialize interactions
        interactions_data = []
        for interaction in page_obj:
            interactions_data.append({
                'id': str(interaction.id),
                'user': interaction.user.username if interaction.user else 'ناشناس',
                'user_input': interaction.user_input[:100] + '...' if len(interaction.user_input) > 100 else interaction.user_input,
                'ai_response': interaction.ai_response[:100] + '...' if len(interaction.ai_response) > 100 else interaction.ai_response,
                'interaction_type': interaction.get_interaction_type_display(),
                'user_satisfaction': interaction.get_user_satisfaction_display() if interaction.user_satisfaction else None,
                'response_quality_score': interaction.response_quality_score,
                'domain_identified': interaction.domain_identified,
                'keywords_detected': interaction.keywords_detected,
                'created_at': interaction.created_at
            })
        
        return Response({
            'total_pages': paginator.num_pages,
            'current_page': page_obj.number,
            'total_count': paginator.count,
            'results': interactions_data
        })
        
    except Exception as e:
        logger.error(f"Error getting AI interactions: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Blog System Views
@api_view(["GET"])
@permission_classes([AllowAny])
def get_blog_posts(request):
    """Get published blog posts with pagination"""
    from .models import BlogPost
    from .serializers import BlogPostListSerializer
    from django.core.paginator import Paginator
    from django.db import models
    
    posts = BlogPost.get_published_posts()
    
    # Filter by category if provided
    category = request.GET.get('category')
    if category:
        posts = posts.filter(category=category)
    
    # Search functionality
    search = request.GET.get('search')
    if search:
        posts = posts.filter(
            models.Q(title__icontains=search) | 
            models.Q(excerpt__icontains=search) |
            models.Q(content__icontains=search)
        )
    
    # Pagination
    page = int(request.GET.get('page', 1))
    per_page = int(request.GET.get('per_page', 10))
    paginator = Paginator(posts, per_page)
    
    try:
        page_obj = paginator.page(page)
    except Exception:
        page_obj = paginator.page(1)
    
    serializer = BlogPostListSerializer(page_obj.object_list, many=True)
    
    return Response({
        'count': paginator.count,
        'num_pages': paginator.num_pages,
        'current_page': page_obj.number,
        'results': serializer.data
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def get_blog_post(request, slug):
    """Get a single blog post by slug"""
    from .models import BlogPost
    from .serializers import BlogPostSerializer
    
    try:
        post = BlogPost.objects.get(slug=slug, status='published')
        
        # Increment view count
        post.view_count += 1
        post.save(update_fields=['view_count'])
        
        serializer = BlogPostSerializer(post)
        return Response(serializer.data)
    except BlogPost.DoesNotExist:
        return Response({'error': 'مقاله یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_blog_categories(request):
    """Get blog categories with post counts"""


# Scientific Content - Public detail by slug (for blog cards)
@api_view(["GET"])
@permission_classes([AllowAny])
def get_scientific_content_by_slug(request, slug: str):
    """Return a published scientific content item by slug and bump view count."""
    try:
        from .models import ScientificContent
        from .serializers import ScientificContentSerializer

        content = ScientificContent.objects.get(slug=slug, status='published')
        # Increment view count safely
        content.view_count = (content.view_count or 0) + 1
        content.save(update_fields=['view_count'])

        return Response(ScientificContentSerializer(content).data)
    except ScientificContent.DoesNotExist:
        return Response({'error': 'مطلب یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
    from .models import BlogPost
    
    categories = []
    for choice in BlogPost.CATEGORY_CHOICES:
        count = BlogPost.get_posts_by_category(choice[0]).count()
        categories.append({
            'value': choice[0],
            'label': choice[1],
            'count': count
        })
    
    return Response(categories)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_featured_posts(request):
    """Get featured blog posts"""
    from .models import BlogPost
    from .serializers import BlogPostListSerializer
    
    limit = int(request.GET.get('limit', 3))
    posts = BlogPost.get_featured_posts(limit)
    serializer = BlogPostListSerializer(posts, many=True)
    
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_recent_posts(request):
    """Get recent blog posts"""
    from .models import BlogPost
    from .serializers import BlogPostListSerializer
    
    limit = int(request.GET.get('limit', 5))
    posts = BlogPost.get_recent_posts(limit)
    serializer = BlogPostListSerializer(posts, many=True)
    
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_blog_post(request):
    """Create a new blog post (admin only)"""
    from .serializers import BlogPostCreateSerializer, BlogPostSerializer
    
    serializer = BlogPostCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        post = serializer.save()
        return Response({
            'message': 'مقاله با موفقیت ایجاد شد',
            'post': BlogPostSerializer(post).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def create_blog_comment(request, post_slug):
    """Create a comment for a blog post"""
    from .models import BlogPost
    from .serializers import BlogCommentCreateSerializer, BlogCommentSerializer
    
    try:
        post = BlogPost.objects.get(slug=post_slug, status='published')
    except BlogPost.DoesNotExist:
        return Response({'error': 'مقاله یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = BlogCommentCreateSerializer(data=request.data)
    if serializer.is_valid():
        comment = serializer.save(post=post)
        return Response({
            'message': 'نظر شما با موفقیت ثبت شد و پس از تایید نمایش داده خواهد شد',
            'comment': BlogCommentSerializer(comment).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_blog_comments(request, post_slug):
    """Get approved comments for a blog post"""
    from .models import BlogPost
    from .serializers import BlogCommentSerializer
    
    try:
        post = BlogPost.objects.get(slug=post_slug, status='published')
    except BlogPost.DoesNotExist:
        return Response({'error': 'مقاله یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
    
    comments = post.comments.filter(is_approved=True)
    serializer = BlogCommentSerializer(comments, many=True)
    
    return Response(serializer.data)


# File Upload APIs for separate storage backends
@api_view(['POST'])
@permission_classes([IsAdminUser])
def upload_scientific_content(request):
    """Upload scientific content (articles, books, videos) to Liara S3"""
    from .file_managers import scientific_file_manager
    
    file = request.FILES.get('file')
    if not file:
        return Response({'error': 'فایل الزامی است'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get content type
    content_type = file.content_type or 'application/octet-stream'
    is_video = content_type.startswith('video/')
    
    try:
        result = scientific_file_manager.upload_file(file, file.name, content_type)
        
        if result['success']:
            # For videos, return the public URL; for other files, use secure download endpoint
            if is_video and result.get('file_url'):
                # Videos should be publicly accessible
                return Response({
                    'message': 'فایل با موفقیت آپلود شد',
                    'file_url': result['file_url'],
                    'video_url': result['file_url'],  # Also set video_url for videos
                    'file_path': result['file_path'],
                    'file_size': result['file_size'],
                    'storage_type': result['storage_type']
                }, status=status.HTTP_201_CREATED)
            else:
                # For non-video files, use secure download endpoint
                secure_download = f"/api/v1/user-files/download/?path={result['file_path']}"
                return Response({
                    'message': 'فایل با موفقیت آپلود شد',
                    'file_url': result.get('file_url'),  # Include URL if available
                    'file_path': result['file_path'],
                    'download_endpoint': secure_download,
                    'file_size': result['file_size'],
                    'storage_type': result['storage_type']
                }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'error': result['error']
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error uploading scientific content: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_user_file(request):
    """Upload user files (orders, designs) to local storage"""
    from .file_managers import user_file_manager
    
    file = request.FILES.get('file')
    if not file:
        return Response({'error': 'فایل الزامی است'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get order_id if provided
    order_id = request.data.get('order_id')
    content_type = file.content_type or 'application/octet-stream'
    
    # Check file size
    max_size = settings.USER_FILES_MAX_SIZE
    if file.size > max_size:
        return Response({
            'error': f'حجم فایل نباید بیشتر از {max_size // (1024*1024)} مگابایت باشد'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        result = user_file_manager.upload_file(
            file, 
            file.name, 
            content_type,
            user_id=request.user.id,
            order_id=order_id
        )
        
        if result['success']:
            # Generate secure download endpoint for private files
            download_endpoint = f"/api/v1/user-files/download/?path={result['file_path']}"
            return Response({
                'message': 'فایل با موفقیت آپلود شد',
                'file_path': result['file_path'],
                'download_endpoint': download_endpoint,
                'file_size': result['file_size'],
                'storage_type': result['storage_type']
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'error': result['error']
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error uploading user file: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_delivery_file(request):
    """Upload a delivery file for an order"""
    from .file_managers import user_file_manager
    from .serializers import DeliveryFileUploadSerializer
    from django.utils import timezone
    from datetime import timedelta
    
    serializer = DeliveryFileUploadSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if user has permission to upload for this order
    order_id = serializer.validated_data['order_id']
    try:
        order = Order.objects.get(id=order_id)
        
        # Check permission: admin or contractor assigned to order
        if not (request.user.is_staff or 
                (hasattr(request.user, 'contractor_profile') and 
                 order.contractor == request.user.contractor_profile)):
            return Response(
                {'error': 'شما مجوز آپلود فایل برای این سفارش را ندارید'},
                status=status.HTTP_403_FORBIDDEN
            )
        
    except Order.DoesNotExist:
        return Response({'error': 'سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
    
    file = serializer.validated_data['file']
    description = serializer.validated_data.get('description', '')
    expires_in_days = serializer.validated_data.get('expires_in_days', 30)
    
    try:
        # Upload file
        result = user_file_manager.upload_delivery_file(
            file,
            file.name,
            file.content_type or 'application/octet-stream',
            order_id
        )
        
        if result['success']:
            # Create DeliveryFile record
            expires_at = timezone.now() + timedelta(days=expires_in_days)
            
            delivery_file = DeliveryFile.objects.create(
                order=order,
                file_path=result['file_path'],
                file_name=file.name,
                file_size=result['file_size'],
                content_type=file.content_type or 'application/octet-stream',
                uploaded_by=request.user,
                description=description,
                expires_at=expires_at
            )
            
            # Notify customer
            Notification.objects.create(
                user=order.user,
                title='فایل جدید برای سفارش شما',
                message=f'فایل جدید "{file.name}" برای سفارش {order.order_number} آپلود شد',
                link=f'/orders/{order.id}'
            )
            
            from .serializers import DeliveryFileSerializer
            serializer = DeliveryFileSerializer(delivery_file, context={'request': request})
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'error': result['error']
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error uploading delivery file: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_delivery_file(request, file_id):
    """Download a delivery file"""
    from django.http import HttpResponse, Http404
    from django.core.files.storage import default_storage
    import mimetypes
    
    try:
        delivery_file = DeliveryFile.objects.get(id=file_id)
        
        # Check permission: owner or admin
        if not (request.user == delivery_file.order.user or request.user.is_staff):
            return Response(
                {'error': 'شما مجوز دانلود این فایل را ندارید'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if file is active and not expired
        if not delivery_file.is_active:
            return Response(
                {'error': 'این فایل غیرفعال شده است'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if delivery_file.is_expired():
            return Response(
                {'error': 'مدت اعتبار این فایل به پایان رسیده است'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get file from storage
        if default_storage.exists(delivery_file.file_path):
            file_handle = default_storage.open(delivery_file.file_path, 'rb')
            
            # Increment download count
            delivery_file.increment_download()
            
            # Prepare response
            response = HttpResponse(
                file_handle.read(),
                content_type=delivery_file.content_type
            )
            response['Content-Disposition'] = f'attachment; filename="{delivery_file.file_name}"'
            response['Content-Length'] = delivery_file.file_size
            
            return response
        else:
            raise Http404("فایل یافت نشد")
            
    except DeliveryFile.DoesNotExist:
        return Response({'error': 'فایل یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error downloading delivery file: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_order_deliveries(request, order_id):
    """List all delivery files for an order"""
    try:
        order = Order.objects.get(id=order_id)
        
        # Check permission: owner or admin
        if not (request.user == order.user or request.user.is_staff):
            return Response(
                {'error': 'شما مجوز مشاهده فایل‌های این سفارش را ندارید'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        delivery_files = order.delivery_files.filter(is_active=True)
        
        from .serializers import DeliveryFileSerializer
        serializer = DeliveryFileSerializer(
            delivery_files, 
            many=True, 
            context={'request': request}
        )
        
        return Response(serializer.data)
        
    except Order.DoesNotExist:
        return Response({'error': 'سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error listing delivery files: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_user_private_file(request):
    """Secure download for user private files stored locally.
    Accepts query param ?path=<file_path relative to MEDIA_ROOT> (e.g., user-uploads/users/<user_id>/.../file.ext)
    Authorization:
      - Admins can download any user-uploads or deliveries
      - Non-admins can only download paths under user-uploads/users/<their_user_id>/
    Security:
      - Prevent path traversal; ensure resolved path stays under MEDIA_ROOT
      - Only allow roots: MEDIA_ROOT/user-uploads and MEDIA_ROOT/deliveries
    """
    from django.conf import settings
    import os

    file_path = request.GET.get('path')
    if not file_path:
        return Response({'error': 'path query parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Normalize and build absolute path
    normalized_rel_path = os.path.normpath(file_path).lstrip(os.sep)
    abs_path = os.path.abspath(os.path.join(settings.MEDIA_ROOT, normalized_rel_path))

    # Enforce containment within MEDIA_ROOT
    media_root_abs = os.path.abspath(str(settings.MEDIA_ROOT))
    if not abs_path.startswith(media_root_abs + os.sep) and abs_path != media_root_abs:
        return Response({'error': 'Invalid path'}, status=status.HTTP_400_BAD_REQUEST)

    # Restrict to allowed roots
    allowed_roots = [
        os.path.abspath(os.path.join(settings.MEDIA_ROOT, 'user-uploads')),
        os.path.abspath(os.path.join(settings.MEDIA_ROOT, 'deliveries')),
    ]
    if not any(abs_path.startswith(root + os.sep) or abs_path == root for root in allowed_roots):
        return Response({'error': 'Access to this path is not allowed'}, status=status.HTTP_403_FORBIDDEN)

    # Authorization: admin OR owner if path starts with their user directory OR participant in conversation (message attachment)
    is_admin = request.user.is_staff or request.user.is_superuser
    if not is_admin:
        expected_user_prefix = os.path.abspath(os.path.join(settings.MEDIA_ROOT, 'user-uploads', 'users', str(request.user.id)))
        if not (abs_path.startswith(expected_user_prefix + os.sep) or abs_path == expected_user_prefix):
            # Allow if this path is a direct message attachment and user is in the conversation
            att = DirectMessageAttachment.objects.filter(file_path=normalized_rel_path).select_related('message').first()
            if not att or not ConversationParticipant.objects.filter(conversation_id=att.message.conversation_id, user=request.user).exists():
                return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

    # File existence
    if not os.path.exists(abs_path) or not os.path.isfile(abs_path):
        return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

    # Content type
    content_type, _ = mimetypes.guess_type(abs_path)
    content_type = content_type or 'application/octet-stream'

    # Stream file (private; no public URL exposure)
    response = FileResponse(open(abs_path, 'rb'), content_type=content_type)
    # Optional: attachment; comment out to display inline where supported
    # filename = os.path.basename(abs_path)
    # response["Content-Disposition"] = f"attachment; filename=\"{filename}\""
    return response