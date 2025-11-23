import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
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
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Macronutrient Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  formatter={(value, entry: any) => (
                    <span style={{ color: entry.color }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Breakdown */}
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {macroPlan.targetCalories}
              </div>
              <div className="text-sm text-gray-600">
                Total Daily Calories
              </div>
            </div>

            <div className="space-y-3">
              {pieData.map((macro) => (
                <div 
                  key={macro.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: macro.color }}
                    />
                    <span className="font-medium">{macro.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {Math.round(macro.grams)}g
                    </div>
                    <div className="text-sm text-gray-600">
                      {macro.value}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Targets + Calorie Breakdown */}
        <div className="mt-6 pt-6 border-t">
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
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Calorie Breakdown
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-blue-600">
                  {Math.round(macroPlan.proteinG * 4)}
                </div>
                <div className="text-xs text-gray-600">kcal from protein</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {Math.round(macroPlan.carbsG * 4)}
                </div>
                <div className="text-xs text-gray-600">kcal from carbs</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-amber-600">
                  {Math.round(macroPlan.fatG * 9)}
                </div>
                <div className="text-xs text-gray-600">kcal from fat</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 