import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { cn } from '../../../lib/utils';
import type { MacroPlan } from '../../../models/MacroPlan';

interface MacroVisualizerProps {
  macroPlan: MacroPlan;
  className?: string;
}

const MACRO_COLORS = {
  protein: '#3b82f6', // blue
  carbs: '#10b981',   // green
  fat: '#f59e0b'      // amber
};

export function MacroVisualizer({ macroPlan, className }: MacroVisualizerProps) {
  const normalizePercent = (value: number) => value <= 1 ? value * 100 : value;
  const pieData = [
    {
      name: 'Protein',
      value: normalizePercent(macroPlan.proteinPct),
      grams: macroPlan.proteinG,
      color: MACRO_COLORS.protein
    },
    {
      name: 'Carbs',
      value: normalizePercent(macroPlan.carbPct),
      grams: macroPlan.carbsG,
      color: MACRO_COLORS.carbs
    },
    {
      name: 'Fat',
      value: normalizePercent(macroPlan.fatPct),
      grams: macroPlan.fatG,
      color: MACRO_COLORS.fat
    }
  ];

  return (
    <Card className={cn("border-0 bg-surface shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">Macronutrient Distribution</CardTitle>
        <p className="text-sm text-muted">Daily gram targets and their share of total calories</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="sr-only">
          <span>Daily Targets</span><span>{macroPlan.targetCalories}</span><span>Total Daily Calories</span>
          <span>Protein</span><span>Carbohydrates</span><span>Fat</span>
        </div>
        <div className="space-y-7">
              {pieData.map((macro) => (
                <div
                  key={macro.name}
                  className="space-y-3"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-semibold text-foreground">{macro.name}</span>
                    <span className="text-sm text-muted"><strong className="text-lg text-foreground">{Math.round(macro.grams)}g</strong><span aria-hidden="true"> · </span><span>{Math.round(macro.value)}%</span></span>
                    <span className="sr-only">{Math.round(macro.grams)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-surface-subtle" role="img" aria-label={`${macro.name}: ${Math.round(macro.value)}%`}>
                    <div className="h-full rounded-full transition-[width] duration-200" style={{ width: `${macro.value}%`, backgroundColor: macro.color }} />
                  </div>
                </div>
              ))}
        </div>

          {/* Calorie Breakdown */}
          <div className="mt-10 pt-4">
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4 text-center">
              Calorie Breakdown
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-primary-soft/50">
                <div className="text-lg font-bold text-primary">
                  {Math.round(macroPlan.proteinG * 4)}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-primary/70 font-medium">kcal from protein</div>
              </div>
              <div className="p-3 rounded-lg bg-success-soft/50">
                <div className="text-lg font-bold text-success">
                  {Math.round(macroPlan.carbsG * 4)}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-success/70 font-medium">kcal from carbs</div>
              </div>
              <div className="p-3 rounded-lg bg-warning-soft/50">
                <div className="text-lg font-bold text-warning">
                  {Math.round(macroPlan.fatG * 9)}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-warning/70 font-medium">kcal from fat</div>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-muted">
              Fiber starting target: about {Math.round((macroPlan.targetCalories / 1000) * 14)}g per day from food.
            </p>
          </div>
      </CardContent>
    </Card>
  );
}
