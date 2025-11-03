from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
import json
import mimetypes
from .models import ScientificContent
from .file_manager import file_manager
from .serializers import ScientificContentSerializer
from django.utils.text import slugify
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_content_file(request):
    """آپلود فایل برای محتوای علمی"""
    try:
        if 'file' not in request.FILES:
            return Response({
                'error': 'فایل ارسال نشده است'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        file_obj = request.FILES['file']
        file_name = file_obj.name
        content_type = file_obj.content_type or mimetypes.guess_type(file_name)[0]
        
        # بررسی نوع فایل مجاز
        allowed_types = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'video/mp4',
            'video/avi',
            'video/mov',
            'application/zip',
            'application/x-rar-compressed',
            'application/x-7z-compressed'
        ]
        
        if content_type not in allowed_types:
            return Response({
                'error': 'نوع فایل مجاز نیست'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # بررسی حجم فایل (حداکثر 100MB)
        max_size = 100 * 1024 * 1024  # 100MB
        if file_obj.size > max_size:
            return Response({
                'error': 'حجم فایل بیش از حد مجاز است (حداکثر 100MB)'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # آپلود فایل
        logger.info(f"Attempting to upload file: {file_name}, size: {file_obj.size}, content_type: {content_type}")
        upload_result = file_manager.upload_file(file_obj, file_name, content_type)
        logger.info(f"Upload result: success={upload_result.get('success')}, error={upload_result.get('error', 'None')}")
        
        if not upload_result['success']:
            logger.error(f"File upload failed: {upload_result.get('error')}")
            return Response({
                'error': f'خطا در آپلود فایل: {upload_result["error"]}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # ذخیره اطلاعات فایل در دیتابیس
        title = request.data.get('title', file_name)
        # Generate slug from title if not provided
        slug = request.data.get('slug', '')
        if not slug:
            slug = slugify(title)
            # Ensure slug is unique by appending timestamp if needed
            base_slug = slug
            counter = 1
            while ScientificContent.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
        
        content_data = {
            'title': title,
            'slug': slug,
            'excerpt': request.data.get('excerpt', ''),
            'content': request.data.get('content', ''),
            'content_type': request.data.get('content_type', 'book'),
            'category': request.data.get('category', 'general'),
            'status': request.data.get('status', 'published'),
            'author': request.user.id,
            'file_name': file_name,
            'file_type': content_type,
            'file_path': upload_result['file_path'],
            'download_url': upload_result['file_url'],
            'file_size': upload_result['file_size'],
            'is_public': request.data.get('is_public', True)
        }
        
        logger.info(f"Creating ScientificContent with data: title={content_data.get('title')}, slug={content_data.get('slug')}")
        serializer = ScientificContentSerializer(data=content_data)
        if serializer.is_valid():
            content = serializer.save()
            logger.info(f"ScientificContent created successfully: {content.id}")
            return Response({
                'success': True,
                'message': 'فایل با موفقیت آپلود شد',
                'content': ScientificContentSerializer(content).data
            }, status=status.HTTP_201_CREATED)
        else:
            # در صورت خطا در ذخیره، فایل را حذف کنید
            logger.error(f"Serializer validation failed: {serializer.errors}")
            logger.info(f"Deleting uploaded file from storage: {upload_result['file_path']}")
            file_manager.delete_file(upload_result['file_path'])
            return Response({
                'error': 'خطا در ذخیره اطلاعات',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"Error in upload_content_file: {str(e)}\n{error_details}")
        return Response({
            'error': f'خطای سرور: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def download_content_file(request, content_id):
    """دانلود فایل محتوای علمی"""
    try:
        content = ScientificContent.objects.get(id=content_id, status='published')
        
        # افزایش تعداد دانلود
        content.download_count += 1
        content.save(update_fields=['download_count'])
        
        # دریافت URL فایل
        file_url = file_manager.get_file_url(content.file_path, content.is_public)
        
        if not file_url:
            return Response({
                'error': 'فایل یافت نشد'
            }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'download_url': file_url,
            'file_name': content.file_name,
            'file_size': content.file_size
        })
    
    except ScientificContent.DoesNotExist:
        return Response({
            'error': 'محتوا یافت نشد'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in download_content_file: {str(e)}")
        return Response({
            'error': 'خطای سرور'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_content_file(request, content_id):
    """حذف فایل محتوای علمی"""
    try:
        content = ScientificContent.objects.get(id=content_id, author=request.user)
        
        # حذف فایل از storage
        if content.file_path:
            file_manager.delete_file(content.file_path)
        
        # حذف رکورد از دیتابیس
        content.delete()
        
        return Response({
            'success': True,
            'message': 'فایل با موفقیت حذف شد'
        })
    
    except ScientificContent.DoesNotExist:
        return Response({
            'error': 'محتوا یافت نشد یا شما مجاز به حذف آن نیستید'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in delete_content_file: {str(e)}")
        return Response({
            'error': 'خطای سرور'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_file_info(request, content_id):
    """دریافت اطلاعات فایل"""
    try:
        content = ScientificContent.objects.get(id=content_id, status='published')
        
        file_info = file_manager.get_file_info(content.file_path)
        
        return Response({
            'file_name': content.file_name,
            'file_size': content.file_size,
            'file_type': content.file_type,
            'download_count': content.download_count,
            'is_public': content.is_public,
            'file_info': file_info
        })
    
    except ScientificContent.DoesNotExist:
        return Response({
            'error': 'محتوا یافت نشد'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in get_file_info: {str(e)}")
        return Response({
            'error': 'خطای سرور'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
