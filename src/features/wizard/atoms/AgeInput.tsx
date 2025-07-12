import React, { useState, useCallback, useEffect } from 'react';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { ValidationRanges } from '../../../lib/errors';
import { useTypingStore } from '../../../hooks/useDebouncedStore';

interface AgeInputProps {
  value: number;
  onChange?: (age: number) => void; // Optional for when using debounced store
  error?: string;
  disabled?: boolean;
  required?: boolean;
  useDebouncing?: boolean; // Flag to enable debounced store updates
}

export const AgeInput = React.memo(function AgeInput({ 
  value, 
  onChange, 
  error, 
  disabled = false, 
  required = true,
  useDebouncing = true
}: AgeInputProps) {
  const [localValue, setLocalValue] = useState(value > 0 ? value.toString() : '');
  const [touched, setTouched] = useState(false);
  
  // Use debounced store for better mobile performance
  const { debouncedUpdate, flushUpdates } = useTypingStore();

  // Sync local value with prop value changes
  useEffect(() => {
    if (value > 0) {
      if (parseInt(localValue) !== value) {
        setLocalValue(value.toString());
      }
    } else {
      setLocalValue('');
    }
  }, [value]);

  const validateAge = useCallback((ageStr: string): string | undefined => {
    if (required && (!ageStr || ageStr.trim() === '')) {
      return 'Age is required';
    }
    
    const age = parseInt(ageStr);
    if (isNaN(age)) {
      return 'Please enter a valid age';
    }
    
    if (age < ValidationRanges.age.min || age > ValidationRanges.age.max) {
      return `Age must be between ${ValidationRanges.age.min} and ${ValidationRanges.age.max} years`;
    }
    
    return undefined;
  }, [required]);

  const updateAge = useCallback((age: number) => {
    if (useDebouncing) {
      // Use debounced store update for better mobile performance
      debouncedUpdate({ age });
    } else if (onChange) {
      // Use direct onChange callback
      onChange(age);
    }
  }, [useDebouncing, debouncedUpdate, onChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Only validate and update if value is valid
    const validationError = validateAge(newValue);
    if (!validationError && newValue.trim() !== '') {
      const age = parseInt(newValue);
      updateAge(age);
    }
  }, [updateAge, validateAge]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    
    // Flush any pending debounced updates on blur for immediate feedback
    if (useDebouncing) {
      flushUpdates();
    }
    
    const validationError = validateAge(localValue);
    if (!validationError && localValue.trim() !== '') {
      const age = parseInt(localValue);
      updateAge(age);
    }
  }, [localValue, updateAge, validateAge, useDebouncing, flushUpdates]);

  const currentError = touched ? (error || validateAge(localValue)) : error;
  const hasError = !!currentError;

  return (
    <div className="space-y-2">
      <Label 
        htmlFor="age-input"
        className={`block text-sm font-medium ${hasError ? 'text-red-600' : 'text-gray-700'}`}
      >
        Age {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id="age-input"
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder="Enter your age"
          min={ValidationRanges.age.min}
          max={ValidationRanges.age.max}
          className={`
            w-full text-base
            ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
          aria-invalid={hasError}
          aria-describedby={hasError ? 'age-error' : undefined}
        />
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
          <span className="text-sm">years</span>
        </div>
      </div>
      
      {hasError && (
        <p 
          id="age-error"
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
}); 