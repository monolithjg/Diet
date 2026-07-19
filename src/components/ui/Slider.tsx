import React from 'react';

interface SliderProps {
  id?: string;
  min: number;
  max: number;
  step: number;
  value: number[];
  onValueChange: (value: number[]) => void;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export function Slider({
  id,
  min,
  max,
  step,
  value,
  onValueChange,
  className = '',
  disabled = false,
  'aria-label': ariaLabel,
}: SliderProps) {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    onValueChange([newValue]);
  };

  const currentValue = value[0] || min;
  const percentage = ((currentValue - min) / (max - min)) * 100;

  return (
    <div className={`relative w-full ${className}`}>
      {/* Track */}
      <div className="relative h-3 bg-surface-subtle rounded-full touch-manipulation">
        {/* Progress fill */}
        <div
          className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />

        {/* Slider input */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleInputChange}
          disabled={disabled}
          aria-label={ariaLabel}
          className={`
            absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer
            disabled:cursor-not-allowed touch-manipulation
            focus-visible:outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-offset-[length:var(--focus-ring-offset)] ring-offset-background
          `}
        />

        {/* Thumb */}
        <div
          className={`
            absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2
            w-6 h-6 bg-control border-2 border-primary rounded-full shadow-sm transition-all duration-200 pointer-events-none
            ${disabled ? 'opacity-50 border-border-strong' : 'hover:scale-110'}
          `}
          style={{ left: `${percentage}%` }}
        />
      </div>

      {/* Value display */}
      <div className="flex justify-between text-xs text-muted mt-1">
        <span>{min}</span>
        <span className="font-medium text-primary">{currentValue.toFixed(2)}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
