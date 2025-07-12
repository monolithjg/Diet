import { useState, useCallback, useEffect } from 'react';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { ValidationRanges } from '../../../lib/errors';
import { useUnitConversion, type UnitSystem } from '../hooks/useUnitConversion';

interface WeightInputProps {
  value: number; // Always in kg (store value)
  onChange: (weightKg: number) => void;
  unit: UnitSystem;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export function WeightInput({ 
  value, 
  onChange, 
  unit,
  error, 
  disabled = false, 
  required = true 
}: WeightInputProps) {
  const { 
    convertWeight, 
    parseWeightInput, 
    formatWeightPlaceholder, 
    getWeightRange 
  } = useUnitConversion();
  
  const [localValue, setLocalValue] = useState('');
  const [touched, setTouched] = useState(false);

  // Update local display value when unit or value changes
  useEffect(() => {
    if (value > 0) {
      const converted = convertWeight(value, unit);
      setLocalValue(converted.displayValue);
    } else {
      // Handle initialization: if store has 0, show empty (not "0")
      setLocalValue('');
    }
  }, [value, unit, convertWeight]);

  const validateWeight = useCallback((inputStr: string, currentUnit: UnitSystem): string | undefined => {
    if (required && (!inputStr || inputStr.trim() === '')) {
      return 'Weight is required';
    }
    
    if (!inputStr || inputStr.trim() === '') {
      return undefined; // Allow empty for optional fields
    }
    
    const weightKg = parseWeightInput(inputStr, currentUnit);
    
    if (isNaN(weightKg) || weightKg <= 0) {
      return 'Please enter a valid weight';
    }
    
    if (weightKg < ValidationRanges.weightKg.min || weightKg > ValidationRanges.weightKg.max) {
      const range = getWeightRange(currentUnit);
      return `Weight must be between ${range.min} and ${range.max} ${range.unit}`;
    }
    
    return undefined;
  }, [required, parseWeightInput, getWeightRange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Only validate and update parent if value is valid
    const validationError = validateWeight(newValue, unit);
    if (!validationError && newValue.trim() !== '') {
      const weightKg = parseWeightInput(newValue, unit);
      if (weightKg > 0) {
        onChange(weightKg);
      }
    }
  }, [onChange, validateWeight, unit, parseWeightInput]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    const validationError = validateWeight(localValue, unit);
    
    if (!validationError && localValue.trim() !== '') {
      const weightKg = parseWeightInput(localValue, unit);
      if (weightKg > 0) {
        onChange(weightKg);
      }
    }
  }, [localValue, onChange, validateWeight, unit, parseWeightInput]);

  const currentError = touched ? (error || validateWeight(localValue, unit)) : error;
  const hasError = !!currentError;
  const range = getWeightRange(unit);

  return (
    <div className="space-y-2">
      <Label 
        htmlFor="weight-input"
        className={`block text-sm font-medium ${hasError ? 'text-red-600' : 'text-gray-700'}`}
      >
        Weight {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id="weight-input"
          type="number"
          inputMode="decimal"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={formatWeightPlaceholder(unit)}
          min={range.min}
          max={range.max}
          step={unit === 'metric' ? '0.1' : '0.1'}
          className={`
            w-full text-base pr-12
            ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
          aria-invalid={hasError}
          aria-describedby={hasError ? 'weight-error' : 'weight-help'}
        />
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
          <span className="text-sm font-medium">{range.unit}</span>
        </div>
      </div>
      
      <div id="weight-help" className="text-xs text-gray-500">
        Range: {range.min}-{range.max} {range.unit}
      </div>
      
      {hasError && (
        <p 
          id="weight-error"
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