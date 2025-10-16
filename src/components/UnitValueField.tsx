import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface UnitValueFieldProps {
  value?: { unit: string; value: string };
  onChange: (value: { unit: string; value: string }) => void;
  units?: string[];
  placeholder?: string;
  disabled?: boolean;
}

const UnitValueField: React.FC<UnitValueFieldProps> = ({
  value = { unit: '', value: '' },
  onChange,
  units = ['mm', 'cm', 'm', 'μm', 'inch', 'ft'],
  placeholder = 'مقدار را وارد کنید',
  disabled = false
}) => {
  const handleValueChange = (newValue: string) => {
    onChange({ ...value, value: newValue });
  };

  const handleUnitChange = (newUnit: string) => {
    onChange({ ...value, unit: newUnit });
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Input
          type="number"
          value={value.value}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="text-left"
        />
      </div>
      <div className="w-24">
        <Select value={value.unit} onValueChange={handleUnitChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="واحد" />
          </SelectTrigger>
          <SelectContent>
            {units.map((unit) => (
              <SelectItem key={unit} value={unit}>
                {unit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default UnitValueField;
