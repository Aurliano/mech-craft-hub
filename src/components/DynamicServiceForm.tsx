import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useServiceFields } from '@/hooks/useServiceFields';
import MultiFileUpload from './MultiFileUpload';
import OrderPreview from './OrderPreview';

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
  notes,
  onNotesChange,
  onSubmit,
  isSubmitting = false
}: DynamicServiceFormProps) {
  const { data: fields, isLoading, error } = useServiceFields(serviceId);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile[]>>({});
  const [showPreview, setShowPreview] = useState(false);

  const handleFilesChange = (fieldKey: string, files: UploadedFile[]) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fieldKey]: files
    }));
    
    // Update form data with file URLs
    const fileUrls = files
      .filter(file => file.status === 'completed')
      .map(file => file.url);
    onFieldChange(fieldKey, fileUrls);
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleEdit = () => {
    setShowPreview(false);
  };

  const handleConfirmSubmit = () => {
    if (onSubmit) {
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

    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.field_key}
            value={value}
            onChange={(e) => onFieldChange(field.field_key, e.target.value)}
            placeholder={field.help_text}
          />
        );

      case 'number':
        return (
          <Input
            id={field.field_key}
            type="number"
            value={value}
            onChange={(e) => onFieldChange(field.field_key, e.target.value)}
            placeholder={field.help_text}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={field.field_key}
            value={value}
            onChange={(e) => onFieldChange(field.field_key, e.target.value)}
            placeholder={field.help_text}
            rows={3}
          />
        );

      case 'select':
        return (
          <Select value={value} onValueChange={(val) => onFieldChange(field.field_key, val)}>
            <SelectTrigger id={field.field_key}>
              <SelectValue placeholder={field.help_text} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {field.options?.map((option: string) => (
              <div key={option} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id={`${field.field_key}-${option}`}
                  checked={selectedValues.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onFieldChange(field.field_key, [...selectedValues, option]);
                    } else {
                      onFieldChange(field.field_key, selectedValues.filter((v: string) => v !== option));
                    }
                  }}
                />
                <Label htmlFor={`${field.field_key}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id={field.field_key}
              checked={!!value}
              onCheckedChange={(checked) => onFieldChange(field.field_key, checked)}
            />
            <Label htmlFor={field.field_key}>{field.name}</Label>
          </div>
        );

      case 'file':
        return (
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
        );

      case 'date':
        return (
          <Input
            id={field.field_key}
            type="date"
            value={value}
            onChange={(e) => onFieldChange(field.field_key, e.target.value)}
          />
        );

      default:
        return (
          <Input
            id={field.field_key}
            value={value}
            onChange={(e) => onFieldChange(field.field_key, e.target.value)}
            placeholder={field.help_text}
          />
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

        {/* Documentation Checkbox */}
        <div className="flex items-center space-x-2 space-x-reverse pt-4 border-t">
          <Checkbox
            id="needs_documentation"
            checked={needsDocumentation}
            onCheckedChange={onNeedsDocumentationChange}
          />
          <Label htmlFor="needs_documentation" className="text-sm">
            نیاز به مستندسازی فنی
          </Label>
        </div>

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
