import { useState } from 'react';
import { useOrderSubmission } from './useOrderSubmission';

export function useServiceOrder(serviceId: string) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [needsDocumentation, setNeedsDocumentation] = useState(false);
  const [notes, setNotes] = useState('');
  const [documentationOptions, setDocumentationOptions] = useState<Record<string, boolean>>({});
  
  const { submitOrder, isSubmitting, error, clearError } = useOrderSubmission();

  const updateField = (fieldKey: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      await submitOrder({
        serviceId,
        fieldValues: formData,
        needsDocumentation,
        notes,
        documentationOptions
      });
    } catch (error) {
      console.error('Error submitting order:', error);
    }
  };

  const resetForm = () => {
    setFormData({});
    setNeedsDocumentation(false);
    setNotes('');
    setDocumentationOptions({});
    clearError();
  };

  return {
    formData,
    needsDocumentation,
    notes,
    documentationOptions,
    updateField,
    setNeedsDocumentation,
    setNotes,
    setDocumentationOptions,
    handleSubmit,
    resetForm,
    isSubmitting,
    error
  };
}
