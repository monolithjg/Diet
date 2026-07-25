import React, { useCallback } from 'react';
void React;
import type { UnitSystem } from '../hooks/useUnitConversion';

interface UnitToggleProps {
  value: UnitSystem;
  onChange: (unit: UnitSystem) => void;
  disabled?: boolean;
  className?: string;
}

export function UnitToggle({
  value,
  onChange,
  disabled = false,
  className = ''
}: UnitToggleProps) {

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-sm font-medium text-muted">Units:</span>
      <div className="relative inline-flex bg-secondary p-1 rounded-lg border border-border">
        <button
          type="button"
          onClick={() => onChange('metric')}
          disabled={disabled}
          className={`
            relative z-10 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
            ${value === 'metric'
              ? 'bg-surface text-primary shadow-sm'
              : 'text-muted hover:text-foreground'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          Metric
        </button>
        <button
          type="button"
          onClick={() => onChange('imperial')}
          disabled={disabled}
          className={`
            relative z-10 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
            ${value === 'imperial'
              ? 'bg-surface text-primary shadow-sm'
              : 'text-muted hover:text-foreground'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          Imperial
        </button>
      </div>
    </div>
  );
}

/**
 * Alternative card-based unit selector for more prominent placement
 */
export function UnitSelector({
  value,
  onChange,
  disabled = false,
  className = ''
}: UnitToggleProps) {
  const handleSelect = useCallback((unit: UnitSystem) => {
    onChange(unit);
  }, [onChange]);

  const options = [
    {
      value: 'metric' as const,
      label: 'Metric',
      description: 'kg, cm',
      icon: 'SI'
    },
    {
      value: 'imperial' as const,
      label: 'Imperial',
      description: 'lbs, ft/in',
      icon: 'US'
    }
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-sm font-medium text-foreground mb-2">
        Preferred Units
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            disabled={disabled}
            className={`
              relative p-3 rounded-lg border-2 text-left transition-all duration-200
              ${value === option.value
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border hover:border-border-strong hover:bg-surface-subtle'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center space-x-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-subtle text-[10px] font-bold tracking-wide text-primary">{option.icon}</span>
              <div>
                <div className={`font-medium text-sm ${value === option.value ? 'text-primary' : 'text-foreground'}`}>
                  {option.label}
                </div>
                <div className="text-xs text-muted">{option.description}</div>
              </div>
            </div>

            {value === option.value && (
              <div className="absolute top-2 right-2">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
