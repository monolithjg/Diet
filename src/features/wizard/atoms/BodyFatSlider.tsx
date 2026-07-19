import React, { useState, useCallback } from 'react';
void React;
import { Label } from '../../../components/ui/Label';
import { Input } from '../../../components/ui/Input';
import { ValidationRanges } from '../../../lib/errors';

interface BodyFatSliderProps {
  value?: number; // Optional body fat percentage
  onChange: (bodyFatPct?: number) => void;
  error?: string;
  disabled?: boolean;
}

function BodyFatSlider({
  value,
  onChange,
  error,
  disabled = false
}: BodyFatSliderProps) {
  const [showInput, setShowInput] = useState(!!value);
  const [localValue, setLocalValue] = useState(value?.toString() || '');

  const validateBodyFat = useCallback((bodyFatStr: string): string | undefined => {
    if (!bodyFatStr || bodyFatStr.trim() === '') {
      return undefined; // Optional field
    }

    const bodyFat = parseFloat(bodyFatStr);
    if (isNaN(bodyFat)) {
      return 'Please enter a valid body fat percentage';
    }

    if (bodyFat < ValidationRanges.bodyFatPct.min || bodyFat > ValidationRanges.bodyFatPct.max) {
      return `Body fat must be between ${ValidationRanges.bodyFatPct.min}% and ${ValidationRanges.bodyFatPct.max}%`;
    }

    return undefined;
  }, []);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    const validationError = validateBodyFat(newValue);
    if (!validationError) {
      const bodyFat = parseFloat(newValue);
      onChange(isNaN(bodyFat) ? undefined : bodyFat);
    }
  }, [onChange, validateBodyFat]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
  }, []);

  const handleInputBlur = useCallback(() => {
    const validationError = validateBodyFat(localValue);
    if (!validationError) {
      const bodyFat = parseFloat(localValue);
      onChange(isNaN(bodyFat) ? undefined : bodyFat);
    }
  }, [localValue, onChange, validateBodyFat]);

  const handleToggleInput = useCallback(() => {
    const newShowInput = !showInput;
    setShowInput(newShowInput);

    if (!newShowInput) {
      // Clear value when hiding input
      setLocalValue('');
      onChange(undefined);
    }
  }, [showInput, onChange]);

  const currentError = error || validateBodyFat(localValue);
  const hasError = !!currentError;
  const currentValue = value || parseFloat(localValue) || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">
          Body Fat Percentage (Optional)
        </Label>

        <button
          type="button"
          onClick={handleToggleInput}
          disabled={disabled}
          className={`
            text-sm font-medium transition-colors duration-200
            ${showInput ? 'text-primary hover:text-primary-hover' : 'text-muted hover:text-foreground'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {showInput ? 'Hide' : 'Add'}
        </button>
      </div>

      {showInput && (
        <div className="space-y-3">
          <p className="text-xs text-muted">
            Used for more accurate metabolic calculations. Leave blank if unknown.
          </p>

          {/* Slider */}
          <div className="px-1">
            <input
              type="range"
              min={ValidationRanges.bodyFatPct.min}
              max={ValidationRanges.bodyFatPct.max}
              step="0.5"
              value={currentValue}
              onChange={handleSliderChange}
              disabled={disabled}
              className={`
                w-full h-2 bg-border rounded-lg appearance-none cursor-pointer
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
                [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md
                [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none
              `}
              aria-label="Body fat percentage slider"
              aria-describedby={hasError ? 'bodyfat-error' : 'bodyfat-help'}
            />

            {/* Slider labels */}
            <div className="flex justify-between text-xs text-subtle mt-1">
              <span>{ValidationRanges.bodyFatPct.min}%</span>
              <span>{ValidationRanges.bodyFatPct.max}%</span>
            </div>
          </div>

          {/* Number input */}
          <div className="relative">
            <Input
              type="number"
              inputMode="decimal"
              value={localValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              disabled={disabled}
              placeholder="Enter percentage"
              min={ValidationRanges.bodyFatPct.min}
              max={ValidationRanges.bodyFatPct.max}
              step="0.1"
              className={`
                w-full text-base pr-8
                ${hasError ? 'border-error focus:border-error focus:ring-error/30' : ''}
                ${disabled ? 'bg-secondary cursor-not-allowed' : ''}
              `}
              aria-invalid={hasError}
              aria-describedby={hasError ? 'bodyfat-error' : 'bodyfat-help'}
            />

            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-subtle">
              <span className="text-sm">%</span>
            </div>
          </div>

          <div id="bodyfat-help" className="text-xs text-muted">
            Current value: {currentValue > 0 ? `${currentValue.toFixed(1)}%` : 'Not set'}
          </div>

          {hasError && (
            <p
              id="bodyfat-error"
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

export default BodyFatSlider;
