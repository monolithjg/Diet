import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { MacroRing } from '../atoms/MacroRing';
import { cn } from '../../../lib/utils';
import type { MacroPlan } from '../../../models/MacroPlan';

interface DailyTargetsProps {
  macroPlan: MacroPlan;
  className?: string;
}

const MACRO_COLORS = {
  protein: '#3b82f6', // blue
  carbs: '#10b981',   // green
  fat: '#f59e0b'      // amber
};

export function DailyTargets({ macroPlan, className }: DailyTargetsProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Daily Targets</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Rings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
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
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Calorie Breakdown
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-blue-600">
                {Math.round(macroPlan.proteinG * 4)}
              </div>
              <div className="text-xs text-gray-500 mt-1">kcal from protein</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">
                {Math.round(macroPlan.carbsG * 4)}
              </div>
              <div className="text-xs text-gray-500 mt-1">kcal from carbs</div>
            </div>
            <div>
              <div className="text-xl font-bold text-amber-600">
                {Math.round(macroPlan.fatG * 9)}
              </div>
              <div className="text-xs text-gray-500 mt-1">kcal from fat</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
