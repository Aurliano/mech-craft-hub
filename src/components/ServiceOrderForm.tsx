import React from 'react';
import { useServiceFields } from '@/hooks/useAuth';
import { useServiceTabs } from '@/hooks/useAuth';
import ServiceTabs from './ServiceTabs';
import { DynamicServiceForm } from './DynamicServiceForm';

interface ServiceOrderFormProps {
  serviceId: string;
  service: { has_tabs?: boolean; [key: string]: unknown };
  formData: Record<string, unknown>;
  tabFieldValues: Record<string, Record<string, unknown>>;
  needsDocumentation: boolean;
  onNeedsDocumentationChange: (value: boolean) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  onFieldChange: (fieldKey: string, value: unknown) => void;
  onTabFieldChange: (tabId: string, fieldKey: string, value: unknown) => void;
  documentationOptions: Record<string, boolean>;
  onDocumentationOptionsChange: (options: Record<string, boolean>) => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({
  serviceId,
  service,
  formData,
  tabFieldValues,
  needsDocumentation,
  onNeedsDocumentationChange,
  notes,
  onNotesChange,
  onFieldChange,
  onTabFieldChange,
  documentationOptions,
  onDocumentationOptionsChange,
  onSubmit,
  isSubmitting
}) => {
  // اگر سرویس تب دارد، از ServiceTabs استفاده کن
  if (service?.has_tabs) {
    return (
      <ServiceTabs
        serviceId={serviceId}
        onFieldChange={onTabFieldChange}
        fieldValues={tabFieldValues}
        needsDocumentation={needsDocumentation}
        onNeedsDocumentationChange={onNeedsDocumentationChange}
        documentationOptions={documentationOptions}
        onDocumentationOptionChange={(option, checked) => 
          onDocumentationOptionsChange({ ...documentationOptions, [option]: checked })
        }
        notes={notes}
        onNotesChange={onNotesChange}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />
    );
  }

  // اگر سرویس تب ندارد، از DynamicServiceForm استفاده کن
  return (
    <DynamicServiceForm
      serviceId={serviceId}
      formData={formData}
      onFieldChange={onFieldChange}
      needsDocumentation={needsDocumentation}
      onNeedsDocumentationChange={onNeedsDocumentationChange}
      documentationOptions={documentationOptions}
      onDocumentationOptionChange={(option, checked) => 
        onDocumentationOptionsChange({ ...documentationOptions, [option]: checked })
      }
      notes={notes}
      onNotesChange={onNotesChange}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  );
};

export default ServiceOrderForm;
