import { useState } from 'react';
import { useOrderSubmission } from './useOrderSubmission';

export function useServiceOrder(serviceId: string) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [tabFieldValues, setTabFieldValues] = useState<Record<string, Record<string, any>>>({});
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

  const updateTabField = (tabId: string, fieldKey: string, value: any) => {
    setTabFieldValues(prev => ({
      ...prev,
      [tabId]: {
        ...prev[tabId],
        [fieldKey]: value
      }
    }));
  };

  const updateDocumentationOption = (option: string, checked: boolean) => {
    setDocumentationOptions(prev => ({
      ...prev,
      [option]: checked
    }));
  };

  const handleSubmit = async () => {
    try {
      // Merge formData and tabFieldValues
      const allFieldValues = { 
        ...formData, 
        documentationOptions 
      };
      Object.values(tabFieldValues).forEach(tabFields => {
        Object.assign(allFieldValues, tabFields);
      });

      await submitOrder({
        serviceId,
        fieldValues: allFieldValues,
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
    setTabFieldValues({});
    setNeedsDocumentation(false);
    setNotes('');
    setDocumentationOptions({});
    clearError();
  };

  return {
    formData,
    tabFieldValues,
    needsDocumentation,
    notes,
    documentationOptions,
    updateField,
    updateTabField,
    updateDocumentationOption,
    setNeedsDocumentation,
    setNotes,
    setDocumentationOptions,
    handleSubmit,
    resetForm,
    isSubmitting,
    error
  };
}
