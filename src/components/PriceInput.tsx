import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPriceNumber, parsePriceToToman } from '@/lib/priceUtils';

interface PriceInputProps {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  id?: string;
  required?: boolean;
}

/** جدا کردن اعداد فارسی و حذف غیررقم؛ خروجی رشتهٔ فقط رقم برای ذخیره. */
export function unformatPrice(value: string): string {
  if (!value) return '';
  const persianToEn = (d: string) => {
    const i = '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);
    return i >= 0 ? String(i) : d;
  };
  const v = value.replace(/[۰-۹]/g, persianToEn);
  return v.replace(/\D/g, '');
}

/** نمایش مقدار برای داخل اینپوت: عدد صحیح با جداکننده سه‌رقمی. */
export function formatPriceForInput(value: string | number): string {
  if (value === undefined || value === null || value === '') return '';
  const n = parsePriceToToman(value);
  return n === 0 ? '' : formatPriceNumber(n);
}

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
    if (value !== undefined && value !== null && value !== '') {
      setDisplayValue(formatPriceForInput(value));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const cleanValue = unformatPrice(rawValue);
    if (cleanValue === '' || /^\d+$/.test(cleanValue)) {
      onChange(cleanValue);
    }
  };

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id} className="mb-2 block">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="relative">
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="pl-12 text-left"
          dir="ltr"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
          تومان
        </span>
      </div>
    </div>
  );
};

export default PriceInput;
