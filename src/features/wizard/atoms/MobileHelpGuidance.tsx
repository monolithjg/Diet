import React, { useState } from 'react';
void React;
import { cn } from '../../../lib/utils';

interface HelpItem {
  question: string;
  answer: string;
  category?: 'basic' | 'advanced' | 'troubleshooting';
}

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

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'basic':
        return '📋';
      case 'advanced':
        return '⚙️';
      case 'troubleshooting':
        return '🔧';
      default:
        return '❓';
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
    <div className={cn("bg-surface border border-border rounded-lg shadow-sm", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground flex items-center">
            <span className="text-lg mr-2">💡</span>
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
      <div className="divide-y divide-border-subtle">
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
                  <span className="text-base flex-shrink-0">
                    {getCategoryIcon(item.category)}
                  </span>
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
      <div className="p-4 bg-surface-subtle rounded-b-lg border-t border-border-subtle">
        <div className="text-xs text-muted text-center">
          📱 Tap any question above for detailed help
        </div>
      </div>
    </div>
  );
}

// Predefined help sets for common use cases
export const personalInfoHelp: HelpItem[] = [
  {
    question: "Why do you need my age and biological sex?",
    answer: "Age and biological sex are crucial factors in metabolic rate calculations. Men typically have higher metabolic rates than women, and metabolic rate changes with age. This helps us provide accurate calorie recommendations.",
    category: "basic"
  },
  {
    question: "How accurate should my weight and height be?",
    answer: "Be as accurate as possible. Small differences in weight (±1-2 lbs) won't significantly impact results, but height should be precise. Use your morning weight after using the bathroom for best accuracy.",
    category: "basic"
  },
  {
    question: "Should I use imperial or metric units?",
    answer: "Use whichever system you're most comfortable with. The app automatically converts between systems and all calculations use the same precision regardless of your choice.",
    category: "basic"
  },
  {
    question: "What if I don't know my exact weight?",
    answer: "Use your best estimate from recent memory. You can always update this information later. If you haven't weighed yourself recently, consider doing so for more accurate results.",
    category: "troubleshooting"
  }
];

export const activityGoalsHelp: HelpItem[] = [
  {
    question: "How do I choose the right activity level?",
    answer: "Consider your total daily movement, not just formal exercise. Include work activity, daily walking, and all planned exercise. When in doubt, start conservative and adjust based on your results.",
    category: "basic"
  },
  {
    question: "What's the difference between goals?",
    answer: "Weight Loss creates a calorie deficit to reduce body weight. Maintain Weight keeps your current weight stable. Weight Gain creates a surplus for muscle building or healthy weight gain.",
    category: "basic"
  },
  {
    question: "When should I use custom calorie targets?",
    answer: "Only use custom targets if you have specific requirements from a coach or medical professional, or if you have experience tracking calories and know what works for your body.",
    category: "advanced"
  },
  {
    question: "Why does workout timing matter?",
    answer: "Workout timing helps optimize meal recommendations. Morning workouts may benefit from different pre/post-workout nutrition compared to evening sessions.",
    category: "advanced"
  }
];

export const dietPreferencesHelp: HelpItem[] = [
  {
    question: "Which diet style should I choose?",
    answer: "Choose the style that best matches your current eating habits and preferences. You can always adjust macros later. 'Balanced' is a good starting point for most people.",
    category: "basic"
  },
  {
    question: "How important are the allergy selections?",
    answer: "Very important if you have real food allergies or intolerances. This helps us suggest safe alternatives and avoid recommending foods that could cause problems.",
    category: "basic"
  },
  {
    question: "Do sleep and stress really affect nutrition?",
    answer: "Absolutely! Poor sleep increases hunger hormones and makes weight management harder. High stress elevates cortisol, which can increase appetite and promote fat storage, especially around the midsection.",
    category: "basic"
  },
  {
    question: "What if my diet style changes?",
    answer: "You can update your preferences anytime in your results. The system will recalculate your recommendations based on your new choices.",
    category: "troubleshooting"
  }
];
