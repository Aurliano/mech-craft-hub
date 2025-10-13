import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useServiceTabs, useServiceFields } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import DocumentationSection from './DocumentationSection';

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

interface ServiceTabsProps {
  serviceId: string;
  onFieldChange: (tabId: string, fieldKey: string, value: unknown) => void;
  fieldValues: Record<string, Record<string, unknown>>;
  needsDocumentation?: boolean;
  onNeedsDocumentationChange?: (value: boolean) => void;
  documentationOptions?: Record<string, boolean>;
  onDocumentationOptionChange?: (option: string, checked: boolean) => void;
  notes?: string;
  onNotesChange?: (value: string) => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  error?: string;
}

const ServiceTabs: React.FC<ServiceTabsProps> = ({ 
  serviceId, 
  onFieldChange, 
  fieldValues,
  needsDocumentation = false,
  onNeedsDocumentationChange,
  documentationOptions = {},
  onDocumentationOptionChange,
  notes = '',
  onNotesChange,
  onSubmit,
  isSubmitting = false,
  error
}) => {
  const [activeTab, setActiveTab] = useState<string>('');
  
  const { data: tabs = [], isLoading: tabsLoading, error: tabsError } = useServiceTabs(serviceId);
  const { data: fields = [], isLoading: fieldsLoading } = useServiceFields(serviceId, activeTab);

  // Normalize API fields (which may have string type) into strict union-typed fields
  const normalizedFields: ServiceField[] = Array.isArray(fields)
    ? (fields as unknown as Array<{
        id: string;
        name: string;
        field_key: string;
        type: string;
        options?: Array<{ value?: unknown; label?: unknown } | unknown>;
        is_required: boolean;
        order: number;
        help_text?: string;
        validation_rules?: Record<string, unknown>;
      }>).map((f) => {
        const allowedTypes: ServiceField['type'][] = ['text', 'number', 'file', 'select', 'multiselect', 'checkbox', 'date', 'textarea'];
        const safeType = (allowedTypes.includes(f.type as ServiceField['type']) ? f.type : 'text') as ServiceField['type'];
        const options = Array.isArray(f.options)
          ? f.options.map((opt) => {
              if (opt && typeof opt === 'object' && 'value' in opt) {
                const o = opt as { value?: unknown; label?: unknown };
                return { value: String(o.value ?? ''), label: String(o.label ?? o.value ?? '') };
              }
              return { value: String(opt), label: String(opt) };
            })
          : undefined;
        const { id, name, field_key, is_required, order, help_text, validation_rules } = f;
        return { id, name, field_key, type: safeType, options, is_required, order, help_text, validation_rules } as ServiceField;
      })
    : [];

  // Set first tab as active when tabs are loaded
  React.useEffect(() => {
    if (tabs && tabs.length > 0 && !activeTab) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  if (tabsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (tabsError || !tabs || tabs.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            این سرویس تب‌های مختلفی ندارد
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.display_name || tab.name}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{tab.display_name || tab.name}</CardTitle>
              {tab.description && (
                <CardDescription>{tab.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <TabFields 
                tabId={tab.id}
                fields={normalizedFields}
                fieldsLoading={fieldsLoading}
                onFieldChange={onFieldChange}
                fieldValues={fieldValues[tab.id] || {}}
              />
              
              {/* Documentation Section - only show on first tab */}
              {tab.id === tabs[0]?.id && onNeedsDocumentationChange && onDocumentationOptionChange && (
                <DocumentationSection
                  needsDocumentation={needsDocumentation}
                  onNeedsDocumentationChange={onNeedsDocumentationChange}
                  documentationOptions={documentationOptions}
                  onDocumentationOptionChange={onDocumentationOptionChange}
                  serviceSupportsDocumentation={true}
                />
              )}
              
              {/* Notes - only show on first tab */}
              {tab.id === tabs[0]?.id && onNotesChange && (
                <div className="mt-6 space-y-2">
                  <label className="text-sm font-medium">
                    توضیحات اضافی
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder="توضیحات تکمیلی در مورد پروژه..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-md text-right"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      ))}
      
      {/* Submit Button - only show on first tab */}
      {tabs.length > 0 && onSubmit && (
        <div className="mt-8 text-center">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
              {error}
            </div>
          )}
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'در حال ثبت...' : 'ثبت سفارش'}
          </button>
        </div>
      )}
    </Tabs>
  );
};

interface TabFieldsProps {
  tabId: string;
  fields: ServiceField[];
  fieldsLoading: boolean;
  onFieldChange: (tabId: string, fieldKey: string, value: unknown) => void;
  fieldValues: Record<string, unknown>;
}

const TabFields: React.FC<TabFieldsProps> = ({ 
  tabId, 
  fields, 
  fieldsLoading, 
  onFieldChange, 
  fieldValues 
}) => {
  if (fieldsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <p className="text-muted-foreground text-center">
        فیلدی برای این تب تعریف نشده است
      </p>
    );
  }

  const handleFieldChange = (fieldKey: string, value: unknown) => {
    onFieldChange(tabId, fieldKey, value);
  };

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <label className="text-sm font-medium">
            {field.name}
            {field.is_required && <span className="text-red-500 mr-1">*</span>}
          </label>
          
          {field.help_text && (
            <p className="text-xs text-muted-foreground">{field.help_text}</p>
          )}
          
          <FieldRenderer
            field={field}
            value={fieldValues[field.field_key]}
            onChange={(value) => handleFieldChange(field.field_key, value)}
          />
        </div>
      ))}
    </div>
  );
};

interface FieldRendererProps {
  field: ServiceField;
  value: unknown;
  onChange: (value: unknown) => void;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange }) => {

  switch (field.type) {
    case 'text':
      return (
        <Input
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.help_text}
          className="text-right"
        />
      );
      
    case 'number':
      return (
        <Input
          type="number"
          value={String(value ?? '')}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder={field.help_text}
          className="text-right"
        />
      );
      
    case 'textarea':
      return (
        <Textarea
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.help_text}
          className="text-right"
          rows={4}
        />
      );
      
    case 'checkbox':
      return (
        <Checkbox
          checked={value === true}
          onCheckedChange={(checked) => onChange(checked === true)}
        />
      );
      
    case 'select':
      return (
        <Select value={String(value ?? '')} onValueChange={(val) => onChange(val)}>
          <SelectTrigger>
            <SelectValue placeholder="انتخاب کنید" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option, index) => {
              const optionValue = option.value;
              const optionLabel = option.label;
              return (
                <SelectItem key={optionValue || index} value={optionValue}>
                  {optionLabel}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      );
      
    case 'multiselect':
      return (
        <div className="space-y-2">
          {field.options?.map((option, index) => {
            const optionValue = option.value;
            const optionLabel = option.label;
            const currentValues = Array.isArray(value) ? (value as string[]) : [];
            return (
              <div key={optionValue || index} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id={`${field.field_key}-${optionValue}`}
                  checked={currentValues.includes(optionValue)}
                  onCheckedChange={(checked) => {
                    if (checked === true) {
                      onChange([...currentValues, optionValue]);
                    } else {
                      onChange(currentValues.filter((v) => v !== optionValue));
                    }
                  }}
                />
                <label htmlFor={`${field.field_key}-${optionValue}`} className="text-sm">
                  {optionLabel}
                </label>
              </div>
            );
          })}
        </div>
      );
      
    case 'file':
      return (
        <Input
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            onChange(file);
          }}
          className="text-right"
        />
      );
      
    case 'date':
      return (
        <Input
          type="date"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className="text-right"
        />
      );
      
    default:
      return (
        <Input
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.help_text}
          className="text-right"
        />
      );
  }
};

export default ServiceTabs;
