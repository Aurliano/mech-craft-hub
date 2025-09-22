import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useServiceFields } from '@/hooks/useAuth';
import MultiFileUpload from './MultiFileUpload';
import OrderPreview from './OrderPreview';
import DocumentationSection from './DocumentationSection';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

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

interface DynamicServiceFormProps {
  serviceId: string;
  formData: Record<string, any>;
  onFieldChange: (fieldKey: string, value: any) => void;
  needsDocumentation: boolean;
  onNeedsDocumentationChange: (value: boolean) => void;
  documentationOptions: Record<string, boolean>;
  onDocumentationOptionChange: (option: string, checked: boolean) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

export function DynamicServiceForm({
  serviceId,
  formData,
  onFieldChange,
  needsDocumentation,
  onNeedsDocumentationChange,
  documentationOptions,
  onDocumentationOptionChange,
  notes,
  onNotesChange,
  onSubmit,
  isSubmitting = false
}: DynamicServiceFormProps) {
  const { data: fields = [], isLoading, error } = useServiceFields(serviceId);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile[]>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Validation functions
  const validateField = (field: any, value: any): string | null => {
    if (field.is_required && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${field.name} الزامی است`;
    }

    if (field.type === 'number' && value) {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return `${field.name} باید عدد معتبر باشد`;
      }
      
      if (field.validation_rules) {
        const rules = field.validation_rules;
        if (rules.min !== undefined && numValue < rules.min) {
          return `${field.name} باید حداقل ${rules.min} باشد`;
        }
        if (rules.max !== undefined && numValue > rules.max) {
          return `${field.name} باید حداکثر ${rules.max} باشد`;
        }
      }
    }

    if (field.type === 'text' && value && field.validation_rules) {
      const rules = field.validation_rules;
      if (rules.minLength && value.length < rules.minLength) {
        return `${field.name} باید حداقل ${rules.minLength} کاراکتر باشد`;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return `${field.name} باید حداکثر ${rules.maxLength} کاراکتر باشد`;
      }
      if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
        return `${field.name} فرمت صحیح ندارد`;
      }
    }

    if (field.type === 'file' && field.is_required) {
      const files = uploadedFiles[field.field_key] || [];
      const completedFiles = files.filter(f => f.status === 'completed');
      if (completedFiles.length === 0) {
        return `${field.name} الزامی است`;
      }
    }

    return null;
  };

  const validateAllFields = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      const value = formData[field.field_key];
      const error = validateField(field, value);
      if (error) {
        errors[field.field_key] = error;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleFieldChange = (fieldKey: string, value: any) => {
    onFieldChange(fieldKey, value);
    
    // Mark field as touched
    setTouchedFields(prev => new Set([...prev, fieldKey]));
    
    // Clear validation error for this field
    if (validationErrors[fieldKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }
  };

  const handleFilesChange = (fieldKey: string, files: UploadedFile[]) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fieldKey]: files
    }));
    
    // Update form data with file URLs
    const fileUrls = files
      .filter(file => file.status === 'completed')
      .map(file => file.url);
    handleFieldChange(fieldKey, fileUrls);
  };

  const handlePreview = () => {
    if (validateAllFields()) {
      setShowPreview(true);
    }
  };

  const handleEdit = () => {
    setShowPreview(false);
  };

  const handleConfirmSubmit = () => {
    if (validateAllFields() && onSubmit) {
      onSubmit();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !fields) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">خطا در بارگذاری فیلدهای سرویس</p>
        </CardContent>
      </Card>
    );
  }

  if (showPreview) {
    return (
      <OrderPreview
        serviceName="سرویس نقشه‌کشی"
        fields={fields}
        fieldValues={formData}
        uploadedFiles={uploadedFiles}
        needsDocumentation={needsDocumentation}
        notes={notes}
        onConfirm={handleConfirmSubmit}
        onEdit={handleEdit}
        isSubmitting={isSubmitting}
      />
    );
  }

  const renderField = (field: any) => {
    const value = formData[field.field_key] || '';
    const hasError = validationErrors[field.field_key] && touchedFields.has(field.field_key);
    const isValid = !hasError && touchedFields.has(field.field_key) && value;

    switch (field.type) {
      case 'text':
        return (
          <div className="space-y-1">
            <Input
              id={field.field_key}
              value={value}
              onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
              placeholder={field.help_text}
              className={hasError ? 'border-destructive' : isValid ? 'border-green-500' : ''}
            />
            {hasError && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {validationErrors[field.field_key]}
              </div>
            )}
            {isValid && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                صحیح
              </div>
            )}
          </div>
        );

      case 'number':
        return (
          <div className="space-y-1">
            <Input
              id={field.field_key}
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
              placeholder={field.help_text}
              className={hasError ? 'border-destructive' : isValid ? 'border-green-500' : ''}
            />
            {hasError && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {validationErrors[field.field_key]}
              </div>
            )}
            {isValid && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                صحیح
              </div>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-1">
            <Textarea
              id={field.field_key}
              value={value}
              onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
              placeholder={field.help_text}
              rows={3}
              className={hasError ? 'border-destructive' : isValid ? 'border-green-500' : ''}
            />
            {hasError && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {validationErrors[field.field_key]}
              </div>
            )}
            {isValid && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                صحیح
              </div>
            )}
          </div>
        );

      case 'select':
        return (
          <div className="space-y-1">
            <Select value={value} onValueChange={(val) => handleFieldChange(field.field_key, val)}>
              <SelectTrigger id={field.field_key} className={hasError ? 'border-destructive' : isValid ? 'border-green-500' : ''}>
                <SelectValue placeholder={field.help_text} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: any, index: number) => {
                  const optionValue = typeof option === 'string' ? option : option.value || option.label || String(option);
                  const optionLabel = typeof option === 'string' ? option : option.label || option.value || String(option);
                  return (
                    <SelectItem key={optionValue || index} value={optionValue}>
                      {optionLabel}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {hasError && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {validationErrors[field.field_key]}
              </div>
            )}
            {isValid && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                صحیح
              </div>
            )}
          </div>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            <div className="space-y-2">
              {field.options?.map((option: any, index: number) => {
                const optionValue = typeof option === 'string' ? option : option.value || option.label || String(option);
                const optionLabel = typeof option === 'string' ? option : option.label || option.value || String(option);
                return (
                  <div key={optionValue || index} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`${field.field_key}-${optionValue}`}
                      checked={selectedValues.includes(optionValue)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleFieldChange(field.field_key, [...selectedValues, optionValue]);
                        } else {
                          handleFieldChange(field.field_key, selectedValues.filter((v: string) => v !== optionValue));
                        }
                      }}
                    />
                    <Label htmlFor={`${field.field_key}-${optionValue}`}>{optionLabel}</Label>
                  </div>
                );
              })}
            </div>
            {hasError && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {validationErrors[field.field_key]}
              </div>
            )}
            {isValid && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                صحیح
              </div>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id={field.field_key}
                checked={!!value}
                onCheckedChange={(checked) => handleFieldChange(field.field_key, checked)}
              />
              <Label htmlFor={field.field_key}>{field.name}</Label>
            </div>
            {hasError && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {validationErrors[field.field_key]}
              </div>
            )}
          </div>
        );

      case 'file':
        return (
          <div className="space-y-1">
            <MultiFileUpload
              fieldKey={field.field_key}
              label={field.name}
              isRequired={field.is_required}
              helpText={field.help_text}
              maxFiles={10}
              maxSizePerFile={200}
              acceptedTypes={['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.stp', '.step', '.igs', '.iges', '.dwg', '.dxf', '.stl']}
              onFilesChange={(files) => handleFilesChange(field.field_key, files)}
              uploadedFiles={uploadedFiles[field.field_key] || []}
              contextId={serviceId}
            />
            {hasError && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {validationErrors[field.field_key]}
              </div>
            )}
            {isValid && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                صحیح
              </div>
            )}
          </div>
        );

      case 'date':
        return (
          <div className="space-y-1">
            <Input
              id={field.field_key}
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
              className={hasError ? 'border-destructive' : isValid ? 'border-green-500' : ''}
            />
            {hasError && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {validationErrors[field.field_key]}
              </div>
            )}
            {isValid && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                صحیح
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-1">
            <Input
              id={field.field_key}
              value={value}
              onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
              placeholder={field.help_text}
              className={hasError ? 'border-destructive' : isValid ? 'border-green-500' : ''}
            />
            {hasError && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {validationErrors[field.field_key]}
              </div>
            )}
            {isValid && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                صحیح
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>اطلاعات سفارش</CardTitle>
        <CardDescription>
          لطفاً فیلدهای زیر را با دقت پر کنید
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Validation Summary */}
        {Object.keys(validationErrors).length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              لطفاً خطاهای زیر را برطرف کنید:
              <ul className="mt-2 list-disc list-inside">
                {Object.values(validationErrors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_key} className="text-sm font-medium">
              {field.name}
              {field.is_required && <span className="text-destructive mr-1">*</span>}
            </Label>
            {renderField(field)}
            {field.help_text && (
              <p className="text-xs text-muted-foreground">{field.help_text}</p>
            )}
          </div>
        ))}

        {/* Documentation Section */}
        <DocumentationSection
          needsDocumentation={needsDocumentation}
          onNeedsDocumentationChange={onNeedsDocumentationChange}
          documentationOptions={documentationOptions}
          onDocumentationOptionChange={onDocumentationOptionChange}
          serviceSupportsDocumentation={true}
        />

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">
            توضیحات اضافی
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="توضیحات تکمیلی در مورد پروژه..."
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handlePreview}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'در حال بارگذاری...' : 'پیش‌نمایش سفارش'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
