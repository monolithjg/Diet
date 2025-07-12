import { useState, useCallback, useEffect } from 'react';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { ValidationRanges } from '../../../lib/errors';
import { useUnitConversion, type UnitSystem } from '../hooks/useUnitConversion';

interface HeightInputProps {
  value: number; // Always in cm (store value)
  onChange: (heightCm: number) => void;
  unit: UnitSystem;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export function HeightInput({ 
  value, 
  onChange, 
  unit,
  error, 
  disabled = false, 
  required = true 
}: HeightInputProps) {
  const { 
    convertHeight, 
    parseHeightInput, 
    formatHeightPlaceholder, 
    getHeightRange 
  } = useUnitConversion();
  
  const [localValue, setLocalValue] = useState('');
  const [touched, setTouched] = useState(false);

  // Update local display value when unit or value changes
  useEffect(() => {
    if (value > 0) {
      const converted = convertHeight(value, unit);
      setLocalValue(converted.displayValue);
    } else {
      // Handle initialization: if store has 0, show empty (not "0") 
      setLocalValue('');
    }
  }, [value, unit, convertHeight]);

  const validateHeight = useCallback((inputStr: string, currentUnit: UnitSystem): string | undefined => {
    if (required && (!inputStr || inputStr.trim() === '')) {
      return 'Height is required';
    }
    
    if (!inputStr || inputStr.trim() === '') {
      return undefined; // Allow empty for optional fields
    }
    
    const heightCm = parseHeightInput(inputStr, currentUnit);
    
    if (isNaN(heightCm) || heightCm <= 0) {
      return 'Please enter a valid height';
    }
    
    if (heightCm < ValidationRanges.heightCm.min || heightCm > ValidationRanges.heightCm.max) {
      const range = getHeightRange(currentUnit);
      if (currentUnit === 'metric') {
        return `Height must be between ${range.min} and ${range.max} ${range.unit}`;
      } else {
        return `Height must be between ${range.min} and ${range.max}`;
      }
    }
    
    return undefined;
  }, [required, parseHeightInput, getHeightRange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Only validate and update parent if value is valid
    const validationError = validateHeight(newValue, unit);
    if (!validationError && newValue.trim() !== '') {
      const heightCm = parseHeightInput(newValue, unit);
      if (heightCm > 0) {
        onChange(heightCm);
      }
    }
  }, [onChange, validateHeight, unit, parseHeightInput]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    const validationError = validateHeight(localValue, unit);
    
    if (!validationError && localValue.trim() !== '') {
      const heightCm = parseHeightInput(localValue, unit);
      if (heightCm > 0) {
        onChange(heightCm);
      }
    }
  }, [localValue, onChange, validateHeight, unit, parseHeightInput]);

  const currentError = touched ? (error || validateHeight(localValue, unit)) : error;
  const hasError = !!currentError;
  const range = getHeightRange(unit);

  return (
    <div className="space-y-2">
      <Label 
        htmlFor="height-input"
        className={`block text-sm font-medium ${hasError ? 'text-red-600' : 'text-gray-700'}`}
      >
        Height {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id="height-input"
          type={unit === 'metric' ? 'number' : 'text'}
          inputMode={unit === 'metric' ? 'numeric' : 'text'}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={formatHeightPlaceholder(unit)}
          className={`
            w-full text-base pr-12
            ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
          aria-invalid={hasError}
          aria-describedby={hasError ? 'height-error' : 'height-help'}
        />
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
          <span className="text-sm font-medium">{range.unit}</span>
        </div>
      </div>
      
      <div id="height-help" className="text-xs text-gray-500">
        {unit === 'metric' ? (
          <>Range: {range.min}-{range.max} {range.unit}</>
        ) : (
          <>Range: {range.min} to {range.max} (e.g., "5'9" or "5 9")</>
        )}
      </div>
      
      {hasError && (
        <p 
          id="height-error"
          className="text-sm text-red-600 flex items-center"
          role="alert"
          aria-live="polite"
        >
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {currentError}
        </p>
      )}
    </div>
  );
} 