import React, { useState } from 'react';
void React;
import { Card, CardContent, CardHeader } from './Card';
import { cn } from '../../lib/utils';
import type { GuidanceMessage } from '../../lib/macros';
import { translateGuidanceMessage, translateValidationMessage, getCurrentLocale } from '../../lib/cge/i18n';

interface GuidanceCardProps {
  message: GuidanceMessage;
  expanded?: boolean;
  onToggle?: () => void;
  showCategory?: boolean;
}

const getMessageTypeConfig = (type: GuidanceMessage['type']) => {
  switch (type) {
    case 'critical':
      return {
        icon: '!',
        bgColor: 'bg-red-50',
        textColor: 'text-red-800',
        borderColor: 'border-red-200',
        badgeColor: 'bg-red-100 text-red-800',
        ring: 'ring-red-100'
      };
    case 'warn':
      return {
        icon: '!',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-800',
        borderColor: 'border-amber-200',
        badgeColor: 'bg-amber-100 text-amber-800',
        ring: 'ring-amber-100'
      };
    case 'info':
      return {
        icon: 'i',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-200',
        badgeColor: 'bg-blue-100 text-blue-800',
        ring: 'ring-blue-100'
      };
    default:
      return {
        icon: 'i',
        bgColor: 'bg-neutral-50',
        textColor: 'text-slate-900',
        borderColor: 'border-neutral-200',
        badgeColor: 'bg-neutral-100 text-slate-800',
        ring: 'ring-neutral-100'
      };
  }
};

const getCategoryDisplayName = (category: string) => {
  const locale = getCurrentLocale();
  
  // Category display names with i18n support
  const categoryNames: Record<string, Record<string, string>> = {
    en: {
      mealTiming: 'Meal Timing',
      micronutrient: 'Nutrients',
      hydration: 'Hydration',
      allergySwap: 'Food Swaps',
      lifestyle: 'Lifestyle',
      validation: 'Validation'
    },
    es: {
      mealTiming: 'Horario de Comidas',
      micronutrient: 'Nutrientes',
      hydration: 'Hidratación',
      allergySwap: 'Intercambio de Alimentos',
      lifestyle: 'Estilo de Vida',
      validation: 'Validación'
    }
  };
  
  return categoryNames[locale]?.[category] || category;
};

const getDisplayMessage = (message: GuidanceMessage): string => {
  // Use proper i18n translation
  if (message.category === 'validation' || message.key.includes('disclaimer')) {
    return translateValidationMessage(message.key, message.replacements);
  }
  
  return translateGuidanceMessage(message);
};

export function GuidanceCard({ 
  message, 
  expanded = false, 
  onToggle,
  showCategory = true 
}: GuidanceCardProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const config = getMessageTypeConfig(message.type);
  const displayMessage = getDisplayMessage(message);
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setIsExpanded(!isExpanded);
    }
  };
  
  const isDisclaimer = message.key.includes('disclaimer');
  
  return (
    <Card className={cn(
      "transition-all duration-200",
      config.bgColor,
      config.borderColor,
      "overflow-hidden",
      !isDisclaimer && "hover:shadow-md cursor-pointer"
    )}>
      <CardHeader 
        className={cn(
          "pb-3",
          !isDisclaimer && "cursor-pointer"
        )}
        onClick={!isDisclaimer ? handleToggle : undefined}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <span className="text-lg flex-shrink-0 mt-0.5">
              {config.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                {showCategory && !isDisclaimer && (
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      "bg-white/60 border border-transparent",
                      config.badgeColor
                    )}>
                      {getCategoryDisplayName(message.category)}
                    </span>
                )}
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                  "bg-white/40 border border-transparent",
                  config.badgeColor
                )}>
                  {message.type}
                </span>
              </div>
              <p className={cn(
                "text-sm leading-relaxed",
                config.textColor
              )}>
                {displayMessage}
              </p>
            </div>
          </div>
          
          {!isDisclaimer && (
            <button
              type="button"
              aria-expanded={isExpanded || expanded}
              className={cn(
                "flex-shrink-0 ml-2 text-sm opacity-75 hover:opacity-100 transition-transform transform",
                (isExpanded || expanded) ? 'rotate-180' : 'rotate-0',
                config.textColor
              )}
            >
              ▾
            </button>
          )}
        </div>
      </CardHeader>
      
      {(isExpanded || expanded) && !isDisclaimer && (
        <CardContent className="pt-0">
            <div className={cn("text-sm", config.textColor, "opacity-85")}>
            <p className="text-sm"><strong>Why this matters:</strong></p>
            <p className="mt-1 text-sm">
              This recommendation is based on your inputs and evidence-based nutrition guidance.
            </p>
            {message.replacements && Object.keys(message.replacements).length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer hover:opacity-100">
                  View calculation details
                </summary>
                <pre className="mt-1 text-xs bg-white/50 p-2 rounded">
                  {JSON.stringify(message.replacements, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
} 