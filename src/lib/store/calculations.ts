import type { DerivedMetrics } from '../../models/DerivedMetrics';
import type { MacroPlan } from '../../models/MacroPlan';
import type { DietStyle, Goal, Sex, UserInput } from '../../models/UserInput';
import { allocateMacros } from '../macros';
import type { GuidanceMessage } from '../macros';
import { cunningham, katchMcArdle, manualRmr, mifflinStJeor } from '../rmr';
import { calcTdee, PAL_VALUES } from '../tdee';
import type { DietKey, PalKey } from '../tdee';
import type { CalculationState } from './types';

const validDietKeys: readonly DietKey[] = [
  'balanced',
  'highProtein',
  'keto',
  'lowCarb',
  'vegan',
  'vegetarian',
  'custom'
];

export function normalizeDietStyle(value: DietStyle | string | undefined): DietKey {
  return validDietKeys.includes(value as DietKey) ? value as DietKey : 'balanced';
}

export function normalizeGoal(value: Goal | string): Goal {
  return value === 'loss' || value === 'gain' ? value : 'maintain';
}

export function normalizeSex(value: Sex): 'male' | 'female' {
  return value === 'female' ? 'female' : 'male';
}

export function mapActivityLevelToPal(activityLevel: unknown): PalKey {
  if (typeof activityLevel === 'string' && activityLevel in PAL_VALUES) {
    return activityLevel as PalKey;
  }
  if (typeof activityLevel === 'number') {
    if (activityLevel <= 1.2) return 'sedentary';
    if (activityLevel <= 1.375) return 'light';
    if (activityLevel <= 1.55) return 'moderate';
    if (activityLevel <= 1.725) return 'active';
    return 'veryActive';
  }
  return 'moderate';
}

export function calculateRmr(
  user: UserInput,
  formula: DerivedMetrics['formulaUsed']
): number {
  const formulaInput = {
    weightKg: user.weightKg,
    heightCm: user.heightCm,
    age: user.age,
    sex: normalizeSex(user.sex)
  };

  switch (formula) {
    case 'manual':
      return user.rmrManual !== undefined
        ? manualRmr(user.rmrManual).rmr
        : mifflinStJeor(formulaInput).rmr;
    case 'katch':
      return katchMcArdle({
        weightKg: user.weightKg,
        bodyFatPct: user.bodyFatPct ?? 0
      }).rmr;
    case 'cunningham':
      return cunningham({
        weightKg: user.weightKg,
        bodyFatPct: user.bodyFatPct ?? 0
      }).rmr;
    default:
      return mifflinStJeor(formulaInput).rmr;
  }
}

export interface NutritionCalculation {
  derivedMetrics: DerivedMetrics;
  macroPlan: MacroPlan;
  macroGuidance: GuidanceMessage[];
}

export function calculateNutritionPlan(
  user: UserInput,
  calculation: CalculationState,
  pal: string | number,
  goalPct: number
): NutritionCalculation {
  const palFactorOverride = typeof pal === 'number' ? pal : undefined;
  const normalizedPal = typeof pal === 'number' ? Number(pal.toFixed(3)) : null;
  const exactPal = normalizedPal === null
    ? undefined
    : (Object.entries(PAL_VALUES) as [PalKey, number][]).find(
        ([, value]) => Number(value.toFixed(3)) === normalizedPal
      )?.[0];
  const palKey = typeof pal === 'string' && pal in PAL_VALUES
    ? pal as PalKey
    : exactPal ?? mapActivityLevelToPal(pal);
  const dietStyle = normalizeDietStyle(user.dietStyle);
  const goal = normalizeGoal(user.goal);
  const tdee = calcTdee({
    rmr: calculation.derivedMetrics.rmr,
    pal: palKey,
    dietStyle,
    goalPct,
    sex: normalizeSex(user.sex),
    bodyFatPct: user.bodyFatPct
  });
  const macroResult = allocateMacros({
    targetKcal: tdee.tdee,
    weightKg: user.weightKg,
    dietStyle,
    goal
  });
  const { guidance: macroGuidance = [], carbG, ...macroValues } = macroResult;

  return {
    derivedMetrics: {
      ...calculation.derivedMetrics,
      palFactor: palFactorOverride ?? PAL_VALUES[palKey],
      palKey,
      tef: tdee.tef,
      tdee: tdee.tdee
    },
    macroPlan: {
      ...calculation.macroPlan,
      ...macroValues,
      carbsG: carbG,
      targetCalories: tdee.tdee
    },
    macroGuidance
  };
}

export function calculateMacros(user: UserInput, calculation: CalculationState): {
  macroPlan: MacroPlan;
  macroGuidance: GuidanceMessage[];
} {
  const result = allocateMacros({
    targetKcal: calculation.derivedMetrics.tdee,
    weightKg: user.weightKg,
    dietStyle: normalizeDietStyle(user.dietStyle),
    goal: normalizeGoal(user.goal)
  });
  const { guidance: macroGuidance = [], carbG, ...macroValues } = result;

  return {
    macroPlan: {
      ...calculation.macroPlan,
      ...macroValues,
      carbsG: carbG,
      targetCalories: calculation.derivedMetrics.tdee
    },
    macroGuidance
  };
}
