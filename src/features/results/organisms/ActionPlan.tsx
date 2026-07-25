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
          description: `Have ${message.replacements?.protein || '15-20'}g protein ${message.replacements?.timing || '30'} minutes before training for optimal performance.`,
          priority,
          category: 'Meal Timing'
        });
      }
      if (message.key.includes('postWorkout')) {
        actions.push({
          icon: 'protein',
          title: 'Post-Workout Recovery',
          description: `Consume ${message.replacements?.protein || '20'}g protein within 2 hours after training to support muscle recovery.`,
          priority,
          category: 'Meal Timing'
        });
      }
      if (message.key.includes('frequency')) {
        actions.push({
          icon: 'meal',
          title: 'Meal Frequency',
          description: `Aim for ${message.replacements?.meals || '3-4'} meals per day to support your ${message.replacements?.reason || 'goals'}.`,
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
          description: `Take ${message.replacements?.dosage || '10-25 mcg daily'} B-12 supplement due to limited availability in plant foods.`,
          priority,
          category: 'Supplements'
        });
      }
      if (message.key.includes('iron')) {
        actions.push({
          icon: 'info',
          title: 'Iron Optimization',
          description: 'Consider iron-rich foods or supplementation, especially for premenopausal women. Pair with vitamin C for better absorption.',
          priority,
          category: 'Nutrition'
        });
      }
      if (message.key.includes('vitaminD')) {
        actions.push({
          icon: 'sun',
          title: 'Vitamin D Support',
          description: 'Consider vitamin D supplementation, especially during winter months or with limited sun exposure.',
          priority,
          category: 'Supplements'
        });
      }
    }

    // Hydration actions
    if (message.category === 'hydration') {
      actions.push({
        icon: 'water',
        title: 'Daily Hydration Target',
        description: `Aim for ${message.replacements?.target || '2.5L'} water daily${message.replacements?.additional ? `, plus ${message.replacements.additional} on training days` : ''}.`,
        priority,
        category: 'Hydration'
      });
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
          description: 'Consider stress management techniques like meditation, deep breathing, or yoga to support optimal metabolism.',
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
              Great job!
            </h3>
            <p className="text-sm text-muted">
              Your nutrition plan looks well-balanced. Continue following your current approach.
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
          <div className="flex items-center justify-between text-xs font-medium text-muted">
            <span>
              Total recommendations: {actionItems.length}
            </span>
            <div className="flex items-center space-x-4">
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
