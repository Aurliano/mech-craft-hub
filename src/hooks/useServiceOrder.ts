import { useState } from 'react';
import { useOrderSubmission } from './useOrderSubmission';

export type FieldValue = string | number | boolean | string[] | File | null | Record<string, unknown>;

export function useServiceOrder(serviceId: string) {
  const [formData, setFormData] = useState<Record<string, FieldValue>>({});
  const [tabFieldValues, setTabFieldValues] = useState<Record<string, Record<string, FieldValue>>>({});
  const [needsDocumentation, setNeedsDocumentation] = useState(false);
  const [notes, setNotes] = useState('');
  const [documentationOptions, setDocumentationOptions] = useState<Record<string, boolean>>({});
  const [documentationNotes, setDocumentationNotes] = useState('');
  
  const { submitOrder, isSubmitting, error, clearError } = useOrderSubmission();

  const updateField = (fieldKey: string, value: FieldValue) => {
    setFormData(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const updateTabField = (tabId: string, fieldKey: string, value: FieldValue) => {
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
      // IMPORTANT: Add tab prefix to field keys to preserve tab information
      const allFieldValues: Record<string, FieldValue> = { 
        ...formData, 
        documentationOptions,
        documentationNotes
      };
      
      // Add tab prefix to each field key to prevent data loss
      Object.entries(tabFieldValues).forEach(([tabId, tabFields]) => {
        Object.entries(tabFields).forEach(([fieldKey, value]) => {
          // Use tab ID as prefix to maintain tab-field relationship
          const prefixedKey = `${tabId}_${fieldKey}`;
          allFieldValues[prefixedKey] = value;
        });
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
    setDocumentationNotes('');
    clearError();
  };

  return {
    formData,
    tabFieldValues,
    needsDocumentation,
    notes,
    documentationOptions,
    documentationNotes,
    updateField,
    updateTabField,
    updateDocumentationOption,
    setNeedsDocumentation,
    setNotes,
    setDocumentationOptions,
    setDocumentationNotes,
    handleSubmit,
    resetForm,
    isSubmitting,
    error
  };
}
