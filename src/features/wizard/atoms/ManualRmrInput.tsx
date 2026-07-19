import React, { useState, useCallback } from 'react';
void React;
import { Label } from '../../../components/ui/Label';
import { Input } from '../../../components/ui/Input';
import { ValidationRanges } from '../../../lib/errors';

interface ManualRmrInputProps {
  value?: number; // Optional manual RMR in kcal
  onChange: (rmr?: number) => void;
  showManualRmrInput: boolean;
  onToggleShow: () => void;
  error?: string;
  disabled?: boolean;
}

function ManualRmrInput({
  value,
  onChange,
  showManualRmrInput,
  onToggleShow,
  error,
  disabled = false
}: ManualRmrInputProps) {
  const [localValue, setLocalValue] = useState(value?.toString() || '');

  const validateManualRmr = useCallback((rmrStr: string): string | undefined => {
    if (!rmrStr || rmrStr.trim() === '') {
      return undefined; // Optional field
    }

    const rmr = parseInt(rmrStr);
    if (isNaN(rmr)) {
      return 'Please enter a valid RMR value';
    }

    if (rmr < ValidationRanges.manualRmr.min || rmr > ValidationRanges.manualRmr.max) {
      return `Manual RMR must be between ${ValidationRanges.manualRmr.min} and ${ValidationRanges.manualRmr.max} kcal`;
    }

    return undefined;
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
  }, []);

  const handleInputBlur = useCallback(() => {
    const validationError = validateManualRmr(localValue);
    if (!validationError) {
      const rmr = parseInt(localValue);
      onChange(isNaN(rmr) ? undefined : rmr);
    }
  }, [localValue, onChange, validateManualRmr]);

  // Effect to clear value if input is hidden and value was present
  // This should be handled by the parent component by calling onChange(undefined)
  // when onToggleShow results in the input being hidden.

  const currentError = error || (showManualRmrInput ? validateManualRmr(localValue) : undefined);
  const hasError = !!currentError;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium text-foreground">
            Manual RMR Override (Advanced)
          </Label>
          <p className="text-xs text-muted mt-1">
            If you know your Resting Metabolic Rate from medical testing.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleShow}
          disabled={disabled}
          className={`
            text-sm font-medium transition-colors duration-200
            ${showManualRmrInput ? 'text-primary hover:text-primary-hover' : 'text-muted hover:text-foreground'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {showManualRmrInput ? 'Hide' : 'Add'}
        </button>
      </div>

      {showManualRmrInput && (
        <div className="space-y-3">
          <div className="bg-warning-soft border border-warning/30 rounded-lg p-3">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-warning mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-warning-foreground">Advanced Setting Warning</p>
                <p className="text-xs text-warning-foreground mt-1">
                  Only use this if you have your RMR from professional testing.
                  This will override all formula-based calculations and may lead to inaccurate recommendations if misused.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <Input
              type="number"
              inputMode="numeric"
              value={localValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              disabled={disabled}
              placeholder="Enter your measured RMR"
              min={ValidationRanges.manualRmr.min}
              max={ValidationRanges.manualRmr.max}
              step="1"
              className={`
                w-full text-base pr-16
                ${hasError ? 'border-error focus:border-error focus:ring-error/30' : ''}
                ${disabled ? 'bg-secondary cursor-not-allowed' : ''}
              `}
              aria-invalid={hasError}
              aria-describedby={hasError ? 'rmr-error' : 'rmr-help'}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-subtle">
              <span className="text-sm font-medium">kcal/day</span>
            </div>
          </div>

          <div id="rmr-help" className="text-xs text-muted">
            Range: {ValidationRanges.manualRmr.min} - {ValidationRanges.manualRmr.max} kcal/day.
            Current: {value ? `${value} kcal` : 'Not set'}
          </div>

          {hasError && (
            <p
              id="rmr-error"
              className="text-sm text-error flex items-center"
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
      )}
    </div>
  );
}

export default ManualRmrInput;
