import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { cn } from '../../../lib/utils';

interface MacroRingProps {
  value: number;
  label: string;
  unit: string;
  color: string;
  percentage: number;
  className?: string;
}

export function MacroRing({ 
  value, 
  label, 
  unit, 
  color, 
  percentage, 
  className 
}: MacroRingProps) {
  const data = [
    { name: 'value', value: percentage },
    { name: 'remaining', value: 100 - percentage }
  ];

  const COLORS = [color, '#e5e7eb'];

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative w-24 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={40}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-lg font-bold text-gray-900">
            {Math.round(value)}
          </div>
          <div className="text-xs text-gray-500">
            {unit}
          </div>
        </div>
      </div>
      
      <div className="mt-2 text-center">
        <div className="text-sm font-medium text-gray-900">
          {label}
        </div>
        <div className="text-xs text-gray-500">
          {percentage}% of calories
        </div>
      </div>
    </div>
  );
} 