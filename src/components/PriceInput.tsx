import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PriceInputProps {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  id?: string;
  required?: boolean;
}

export const formatPrice = (value: string | number): string => {
  if (!value) return '';
  const str = String(value).replace(/,/g, '');
  return Number(str).toLocaleString('fa-IR');
};

export const unformatPrice = (value: string): string => {
  if (!value) return '';
  // Convert Persian digits to English digits
  const v = value.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
  // Remove all non-digit characters
  return v.replace(/\D/g, '');
};

const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  placeholder,
  label,
  className,
  id,
  required
}) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // When external value changes, update display if it's different
    // We only update if the unformatted display value doesn't match to avoid cursor jumping issues
    // during typing, although for price inputs with separators, standard inputs are tricky.
    // A simple approach is to always format the incoming prop.
    if (value !== undefined && value !== null) {
       setDisplayValue(formatPrice(value));
    } else {
        setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const cleanValue = unformatPrice(rawValue);
    
    if (cleanValue === '' || /^\d+$/.test(cleanValue)) {
      onChange(cleanValue);
      // We don't setDisplayValue here immediately to let the parent control the state loop,
      // but usually for formatted inputs, we might want to update local state too.
      // However, relying on the useEffect to format the new prop value is safer for consistency.
    }
  };

  return (
    <div className={className}>
      {label && <Label htmlFor={id} className="mb-2 block">{label} {required && <span className="text-red-500">*</span>}</Label>}
      <div className="relative">
        <Input
          id={id}
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="pl-12 text-left" 
          dir="ltr" // Prices are usually LTR even in Persian interfaces for alignment
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
          تومان
        </span>
      </div>
    </div>
  );
};

export default PriceInput;

