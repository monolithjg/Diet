import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
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
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Macronutrient Distribution</CardTitle>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {macroPlan.targetCalories.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 font-normal">
            Total Daily Calories
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Detailed Breakdown List */}
          <div className="space-y-4 order-2 md:order-1">
            {pieData.map((macro) => (
              <div
                key={macro.name}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: macro.color }}
                  />
                  <span className="font-medium text-gray-900">{macro.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {Math.round(macro.grams)}g
                  </div>
                  <div className="text-xs text-gray-500">
                    {macro.value}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pie Chart */}
          <div className="h-64 order-1 md:order-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
