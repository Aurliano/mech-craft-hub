import React, { createContext, useContext, ReactNode } from 'react';
import { ValidationRule, validateForm, ValidationResult } from '@/lib/formValidation';

interface FormValidatorContextType {
  validateForm: (data: Record<string, unknown>, rules: Record<string, ValidationRule>) => ValidationResult;
  validateField: (value: unknown, rules: ValidationRule, fieldName: string) => string | null;
}

const FormValidatorContext = createContext<FormValidatorContextType | undefined>(undefined);

interface FormValidatorProviderProps {
  children: ReactNode;
}

export const FormValidatorProvider: React.FC<FormValidatorProviderProps> = ({ children }) => {
  const contextValue: FormValidatorContextType = {
    validateForm,
    validateField: (value, rules, fieldName) => {
      const error = validateField(value, rules, fieldName);
      return error;
    }
  };

  return (
    <FormValidatorContext.Provider value={contextValue}>
      {children}
    </FormValidatorContext.Provider>
  );
};

export const useFormValidator = (): FormValidatorContextType => {
  const context = useContext(FormValidatorContext);
  if (!context) {
    throw new Error('useFormValidator must be used within a FormValidatorProvider');
  }
  return context;
};

// Helper function for validateField
const validateField = (
  value: unknown,
  rules: ValidationRule,
  fieldName: string
): string | null => {
  // Required check
  if (rules.required && (!value || value.toString().trim() === '')) {
    return rules.message || `${fieldName} الزامی است`;
  }

  // Skip other validations if value is empty and not required
  if (!value || value.toString().trim() === '') {
    return null;
  }

  const stringValue = value.toString();

  // Min length check
  if (rules.minLength && stringValue.length < rules.minLength) {
    return rules.message || `${fieldName} باید حداقل ${rules.minLength} کاراکتر باشد`;
  }

  // Max length check
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return rules.message || `${fieldName} باید حداکثر ${rules.maxLength} کاراکتر باشد`;
  }

  // Pattern check
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return rules.message || `فرمت ${fieldName} صحیح نیست`;
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};
