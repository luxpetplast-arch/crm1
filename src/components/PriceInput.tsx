import { useState, useEffect } from 'react';

interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
}

export function PriceInput({ value, onChange, className = '', placeholder = '' }: PriceInputProps) {
  const [localValue, setLocalValue] = useState(value.toString());
  const [isEditing, setIsEditing] = useState(false);

  // Sync with parent value when not editing
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value.toString());
    }
  }, [value, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    // Allow multiple decimals temporarily during typing
    setLocalValue(val);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const numValue = parseFloat(localValue) || 0;
    setLocalValue(numValue.toString());
    onChange(numValue);
  };

  const handleFocus = () => {
    setIsEditing(true);
    // Clear if value is 0
    if (parseFloat(localValue) === 0) {
      setLocalValue('');
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      className={className}
      placeholder={placeholder}
    />
  );
}

export default PriceInput;
