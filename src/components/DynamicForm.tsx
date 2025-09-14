import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Upload, FileText, Wrench, Package } from "lucide-react";
import { uploadFile } from "@/lib/api";
import MultiFileUpload from "./MultiFileUpload";
import OrderPreview from "./OrderPreview";

interface ServiceField {
  id: string;
  name: string;
  field_key: string;
  type: 'text' | 'number' | 'file' | 'select' | 'multiselect' | 'checkbox' | 'date' | 'textarea';
  options?: any[];
  is_required: boolean;
  order: number;
  help_text?: string;
  validation_rules?: any;
}

interface ServiceTab {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  order: number;
  is_active: boolean;
  fields: ServiceField[];
}

interface Service {
  id: string;
  name: string;
  type: string;
  tabs: ServiceTab[];
  fields: ServiceField[];
}

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

interface DynamicFormProps {
  service: Service;
  onSubmit: (fieldValues: Record<string, any>, files: UploadedFile[]) => void;
  loading?: boolean;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ service, onSubmit, loading = false }) => {
  const [activeTab, setActiveTab] = useState<string>('');
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile[]>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [needsDocumentation, setNeedsDocumentation] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (service.tabs && service.tabs.length > 0) {
      setActiveTab(service.tabs[0].name);
    }
  }, [service]);

  const handleFieldChange = (fieldKey: string, value: any) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const handleFilesChange = (fieldKey: string, files: UploadedFile[]) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fieldKey]: files
    }));
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleEdit = () => {
    setShowPreview(false);
  };

  const handleConfirmSubmit = () => {
    // جمع‌آوری تمام فایل‌های آپلود شده
    const allUploadedFiles: UploadedFile[] = [];
    Object.values(uploadedFiles).forEach(files => {
      allUploadedFiles.push(...files.filter(file => file.status === 'completed'));
    });

    // ترکیب field_values و uploaded_files URLs
    const fileUrls: Record<string, string[]> = {};
    Object.entries(uploadedFiles).forEach(([fieldKey, files]) => {
      fileUrls[fieldKey] = files
        .filter(file => file.status === 'completed')
        .map(file => file.url);
    });

    const allValues = {
      ...fieldValues,
      ...fileUrls,
      needsDocumentation,
      notes
    };

    onSubmit(allValues, allUploadedFiles);
  };

  const renderField = (field: ServiceField) => {
    const value = fieldValues[field.field_key] || '';
    const isRequired = field.is_required;

    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_key}>
              {field.name} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.field_key}
              value={value}
              onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
              placeholder={field.help_text}
              required={isRequired}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_key}>
              {field.name} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.field_key}
              value={value}
              onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
              placeholder={field.help_text}
              required={isRequired}
            />
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_key}>
              {field.name} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.field_key}
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
              placeholder={field.help_text}
              required={isRequired}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_key}>
              {field.name} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => handleFieldChange(field.field_key, val)}>
              <SelectTrigger>
                <SelectValue placeholder={field.help_text} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => (
                  <SelectItem key={index} value={option.value || option}>
                    {option.label || option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox
              id={field.field_key}
              checked={value}
              onCheckedChange={(checked) => handleFieldChange(field.field_key, checked)}
              required={isRequired}
            />
            <Label htmlFor={field.field_key}>
              {field.name} {isRequired && <span className="text-red-500">*</span>}
            </Label>
          </div>
        );

      case 'file':
        return (
          <MultiFileUpload
            key={field.id}
            fieldKey={field.field_key}
            label={field.name}
            isRequired={isRequired}
            helpText={field.help_text}
            maxFiles={10}
            maxSizePerFile={200}
            acceptedTypes={['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.stp', '.step', '.igs', '.iges', '.dwg', '.dxf']}
            onFilesChange={(files) => handleFilesChange(field.field_key, files)}
            uploadedFiles={uploadedFiles[field.field_key] || []}
            disabled={loading}
            contextId={service.id}
          />
        );

      default:
        return null;
    }
  };

  if (!service.tabs || service.tabs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>فرم سرویس</CardTitle>
          <CardDescription>هیچ تب یا فیلدی برای این سرویس تعریف نشده است.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (showPreview) {
    return (
      <OrderPreview
        serviceName={service.name}
        fields={service.fields}
        fieldValues={fieldValues}
        uploadedFiles={uploadedFiles}
        needsDocumentation={needsDocumentation}
        notes={notes}
        onConfirm={handleConfirmSubmit}
        onEdit={handleEdit}
        isSubmitting={loading}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>فرم سرویس {service.name}</CardTitle>
        <CardDescription>لطفاً اطلاعات مورد نیاز را پر کنید.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            {service.tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.name}>
                {tab.display_name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {service.tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.name} className="space-y-4">
              <div className="space-y-4">
                {tab.fields
                  .sort((a, b) => a.order - b.order)
                  .map(renderField)}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        {/* Additional Fields */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id="needs_documentation"
              checked={needsDocumentation}
              onCheckedChange={(checked) => setNeedsDocumentation(checked === true)}
            />
            <Label htmlFor="needs_documentation" className="text-sm">
              نیاز به مستندسازی فنی
            </Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              توضیحات اضافی
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="توضیحات تکمیلی در مورد پروژه..."
              rows={3}
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handlePreview} 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? "در حال بارگذاری..." : "پیش‌نمایش سفارش"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DynamicForm;