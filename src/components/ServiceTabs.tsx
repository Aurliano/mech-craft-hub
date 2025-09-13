import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useServiceTabs, useTabFields } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface ServiceTabsProps {
  serviceId: string;
  onFieldChange: (tabId: string, fieldKey: string, value: any) => void;
  fieldValues: Record<string, Record<string, any>>;
}

const ServiceTabs: React.FC<ServiceTabsProps> = ({ 
  serviceId, 
  onFieldChange, 
  fieldValues 
}) => {
  const [activeTab, setActiveTab] = useState<string>('');
  
  const { data: tabs, isLoading: tabsLoading, error: tabsError } = useServiceTabs(serviceId);
  const { data: fields, isLoading: fieldsLoading } = useTabFields(activeTab);

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
                fields={fields}
                fieldsLoading={fieldsLoading}
                onFieldChange={onFieldChange}
                fieldValues={fieldValues[tab.id] || {}}
              />
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
};

interface TabFieldsProps {
  tabId: string;
  fields: any[] | undefined;
  fieldsLoading: boolean;
  onFieldChange: (tabId: string, fieldKey: string, value: any) => void;
  fieldValues: Record<string, any>;
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

  if (!fields || fields.length === 0) {
    return (
      <p className="text-muted-foreground text-center">
        فیلدی برای این تب تعریف نشده است
      </p>
    );
  }

  const handleFieldChange = (fieldKey: string, value: any) => {
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
  field: any;
  value: any;
  onChange: (value: any) => void;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange }) => {
  const { Input } = require('@/components/ui/input');
  const { Textarea } = require('@/components/ui/textarea');
  const { Checkbox } = require('@/components/ui/checkbox');
  const { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } = require('@/components/ui/select');

  switch (field.type) {
    case 'text':
      return (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.help_text}
          className="text-right"
        />
      );
      
    case 'number':
      return (
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder={field.help_text}
          className="text-right"
        />
      );
      
    case 'textarea':
      return (
        <Textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.help_text}
          className="text-right"
          rows={4}
        />
      );
      
    case 'checkbox':
      return (
        <Checkbox
          checked={value || false}
          onCheckedChange={onChange}
        />
      );
      
    case 'select':
      return (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="انتخاب کنید" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option: any) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
      
    case 'multiselect':
      return (
        <div className="space-y-2">
          {field.options?.map((option: any) => (
            <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id={`${field.field_key}-${option.value}`}
                checked={value?.includes(option.value) || false}
                onCheckedChange={(checked) => {
                  const currentValues = value || [];
                  if (checked) {
                    onChange([...currentValues, option.value]);
                  } else {
                    onChange(currentValues.filter((v: any) => v !== option.value));
                  }
                }}
              />
              <label htmlFor={`${field.field_key}-${option.value}`} className="text-sm">
                {option.label}
              </label>
            </div>
          ))}
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
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="text-right"
        />
      );
      
    default:
      return (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.help_text}
          className="text-right"
        />
      );
  }
};

export default ServiceTabs;
