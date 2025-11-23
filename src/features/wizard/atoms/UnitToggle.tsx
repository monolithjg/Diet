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
  const handleToggle = useCallback(() => {
    const newUnit = value === 'metric' ? 'imperial' : 'metric';
    onChange(newUnit);
  }, [value, onChange]);

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <span className="text-sm font-medium text-gray-700">Units:</span>
      
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${value === 'metric' ? 'bg-primary' : 'bg-gray-200'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        role="switch"
        aria-checked={value === 'metric'}
        aria-label={`Switch to ${value === 'metric' ? 'imperial' : 'metric'} units`}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 
            transition duration-200 ease-in-out
            ${value === 'metric' ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
      
      <div className="flex items-center space-x-2 text-sm">
        <span className={`${value === 'metric' ? 'text-primary font-medium' : 'text-gray-500'}`}>
          Metric
        </span>
        <span className="text-gray-300">|</span>
        <span className={`${value === 'imperial' ? 'text-primary font-medium' : 'text-gray-500'}`}>
          Imperial
        </span>
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
      icon: '🌍'
    },
    {
      value: 'imperial' as const,
      label: 'Imperial',
      description: 'lbs, ft/in',
      icon: '🇺🇸'
    }
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-sm font-medium text-gray-700 mb-2">
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
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{option.icon}</span>
              <div>
                <div className={`font-medium text-sm ${value === option.value ? 'text-primary' : 'text-gray-900'}`}>
                  {option.label}
                </div>
                <div className="text-xs text-gray-500">{option.description}</div>
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