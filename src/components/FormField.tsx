import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { ValidationRule } from '@/lib/formValidation';

interface FormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'textarea' | 'select';
  value: string | number | undefined;
  onChange: (value: string | number) => void;
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
  const [showPassword, setShowPassword] = useState(false);
  const hasError = error && touched;
  const inputClassName = `text-right ${hasError ? 'border-red-500 focus:border-red-500' : ''} ${className} ${type === 'password' ? 'pr-10' : ''}`;

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
          <Select value={String(value || '')} onValueChange={handleSelectChange}>
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
        if (type === 'password') {
          return (
            <div className="relative">
              <Input
                id={name}
                type={showPassword ? "text" : "password"}
                value={value || ''}
                onChange={handleChange}
                onBlur={onBlur}
                className={inputClassName}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete={autoComplete}
                required={required}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          );
        }
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
