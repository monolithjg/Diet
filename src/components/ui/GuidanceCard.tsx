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
        bgColor: 'bg-error-soft',
        textColor: 'text-error-foreground',
        borderColor: 'border-error/30',
        badgeColor: 'bg-error-soft text-error-foreground',
        ring: 'ring-error/30'
      };
    case 'warn':
      return {
        icon: '!',
        bgColor: 'bg-warning-soft',
        textColor: 'text-warning-foreground',
        borderColor: 'border-warning/30',
        badgeColor: 'bg-warning-soft text-warning-foreground',
        ring: 'ring-warning/30'
      };
    case 'info':
      return {
        icon: 'i',
        bgColor: 'bg-primary-soft',
        textColor: 'text-primary',
        borderColor: 'border-primary/25',
        badgeColor: 'bg-primary-soft text-primary',
        ring: 'ring-primary/25'
      };
    default:
      return {
        icon: 'i',
        bgColor: 'bg-surface-subtle',
        textColor: 'text-foreground',
        borderColor: 'border-border',
        badgeColor: 'bg-surface-raised text-foreground',
        ring: 'ring-ring'
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
                      "bg-surface-raised/60 border border-transparent",
                      config.badgeColor
                    )}>
                      {getCategoryDisplayName(message.category)}
                    </span>
                )}
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                  "bg-surface-raised/40 border border-transparent",
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
                <pre className="mt-1 text-xs bg-surface-raised/50 p-2 rounded">
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
