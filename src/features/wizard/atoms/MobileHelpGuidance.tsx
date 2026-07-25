import React, { useState } from 'react';
void React;
import { cn } from '../../../lib/utils';
import { Icon, type IconName } from '../../../components/ui/Icon';
import type { HelpItem } from './mobileHelpContent';

interface MobileHelpGuidanceProps {
  title: string;
  helpItems: HelpItem[];
  className?: string;
}

export function MobileHelpGuidance({
  title,
  helpItems,
  className
}: MobileHelpGuidanceProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [showAllCategories, setShowAllCategories] = useState(false);

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const getCategoryIcon = (category?: string): IconName => {
    switch (category) {
      case 'basic':
        return 'info';
      case 'advanced':
        return 'spark';
      case 'troubleshooting':
        return 'swap';
      default:
        return 'info';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'basic':
        return 'text-primary';
      case 'advanced':
        return 'text-purple-600';
      case 'troubleshooting':
        return 'text-warning';
      default:
        return 'text-muted';
    }
  };

  const categorizedItems = helpItems.map((item, index) => ({ ...item, index }));
  const basicItems = categorizedItems.filter(item => !item.category || item.category === 'basic');
  const advancedItems = categorizedItems.filter(item => item.category === 'advanced' || item.category === 'troubleshooting');

  const visibleItems = showAllCategories ? categorizedItems : basicItems;

  return (
    <div className={cn("bg-surface rounded-lg shadow-sm", className)}>
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground flex items-center">
            <Icon name="info" className="mr-2 text-primary" />
            {title}
          </h3>
          {advancedItems.length > 0 && (
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="text-xs text-primary hover:text-primary/80 font-medium touch-manipulation min-h-[32px] px-2"
            >
              {showAllCategories ? 'Show Basic' : 'Show All'}
            </button>
          )}
        </div>
      </div>

      {/* Help Items */}
      <div className="space-y-1">
        {visibleItems.map((item) => {
          const isExpanded = expandedItems.has(item.index);

          return (
            <div key={item.index} className="p-4">
              <button
                onClick={() => toggleItem(item.index)}
                className="w-full text-left touch-manipulation min-h-[44px] flex items-center justify-between"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center space-x-3 flex-1 pr-2">
                  <Icon name={getCategoryIcon(item.category)} className="h-4 w-4 flex-shrink-0 text-primary" />
                  <span className="text-sm font-medium text-foreground leading-relaxed">
                    {item.question}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {item.category && item.category !== 'basic' && (
                    <span className={cn("text-xs font-medium", getCategoryColor(item.category))}>
                      {item.category}
                    </span>
                  )}
                  <svg
                    className={cn(
                      "w-5 h-5 text-subtle transition-transform duration-200 flex-shrink-0",
                      isExpanded && "rotate-180"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div className="mt-3 pl-8 pr-2">
                  <div className="text-sm text-muted leading-relaxed">
                    {item.answer}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Tip */}
      <div className="p-4 bg-surface-subtle rounded-b-lg">
        <div className="text-xs text-muted text-center">
          Tap any question above for detailed help
        </div>
      </div>
    </div>
  );
}
