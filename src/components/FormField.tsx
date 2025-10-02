import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ValidationRule } from '@/lib/formValidation';

interface FormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'textarea' | 'select';
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  options?: { value: string; label: string }[];
  disabled?: boolean;
  autoComplete?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  placeholder,
  className = '',
  options = [],
  disabled = false,
  autoComplete
}) => {
  const hasError = error && touched;
  const inputClassName = `text-right ${hasError ? 'border-red-500 focus:border-red-500' : ''} ${className}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleSelectChange = (value: string) => {
    onChange(value);
  };

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            id={name}
            value={value || ''}
            onChange={handleChange}
            onBlur={onBlur}
            className={inputClassName}
            placeholder={placeholder}
            disabled={disabled}
            rows={4}
          />
        );
      
      case 'select':
        return (
          <Select value={value || ''} onValueChange={handleSelectChange}>
            <SelectTrigger className={inputClassName}>
              <SelectValue placeholder={placeholder || `انتخاب ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return (
          <Input
            id={name}
            type={type}
            value={value || ''}
            onChange={handleChange}
            onBlur={onBlur}
            className={inputClassName}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            required={required}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </Label>
      
      {renderInput()}
      
      {hasError && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
      
      {!hasError && touched && (
        <p className="text-xs text-green-500 mt-1">✓ صحیح</p>
      )}
    </div>
  );
};

export default FormField;
