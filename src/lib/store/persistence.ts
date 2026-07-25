import type { CalculationState, StoreData } from './types';
import { createInitialCalculation, createInitialUser } from './state';

const STORAGE_KEY = 'dietCalculatorState';

interface PersistedState {
  user: StoreData['user'];
  calc: CalculationState;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function loadPersistedState(): PersistedState {
  const fallback = {
    user: createInitialUser(),
    calc: createInitialCalculation()
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return fallback;

    const parsed: unknown = JSON.parse(saved);
    if (!isRecord(parsed)) return fallback;

    const storedUser = isRecord(parsed.user) ? parsed.user : {};
    const storedCalculation = isRecord(parsed.calc) ? parsed.calc : {};
    const storedMetrics = isRecord(storedCalculation.derivedMetrics)
      ? storedCalculation.derivedMetrics
      : {};
    const storedMacroPlan = isRecord(storedCalculation.macroPlan)
      ? storedCalculation.macroPlan
      : {};
    const defaults = createInitialCalculation();

    return {
      user: { ...fallback.user, ...storedUser },
      calc: {
        derivedMetrics: { ...defaults.derivedMetrics, ...storedMetrics },
        macroPlan: { ...defaults.macroPlan, ...storedMacroPlan },
        macroGuidance: Array.isArray(storedCalculation.macroGuidance)
          ? storedCalculation.macroGuidance
          : defaults.macroGuidance
      }
    } as PersistedState;
  } catch (error) {
    console.error('Failed to load persisted state:', error);
    return fallback;
  }
}

export function persistState(state: StoreData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      user: state.user,
      calc: state.calc
    }));
  } catch (error) {
    console.error('Failed to persist state:', error);
  }
}

export function clearPersistedState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

