import type { Goal, UserInput } from '../../models/UserInput';
import type { CalculationState, UiState } from './types';

const initialUser: UserInput = {
  age: 0,
  sex: 'unspecified',
  heightCm: 0,
  weightKg: 0,
  activityLevel: 0,
  goal: 'maintain' as Goal,
  allergies: [],
  unitPreference: 'metric'
};

const initialCalculation: CalculationState = {
  derivedMetrics: {
    rmr: 0,
    formulaUsed: 'mifflin',
    palFactor: 1.2,
    palKey: 'moderate',
    tef: 0,
    tdee: 0
  },
  macroPlan: {
    targetCalories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    proteinPct: 0,
    carbPct: 0,
    fatPct: 0
  },
  macroGuidance: []
};

export const initialUi: UiState = {
  step: 1,
  unit: 'metric',
  guidance: []
};

export function createInitialUser(): UserInput {
  return {
    ...initialUser,
    allergies: [...initialUser.allergies]
  };
}

export function createInitialCalculation(): CalculationState {
  return {
    derivedMetrics: { ...initialCalculation.derivedMetrics },
    macroPlan: { ...initialCalculation.macroPlan },
    macroGuidance: [...initialCalculation.macroGuidance]
  };
}

export function createInitialUi(): UiState {
  return {
    ...initialUi,
    guidance: [...initialUi.guidance]
  };
}
