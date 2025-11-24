import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { MacroRing } from '../atoms/MacroRing';
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
  const pieData = [
    {
      name: 'Protein',
      value: macroPlan.proteinPct,
      grams: macroPlan.proteinG,
      color: MACRO_COLORS.protein
    },
    {
      name: 'Carbs',
      value: macroPlan.carbPct,
      grams: macroPlan.carbsG,
      color: MACRO_COLORS.carbs
    },
    {
      name: 'Fat',
      value: macroPlan.fatPct,
      grams: macroPlan.fatG,
      color: MACRO_COLORS.fat
    }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {Math.round(data.grams)}g ({data.value}%)
          </p>
          <p className="text-xs text-gray-500">
            {Math.round(data.grams * (data.name === 'Fat' ? 9 : 4))} kcal
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={cn("border-border bg-surface shadow-sm", className)}>
      <CardHeader className="border-b border-border/50 bg-secondary/30">
        <CardTitle className="text-lg font-semibold text-foreground">Macronutrient Distribution</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Pie Chart */}
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={4}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-foreground">{macroPlan.targetCalories}</span>
              <span className="text-xs text-muted uppercase tracking-wider">kcal</span>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="space-y-6">
            <div className="space-y-3">
              {pieData.map((macro) => (
                <div
                  key={macro.name}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border/50 hover:border-border transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full ring-2 ring-offset-2 ring-offset-surface"
                      style={{ backgroundColor: macro.color, '--tw-ring-color': macro.color } as any}
                    />
                    <span className="font-medium text-foreground">{macro.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground">
                      {Math.round(macro.grams)}g
                    </div>
                    <div className="text-xs text-muted font-medium">
                      {macro.value}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Targets + Calorie Breakdown */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <MacroRing
              value={macroPlan.proteinG}
              label="Protein"
              unit="g"
              color={MACRO_COLORS.protein}
              percentage={macroPlan.proteinPct}
            />
            <MacroRing
              value={macroPlan.carbsG}
              label="Carbohydrates"
              unit="g"
              color={MACRO_COLORS.carbs}
              percentage={macroPlan.carbPct}
            />
            <MacroRing
              value={macroPlan.fatG}
              label="Fat"
              unit="g"
              color={MACRO_COLORS.fat}
              percentage={macroPlan.fatPct}
            />
          </div>

          {/* Calorie Breakdown */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4 text-center">
              Calorie Source Breakdown
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-blue-50/50">
                <div className="text-lg font-bold text-blue-600">
                  {Math.round(macroPlan.proteinG * 4)}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-blue-600/70 font-medium">kcal from protein</div>
              </div>
              <div className="p-3 rounded-lg bg-green-50/50">
                <div className="text-lg font-bold text-green-600">
                  {Math.round(macroPlan.carbsG * 4)}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-green-600/70 font-medium">kcal from carbs</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-50/50">
                <div className="text-lg font-bold text-amber-600">
                  {Math.round(macroPlan.fatG * 9)}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-amber-600/70 font-medium">kcal from fat</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 