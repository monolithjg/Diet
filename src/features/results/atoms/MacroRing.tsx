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
      <div className="relative w-28 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={36}
              outerRadius={48}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xl font-bold text-foreground">
            {Math.round(value)}
          </div>
          <div className="text-xs font-medium text-muted uppercase tracking-wider">
            {unit}
          </div>
        </div>
      </div>

      <div className="mt-3 text-center">
        <div className="text-sm font-semibold text-foreground">
          {label}
        </div>
        <div className="text-xs text-muted mt-0.5">
          {percentage}% of calories
        </div>
      </div>
    </div>
  );
} 