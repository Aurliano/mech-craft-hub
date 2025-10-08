import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, File, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  file: File;
  url: string;
  originalName: string;
  size: number;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

interface ServiceField {
  id: string;
  name: string;
  field_key: string;
  type: 'text' | 'number' | 'file' | 'select' | 'multiselect' | 'checkbox' | 'date' | 'textarea';
  options?: { value: string; label: string }[];
  is_required: boolean;
  order: number;
  help_text?: string;
  validation_rules?: Record<string, unknown>;
}

interface OrderPreviewProps {
  serviceName: string;
  fields: ServiceField[];
  fieldValues: Record<string, unknown>;
  uploadedFiles: Record<string, UploadedFile[]>;
  needsDocumentation?: boolean;
  notes?: string;
  onConfirm: () => void;
  onEdit: () => void;
  isSubmitting?: boolean;
  className?: string;
}

const OrderPreview: React.FC<OrderPreviewProps> = ({
  serviceName,
  fields,
  fieldValues,
  uploadedFiles,
  needsDocumentation = false,
  notes = '',
  onConfirm,
  onEdit,
  isSubmitting = false,
  className
}) => {
  // Add error boundary for this component
  try {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFieldValue = (field: ServiceField) => {
    const value = fieldValues[field.field_key];
    
    if (field.type === 'file') {
      const files = uploadedFiles[field.field_key] || [];
      return files.filter(file => file.status === 'completed');
    }
    
    if (field.type === 'multiselect') {
      return Array.isArray(value) ? value : [];
    }
    
    if (field.type === 'checkbox') {
      return value ? 'بله' : 'خیر';
    }
    
    if (field.type === 'date') {
      return value ? new Date(value).toLocaleDateString('fa-IR') : '';
    }
    
    return value || '';
  };

  const isFieldFilled = (field: ServiceField) => {
    const value = getFieldValue(field);
    
    if (field.type === 'file') {
      return Array.isArray(value) && value.length > 0;
    }
    
    if (field.type === 'multiselect') {
      return Array.isArray(value) && value.length > 0;
    }
    
    return value !== '' && value !== null && value !== undefined;
  };

  const getFieldDisplayValue = (field: ServiceField) => {
    const value = getFieldValue(field);
    
    if (field.type === 'file') {
      console.log('File field value:', value, 'Type:', typeof value, 'IsArray:', Array.isArray(value));
      
      // Check if value is an array of URLs (from DynamicServiceForm)
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
        const urls = value as string[];
        return urls.map((url, index) => ({
          id: `url-${index}`,
          file: {} as File, // Mock file object
          url: url,
          originalName: `فایل ${index + 1}`,
          size: 0,
          status: 'completed' as const,
          progress: 100
        }));
      }
      
      // Check if value is an array of UploadedFile objects
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
        const files = value as UploadedFile[];
        if (files.length === 0) return 'هیچ فایلی آپلود نشده';
        return files; // Return the actual array for rendering
      }
      
      return 'هیچ فایلی آپلود نشده';
    }
    
    if (field.type === 'multiselect') {
      if (Array.isArray(value)) {
        const values = value as string[];
        if (values.length === 0) return 'هیچ گزینه‌ای انتخاب نشده';
        return values.join('، ');
      }
      return 'هیچ گزینه‌ای انتخاب نشده';
    }
    
    if (field.type === 'textarea') {
      const text = value as string;
      return text.length > 100 ? text.substring(0, 100) + '...' : text;
    }
    
    return value;
  };

  const getFieldIcon = (field: ServiceField) => {
    const isFilled = isFieldFilled(field);
    const isRequired = field.is_required;
    
    if (isFilled) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    } else if (isRequired) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getFieldStatus = (field: ServiceField) => {
    const isFilled = isFieldFilled(field);
    const isRequired = field.is_required;
    
    if (isFilled) {
      return <Badge variant="default" className="bg-green-500">پر شده</Badge>;
    } else if (isRequired) {
      return <Badge variant="destructive">اجباری - خالی</Badge>;
    } else {
      return <Badge variant="secondary">اختیاری - خالی</Badge>;
    }
  };

  const requiredFields = fields.filter(field => field.is_required);
  const filledRequiredFields = requiredFields.filter(field => isFieldFilled(field));
  const missingRequiredFields = requiredFields.filter(field => !isFieldFilled(field));

  const canSubmit = missingRequiredFields.length === 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <File className="h-5 w-5" />
            پیش‌نمایش سفارش {serviceName}
          </CardTitle>
          <CardDescription>
            لطفاً اطلاعات زیر را بررسی کرده و در صورت صحیح بودن، سفارش را تایید کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{filledRequiredFields.length}</div>
              <div className="text-sm text-green-600">فیلدهای اجباری پر شده</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{missingRequiredFields.length}</div>
              <div className="text-sm text-red-600">فیلدهای اجباری خالی</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{fields.length}</div>
              <div className="text-sm text-blue-600">کل فیلدها</div>
            </div>
          </div>

          {!canSubmit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <XCircle className="h-5 w-5" />
                <span className="font-semibold">فیلدهای اجباری خالی:</span>
              </div>
              <ul className="text-sm text-red-600 space-y-1">
                {missingRequiredFields.map(field => (
                  <li key={field.id}>• {field.name}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fields Preview */}
      <Card>
        <CardHeader>
          <CardTitle>جزئیات سفارش</CardTitle>
          <CardDescription>
            تمام فیلدهای پر شده و خالی در زیر نمایش داده شده است
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields
            .sort((a, b) => a.order - b.order)
            .map((field) => {
              const isFilled = isFieldFilled(field);
              const value = getFieldDisplayValue(field);
              
              return (
                <div key={field.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getFieldIcon(field)}
                      <span className="font-medium">{field.name}</span>
                      {field.is_required && (
                        <span className="text-red-500 text-sm">*</span>
                      )}
                    </div>
                    {getFieldStatus(field)}
                  </div>
                  
                  <div className={cn(
                    "p-3 rounded-lg border",
                    isFilled 
                      ? "bg-green-50 border-green-200" 
                      : field.is_required 
                        ? "bg-red-50 border-red-200" 
                        : "bg-gray-50 border-gray-200"
                  )}>
                    <div className="text-sm text-gray-700">
                      {field.type === 'file' ? (
                        <div className="space-y-2">
                          <div className="font-medium">فایل‌های آپلود شده:</div>
                          {Array.isArray(value) ? (
                            value.map((file, index) => (
                              <div key={file.id || index} className="flex items-center justify-between bg-white p-2 rounded border">
                                <div className="flex items-center gap-2">
                                  <File className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm">{file.originalName || file.name || `فایل ${index + 1}`}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">{formatFileSize(file.size || 0)}</span>
                                  <a 
                                    href={file.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-500 hover:text-blue-700"
                                  >
                                    مشاهده
                                  </a>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-500">
                              {typeof value === 'string' ? value : 'فایل آپلود شده'}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span className={cn(
                            isFilled ? "text-gray-900" : "text-gray-500 italic"
                          )}>
                            {isFilled ? value : 'پر نشده'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {field.help_text && (
                      <div className="text-xs text-gray-500 mt-1">
                        راهنما: {field.help_text}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          {/* Additional Information */}
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">نیاز به مستندسازی فنی</span>
              <Badge variant={needsDocumentation ? "default" : "secondary"}>
                {needsDocumentation ? 'بله' : 'خیر'}
              </Badge>
            </div>
            
            {notes && (
              <div>
                <div className="font-medium mb-2">توضیحات اضافی:</div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-700">{notes}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button
          variant="outline"
          onClick={onEdit}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          ویرایش اطلاعات
        </Button>
        <Button
          onClick={onConfirm}
          disabled={!canSubmit || isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? 'در حال ثبت...' : 'تایید و ثبت سفارش'}
        </Button>
      </div>
    </div>
  );
  } catch (error) {
    console.error('Error in OrderPreview:', error);
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-red-600">
            خطا در نمایش پیش‌نمایش
          </CardTitle>
          <CardDescription className="text-center">
            متأسفانه خطایی در نمایش پیش‌نمایش سفارش رخ داده است
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600 mb-4">
            لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید
          </p>
          <Button
            variant="outline"
            onClick={onEdit}
            className="w-full sm:w-auto"
          >
            بازگشت به فرم
          </Button>
        </CardContent>
      </Card>
    );
  }
};

export default OrderPreview;
