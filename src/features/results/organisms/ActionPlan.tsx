import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { ActionItem } from '../atoms/ActionItem';
import type { GuidanceMessage } from '../../../lib/macros';
import { cn } from '../../../lib/utils';
import { Icon, type IconName } from '../../../components/ui/Icon';

interface ActionPlanProps {
  guidance: GuidanceMessage[];
  className?: string;
}

// Transform guidance messages into actionable items
const createActionItems = (guidance: GuidanceMessage[]) => {
  const actions: Array<{
    icon: IconName;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
  }> = [];

  guidance.forEach((message) => {
    // Skip disclaimer messages in action plan
    if (message.key.includes('disclaimer')) return;

    const priority = message.type === 'critical' ? 'high' :
      message.type === 'warn' ? 'medium' : 'low';

    // Meal timing actions
    if (message.category === 'mealTiming') {
      if (message.key.includes('preWorkout')) {
        actions.push({
          icon: 'water',
          title: 'Pre-Workout Nutrition',
          description: `A practical option is ${message.replacements?.protein || '15-20'}g protein ${message.replacements?.timing || '30-90'} minutes before training, adjusted for comfort and session demands.`,
          priority,
          category: 'Meal Timing'
        });
      }
      if (message.key.includes('postWorkout')) {
        actions.push({
          icon: 'protein',
          title: 'Post-Workout Recovery',
          description: `Include about ${message.replacements?.protein || '20'}g protein in a meal within a few hours after training.`,
          priority,
          category: 'Meal Timing'
        });
      }
      if (message.key.includes('frequency')) {
        actions.push({
          icon: 'meal',
          title: 'Meal Frequency',
          description: `Use ${message.replacements?.meals || 'a repeatable meal schedule'} as a flexible starting pattern; adjust it for appetite, schedule, and training.`,
          priority,
          category: 'Meal Timing'
        });
      }
    }

    // Micronutrient actions
    if (message.category === 'micronutrient') {
      if (message.key.includes('b12')) {
        actions.push({
          icon: 'supplement',
          title: 'B-12 Supplementation',
          description: `Review B-12-fortified foods or an appropriate supplement (${message.replacements?.dosage || 'dose varies'}) with a qualified clinician.`,
          priority,
          category: 'Supplements'
        });
      }
      if (message.key.includes('iron')) {
        actions.push({
          icon: 'info',
          title: 'Iron Optimization',
          description: 'Prioritize iron-rich foods and pair plant sources with vitamin C. Use iron supplements only when a clinician or laboratory result supports them.',
          priority,
          category: 'Nutrition'
        });
      }
      if (message.key.includes('vitaminD')) {
        actions.push({
          icon: 'sun',
          title: 'Vitamin D Support',
          description: 'Review vitamin D intake, sun exposure, and any need for testing or supplementation with a qualified clinician.',
          priority,
          category: 'Supplements'
        });
      }
    }

    // Hydration actions
    if (message.category === 'hydration') {
      if (
        message.key.includes('dailyTarget')
        || message.key.includes('highActivity')
        || message.key.endsWith('.base')
      ) {
        actions.push({
          icon: 'water',
          title: 'Daily Hydration Target',
          description: `Use ${message.replacements?.target || 'a personalized range'} as a starting point, then adjust for thirst, climate, workout duration, and measured sweat loss.`,
          priority,
          category: 'Hydration'
        });
      }
      if (message.key.includes('trainingExtra')) {
        const trainingAmount = message.replacements?.amount
          ? `up to ${message.replacements.amount}ml extra fluid`
          : 'additional fluid';
        actions.push({
          icon: 'water',
          title: 'Training-Day Fluids',
          description: `For longer, hotter, or sweatier sessions, consider ${trainingAmount} based on your measured needs.`,
          priority,
          category: 'Hydration'
        });
      }
      if (message.key.includes('electrolytes')) {
        actions.push({
          icon: 'info',
          title: 'Electrolytes for Demanding Sessions',
          description: 'Consider electrolyte replacement for long, hot, or high-sweat training rather than as an automatic daily supplement.',
          priority,
          category: 'Hydration'
        });
      }
    }

    // Lifestyle actions
    if (message.category === 'lifestyle') {
      if (message.key.includes('sleep')) {
        actions.push({
          icon: 'sleep',
          title: 'Sleep Optimization',
          description: `Aim for ${message.replacements?.target || '7-9'} hours of sleep per night to support ${message.replacements?.impact || 'your goals'}.`,
          priority,
          category: 'Lifestyle'
        });
      }
      if (message.key.includes('stress')) {
        actions.push({
          icon: 'stress',
          title: 'Stress Management',
          description: 'Choose a realistic stress-management practice that supports recovery, sleep, and plan adherence.',
          priority,
          category: 'Lifestyle'
        });
      }
    }

    // Allergy swap actions
    if (message.category === 'allergySwap') {
      actions.push({
        icon: 'swap',
        title: 'Food Alternatives',
        description: 'Replace allergenic foods with safe alternatives that provide similar nutritional benefits.',
        priority,
        category: 'Food Safety'
      });
    }
  });

  return actions;
};

export function ActionPlan({ guidance, className }: ActionPlanProps) {
  const actionItems = createActionItems(guidance);

  // Group actions by category
  const actionsByCategory = actionItems.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, typeof actionItems>);

  // Sort categories by priority (high priority categories first)
  const sortedCategories = Object.entries(actionsByCategory).sort(([, actionsA], [, actionsB]) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const maxPriorityA = Math.max(...actionsA.map(a => priorityOrder[a.priority]));
    const maxPriorityB = Math.max(...actionsB.map(a => priorityOrder[a.priority]));
    return maxPriorityB - maxPriorityA;
  });

  if (actionItems.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon name="check" className="mr-2 text-primary" />
            Your Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Icon name="target" className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No action items available
            </h3>
            <p className="text-sm text-muted">
              Recalculate or refresh your plan to generate guidance for these targets.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border bg-surface shadow-sm h-full flex flex-col", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg font-semibold text-foreground">
          <Icon name="target" className="mr-2 text-primary" />
          Your Action Plan
        </CardTitle>
        <p className="text-sm text-muted mt-1">
          Personalized recommendations based on your nutrition profile
        </p>
      </CardHeader>
      <CardContent className="space-y-8 p-6 flex-grow">
        {sortedCategories.map(([category, actions]) => (
          <div key={category} className="animate-slide-up">
            <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-4 flex items-center">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
              {category}
            </h4>
            <div className="space-y-3">
              {actions.map((action, index) => (
                <ActionItem
                  key={`${category}-${index}`}
                  icon={action.icon}
                  title={action.title}
                  description={action.description}
                  priority={action.priority}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Summary */}
        <div className="pt-8 mt-auto">
          <div className="flex flex-col gap-3 text-xs font-medium text-muted sm:flex-row sm:items-center sm:justify-between">
            <span>
              Total recommendations: {actionItems.length}
            </span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="flex items-center">
                <div className="w-1.5 h-1.5 bg-error rounded-full mr-1.5"></div>
                High: {actionItems.filter(a => a.priority === 'high').length}
              </span>
              <span className="flex items-center">
                <div className="w-1.5 h-1.5 bg-warning rounded-full mr-1.5"></div>
                Medium: {actionItems.filter(a => a.priority === 'medium').length}
              </span>
              <span className="flex items-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mr-1.5"></div>
                Low: {actionItems.filter(a => a.priority === 'low').length}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
