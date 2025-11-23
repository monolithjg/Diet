import React, { createContext, useContext } from 'react';

interface ToggleGroupContextValue {
  value: string | string[] | undefined;
  onValueChange: (value: any) => void;
  type: 'single' | 'multiple';
  disabled?: boolean;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | undefined>(undefined);

interface ToggleGroupProps {
  type: 'single' | 'multiple';
  value?: string | string[];
  onValueChange: (value: any) => void;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
  'aria-label'?: string;
}

export function ToggleGroup({
  type,
  value,
  onValueChange,
  className = '',
  disabled = false,
  children,
  'aria-label': ariaLabel,
}: ToggleGroupProps) {
  return (
    <ToggleGroupContext.Provider value={{ value, onValueChange, type, disabled }}>
      <div
        className={`inline-flex ${className}`}
        role={type === 'single' ? 'radiogroup' : 'group'}
        aria-label={ariaLabel}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

interface ToggleGroupItemProps {
  value: string;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
  'aria-label'?: string;
}

export function ToggleGroupItem({
  value,
  className = '',
  disabled = false,
  children,
  'aria-label': ariaLabel,
}: ToggleGroupItemProps) {
  const context = useContext(ToggleGroupContext);
  
  if (!context) {
    throw new Error('ToggleGroupItem must be used within a ToggleGroup');
  }

  const { value: groupValue, onValueChange, type, disabled: groupDisabled } = context;
  const isDisabled = disabled || groupDisabled;
  
  // Determine if this item is selected
  const isSelected = type === 'single' 
    ? groupValue === value
    : Array.isArray(groupValue) && groupValue.includes(value);

  const handleClick = () => {
    if (isDisabled) return;

    if (type === 'single') {
      onValueChange(value);
    } else {
      // Multiple selection logic
      const currentValues = Array.isArray(groupValue) ? groupValue : [];
      if (currentValues.includes(value)) {
        // Remove from selection
        onValueChange(currentValues.filter(v => v !== value));
      } else {
        // Add to selection
        onValueChange([...currentValues, value]);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      role={type === 'single' ? 'radio' : 'checkbox'}
      aria-checked={isSelected}
      aria-label={ariaLabel}
      data-state={isSelected ? 'on' : 'off'}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center px-3 py-2 text-sm font-medium
        border border-neutral-200 bg-white text-slate-700
        hover:bg-neutral-50 hover:text-slate-900
        focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-150 touch-manipulation
        min-h-[44px] min-w-[44px]
        ${isSelected 
          ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700' 
          : 'bg-white text-slate-700 border-neutral-200'
        }
        ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </button>
  );
} 