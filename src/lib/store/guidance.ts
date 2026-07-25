import type { MacroPlan } from '../../models/MacroPlan';
import type { Goal } from '../../models/UserInput';
import { generateContextualGuidance } from '../cge/engine';
import type { CGEInput } from '../cge/engine';
import type { GuidanceMessage, MacroOutput } from '../macros';
import type { StoreData, StoreState } from './types';
import { mapActivityLevelToPal, normalizeDietStyle, normalizeGoal, normalizeSex } from './calculations';

export function macroPlanToMacroOutput(
  plan: MacroPlan,
  guidance: GuidanceMessage[] = []
): MacroOutput {
  return {
    proteinG: plan.proteinG,
    fatG: plan.fatG,
    carbG: plan.carbsG,
    proteinPct: plan.proteinPct,
    fatPct: plan.fatPct,
    carbPct: plan.carbPct,
    guidance: [...guidance]
  };
}

export function constructGuidanceInput(state: StoreData): CGEInput | null {
  const { user, calc } = state;
  if (calc.derivedMetrics.tdee <= 0) return null;

  return {
    macros: macroPlanToMacroOutput(calc.macroPlan, calc.macroGuidance),
    tdee: calc.derivedMetrics.tdee,
    pal: calc.derivedMetrics.palKey ?? mapActivityLevelToPal(user.activityLevel),
    dietStyle: normalizeDietStyle(user.dietStyle),
    allergies: Array.isArray(user.allergies) ? user.allergies : [],
    goal: normalizeGoal(user.goal) as Goal,
    workoutTime: user.workoutTime,
    sleepHours: user.sleepHours,
    stressLevel: user.stressLevel,
    weightKg: user.weightKg,
    sex: normalizeSex(user.sex),
    age: user.age,
    bodyFatPct: user.bodyFatPct
  };
}

export function generateGuidanceForState(state: StoreData): GuidanceMessage[] {
  const input = constructGuidanceInput(state);
  return input ? generateContextualGuidance(input) : [];
}

let guidanceTimeout: ReturnType<typeof setTimeout> | null = null;

export function scheduleGuidanceUpdate(getState: () => StoreState): void {
  if (guidanceTimeout) clearTimeout(guidanceTimeout);
  guidanceTimeout = setTimeout(() => {
    getState().generateGuidance();
    guidanceTimeout = null;
  }, 250);
}

