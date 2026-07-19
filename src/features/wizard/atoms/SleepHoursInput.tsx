import React, { useState, useEffect } from 'react';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { cn } from '../../../lib/utils';

interface SleepHoursInputProps {
  value?: number;
  onChange: (value: number | undefined) => void;
  error?: boolean;
  helperText?: string;
}

export function SleepHoursInput({
  value,
  onChange,
  error,
  helperText
}: SleepHoursInputProps) {
  const [inputValue, setInputValue] = useState(value?.toString() || '');
  const [localError, setLocalError] = useState(false);

  useEffect(() => {
    setInputValue(value?.toString() || '');
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue === '') {
      onChange(undefined);
      setLocalError(false);
      return;
    }

    const numValue = parseFloat(newValue);

    // Validate range (3-12 hours is reasonable)
    if (isNaN(numValue) || numValue < 3 || numValue > 12) {
      setLocalError(true);
      return;
    }

    setLocalError(false);
    onChange(numValue);
  };

  const getSleepFeedback = (hours?: number) => {
    if (!hours) return '';
    if (hours < 6) return 'This may impact your nutrition goals';
    if (hours < 7) return 'Consider aiming for 7-9 hours for optimal recovery';
    if (hours <= 9) return 'Great! This supports your health goals';
    return 'Ensure this feels refreshing for you';
  };

  const isError = error || localError;
  const feedback = getSleepFeedback(value);
  const displayHelperText = helperText ||
    (localError ? 'Please enter a value between 3 and 12 hours' : feedback);

  return (
    <div className="space-y-3">
      <Label htmlFor="sleep-hours" className={isError ? "text-destructive" : ""}>
        How many hours do you typically sleep per night?
      </Label>

      <div className="relative">
        <Input
          id="sleep-hours"
          type="number"
          min="3"
          max="12"
          step="0.5"
          placeholder="7.5"
          value={inputValue}
          onChange={handleInputChange}
          error={isError}
          className="pr-16"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <span className="text-sm text-muted-foreground">hours</span>
        </div>
      </div>

      {displayHelperText && (
        <p className={cn(
          "text-sm",
          isError ? "text-destructive" :
          value && value < 6 ? "text-warning" :
          "text-muted-foreground"
        )}>
          {displayHelperText}
        </p>
      )}

      <div className="text-xs text-muted-foreground">
        💡 Most adults need 7-9 hours for optimal recovery and metabolism
      </div>
    </div>
  );
}
