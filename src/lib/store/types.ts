import type { DerivedMetrics } from '../../models/DerivedMetrics';
import type { MacroPlan } from '../../models/MacroPlan';
import type { UserInput } from '../../models/UserInput';
import type { GuidanceMessage } from '../macros';

export interface CalculationState {
  derivedMetrics: DerivedMetrics;
  macroPlan: MacroPlan;
  macroGuidance: GuidanceMessage[];
}

export interface UiState {
  step: number;
  unit: 'metric' | 'imperial';
  guidance: GuidanceMessage[];
}

export interface StoreData {
  user: UserInput;
  calc: CalculationState;
  cgeGuidance: GuidanceMessage[];
  ui: UiState;
}

export interface StoreActions {
  updateUser: (userData: Partial<UserInput>) => void;
  updateCalc: (calcData: Partial<Pick<CalculationState, 'derivedMetrics' | 'macroPlan'>>) => void;
  updateUi: (uiData: Partial<UiState> | ((previous: UiState) => Partial<UiState>)) => void;
  resetState: () => void;
  generateGuidance: () => void;
  updateUserWithGuidance: (userData: Partial<UserInput>) => void;
  refreshGuidance: () => void;
  recalcRmr: (formula?: DerivedMetrics['formulaUsed']) => void;
  setTdee: (pal: string | number, goalPct: number) => void;
  setMacros: (dietStyle?: string, proteinTarget?: number) => void;
  setUser: (updates: Partial<UserInput>) => void;
  setRmr: () => void;
  reset: () => void;
}

export type StoreState = StoreData & StoreActions;

