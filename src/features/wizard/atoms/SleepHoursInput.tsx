import React, { useState, useEffect } from 'react';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { cn } from '../../../lib/utils';
import { Icon } from '../../../components/ui/Icon';

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
    if (hours < 6) return 'Short sleep can make recovery and plan adherence harder';
    if (hours < 7) return 'If feasible, work toward at least 7 hours consistently';
    if (hours <= 9) return 'This meets the common minimum recommendation for adults';
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

      <div className="flex gap-2 text-xs text-muted-foreground">
        <Icon name="info" className="h-4 w-4 flex-shrink-0" /> Adults are generally advised to sleep at least 7 hours; individual needs vary
      </div>
    </div>
  );
}
