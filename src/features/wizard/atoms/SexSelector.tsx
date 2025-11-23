import React, { useCallback } from 'react';
void React;
import type { Sex } from '../../../models/UserInput';

interface SexSelectorProps {
  value: Sex;
  onChange: (sex: Sex) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

const sexOptions: { value: Sex; label: string; description: string }[] = [
  { 
    value: 'male', 
    label: 'Male', 
    description: 'Assigned male at birth' 
  },
  { 
    value: 'female', 
    label: 'Female', 
    description: 'Assigned female at birth' 
  },
  { 
    value: 'other', 
    label: 'Other/Prefer not to say', 
    description: 'Non-binary or prefer not to specify' 
  }
];

export function SexSelector({ 
  value, 
  onChange, 
  error, 
  disabled = false, 
  required = true 
}: SexSelectorProps) {
  const handleChange = useCallback((selectedSex: Sex) => {
    onChange(selectedSex);
  }, [onChange]);

  const hasError = !!error;

  return (
    <fieldset className="space-y-2">
      <legend className={`block text-sm font-medium ${hasError ? 'text-red-600' : 'text-gray-700'}`}>
        Biological Sex {required && <span className="text-red-500">*</span>}
      </legend>
      
      <p className="text-xs text-gray-500 mb-3">
        Used for accurate metabolic calculations
      </p>
      
      <div className="space-y-3" role="radiogroup" aria-invalid={hasError}>
        {sexOptions.map((option) => (
          <label
            key={option.value}
            className={`
              relative flex items-start p-4 border-2 rounded-lg cursor-pointer
              transition-all duration-200 ease-in-out
              ${value === option.value 
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                : 'border-gray-200 hover:border-gray-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
              ${hasError ? 'border-red-200' : ''}
            `}
          >
            <input
              type="radio"
              name="sex-selector"
              value={option.value}
              checked={value === option.value}
              onChange={() => handleChange(option.value)}
              disabled={disabled}
              className="sr-only"
              aria-describedby={`sex-${option.value}-description`}
            />
            
            <div className="flex items-start flex-1 min-w-0">
              <div className={`
                flex-shrink-0 w-5 h-5 rounded-full border-2 mr-3 mt-0.5
                flex items-center justify-center
                transition-colors duration-200
                ${value === option.value 
                  ? 'border-primary bg-primary' 
                  : 'border-gray-300'
                }
              `}>
                {value === option.value && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className={`
                  text-base font-medium
                  ${value === option.value ? 'text-primary' : 'text-gray-900'}
                `}>
                  {option.label}
                </div>
                <div 
                  id={`sex-${option.value}-description`}
                  className="text-sm text-gray-500 mt-1"
                >
                  {option.description}
                </div>
              </div>
            </div>
            
            {value === option.value && (
              <div className="flex-shrink-0 ml-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </label>
        ))}
      </div>
      
      {hasError && (
        <p 
          className="text-sm text-red-600 flex items-center mt-2"
          role="alert"
          aria-live="polite"
        >
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </fieldset>
  );
} 