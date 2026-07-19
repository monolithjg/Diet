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

const sexOptions: { value: Sex; label: string }[] = [
  {
    value: 'male',
    label: 'Male'
  },
  {
    value: 'female',
    label: 'Female'
  },
  {
    value: 'other',
    label: 'Other/Prefer not to say'
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
    <fieldset className="space-y-3">
      <legend className="block text-sm font-medium text-foreground mb-1">
        Biological Sex {required && <span className="text-error">*</span>}
      </legend>

      <p className="text-xs text-muted mb-4">
        Used for accurate metabolic calculations
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="radiogroup" aria-invalid={hasError}>
        {sexOptions.map((option) => (
          <label
            key={option.value}
            className={`
              relative flex flex-col p-4 rounded-xl border-2 cursor-pointer
              transition-all duration-200 ease-in-out
              ${value === option.value
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                : 'border-border hover:border-primary/50 hover:bg-secondary/50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${hasError ? 'border-error/40' : ''}
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
            />

            <div className="flex items-center justify-between mb-2">
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center
                transition-colors duration-200
                ${value === option.value
                  ? 'border-primary bg-primary'
                  : 'border-muted'
                }
              `}>
                {value === option.value && (
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                )}
              </div>
              {value === option.value && (
                <div className="w-5 h-5 flex-shrink-0">
                  <svg
                    className="w-full h-full text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    width="20"
                    height="20"
                  >
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            <div className={`font-semibold text-base ${value === option.value ? 'text-primary' : 'text-foreground'}`}>
              {option.label}
            </div>
          </label>
        ))}
      </div>

      {hasError && (
        <p
          className="text-sm text-error flex items-center mt-2 animate-fade-in"
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
