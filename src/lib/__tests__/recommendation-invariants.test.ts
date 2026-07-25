import { describe, expect, it } from 'vitest';
import type { UserInput } from '../../models/UserInput';
import {
  calculateNutritionPlan,
  calculateRmr
} from '../store/calculations';
import { createInitialCalculation } from '../store/state';

const baseUser: UserInput = {
  age: 35,
  sex: 'male',
  heightCm: 180,
  weightKg: 80,
  activityLevel: 1.55,
  goal: 'maintain',
  dietStyle: 'balanced',
  allergies: [],
  unitPreference: 'metric'
};

function calculationWithRmr(rmr: number) {
  const calculation = createInitialCalculation();
  calculation.derivedMetrics.rmr = rmr;
  return calculation;
}

describe('Recommendation scientific invariants', () => {
  it('orders calorie targets loss < maintenance < gain', () => {
    const calculation = calculationWithRmr(1600);
    const loss = calculateNutritionPlan(
      { ...baseUser, goal: 'loss' },
      calculation,
      'moderate',
      -0.2
    );
    const maintain = calculateNutritionPlan(
      baseUser,
      calculation,
      'moderate',
      0
    );
    const gain = calculateNutritionPlan(
      { ...baseUser, goal: 'gain' },
      calculation,
      'moderate',
      0.15
    );

    expect(loss.macroPlan.targetCalories)
      .toBeLessThan(maintain.macroPlan.targetCalories);
    expect(maintain.macroPlan.targetCalories)
      .toBeLessThan(gain.macroPlan.targetCalories);
  });

  it('does not change maintenance calories merely because the diet label changes', () => {
    const calculation = calculationWithRmr(1600);
    const balanced = calculateNutritionPlan(
      baseUser,
      calculation,
      'moderate',
      0
    );
    const highProtein = calculateNutritionPlan(
      { ...baseUser, dietStyle: 'highProtein' },
      calculation,
      'moderate',
      0
    );

    expect(highProtein.derivedMetrics.tdee)
      .toBe(balanced.derivedMetrics.tdee);
    expect(highProtein.macroPlan.targetCalories)
      .toBe(balanced.macroPlan.targetCalories);
  });

  it('applies a custom calorie adjustment from maintenance', () => {
    const result = calculateNutritionPlan(
      { ...baseUser, deficitSurplusKcal: -300 },
      calculationWithRmr(1600),
      'moderate',
      0
    );

    expect(result.derivedMetrics.tdee).toBe(2480);
    expect(result.macroPlan.targetCalories).toBe(2180);
  });

  it('honors manual RMR and uses body fat for lean-mass RMR', () => {
    expect(calculateRmr({ ...baseUser, rmrManual: 1800 }, 'manual'))
      .toBe(1800);

    const katch = calculateRmr({ ...baseUser, bodyFatPct: 20 }, 'katch');
    expect(katch).toBeCloseTo(1752.4, 1);
  });

  it('keeps macro energy and percentages internally coherent', () => {
    const result = calculateNutritionPlan(
      baseUser,
      calculationWithRmr(1600),
      'moderate',
      0
    );
    const macros = result.macroPlan;
    const macroCalories =
      macros.proteinG * 4 + macros.carbsG * 4 + macros.fatG * 9;

    expect(macroCalories).toBeCloseTo(macros.targetCalories, -1);
    expect(macros.proteinPct + macros.carbPct + macros.fatPct)
      .toBeCloseTo(1, 2);
  });
});
