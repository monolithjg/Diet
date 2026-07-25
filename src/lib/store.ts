import { setAutoFreeze } from 'immer';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { mergeGuidance } from './cge/engine';
import {
  calculateMacros,
  calculateNutritionPlan,
  calculateRmr
} from './store/calculations';
import {
  constructGuidanceInput,
  generateGuidanceForState,
  scheduleGuidanceUpdate
} from './store/guidance';
import {
  clearPersistedState,
  loadPersistedState,
  persistState
} from './store/persistence';
import {
  createInitialCalculation,
  createInitialUi,
  createInitialUser
} from './store/state';
import type { StoreData, StoreState } from './store/types';

setAutoFreeze(false);

const persisted = loadPersistedState();

export const useStore = create<StoreState>()(
  immer((set, get) => ({
    user: persisted.user,
    calc: persisted.calc,
    ui: createInitialUi(),
    cgeGuidance: [],

    updateUser: (userData) => {
      set((state) => {
        Object.assign(state.user, userData);
      });
    },

    updateCalc: (calcData) => {
      set((state) => {
        if (calcData.derivedMetrics) {
          Object.assign(state.calc.derivedMetrics, calcData.derivedMetrics);
        }
        if (calcData.macroPlan) {
          Object.assign(state.calc.macroPlan, calcData.macroPlan);
        }
      });
    },

    updateUi: (uiData) => {
      set((state) => {
        const updates = typeof uiData === 'function' ? uiData(state.ui) : uiData;
        Object.assign(state.ui, updates);
      });
    },

    resetState: () => {
      set((state) => {
        state.user = createInitialUser();
        state.calc = createInitialCalculation();
        state.cgeGuidance = [];
        state.ui = createInitialUi();
      });
    },

    generateGuidance: () => {
      const snapshot = get();
      const input = constructGuidanceInput(snapshot);
      if (!input) {
        set((state) => {
          state.cgeGuidance = [];
          state.ui.guidance = [];
        });
        return;
      }

      try {
        const contextual = generateGuidanceForState(snapshot);
        set((state) => {
          state.cgeGuidance = contextual;
          state.ui.guidance = mergeGuidance(state.calc.macroGuidance, contextual);
        });
      } catch (error) {
        console.error('CGE failure:', error);
      }
    },

    updateUserWithGuidance: (userData) => {
      set((state) => {
        Object.assign(state.user, userData);
      });
      scheduleGuidanceUpdate(get);
    },

    refreshGuidance: () => get().generateGuidance(),

    recalcRmr: (formula) => {
      const snapshot = get();
      const selected = formula
        ?? (snapshot.user.rmrManual !== undefined
          ? 'manual'
          : snapshot.user.bodyFatPct !== undefined
            ? 'katch'
            : 'mifflin');
      try {
        const rmr = calculateRmr(snapshot.user, selected);
        set((state) => {
          state.calc.derivedMetrics.rmr = rmr;
          state.calc.derivedMetrics.formulaUsed = selected;
        });
        scheduleGuidanceUpdate(get);
      } catch (error) {
        console.error('RMR calculation failed:', error);
      }
    },

    setTdee: (pal, goalPct) => {
      const snapshot = get();
      const result = calculateNutritionPlan(snapshot.user, snapshot.calc, pal, goalPct);
      set((state) => {
        state.calc.derivedMetrics = result.derivedMetrics;
        state.calc.macroPlan = result.macroPlan;
        state.calc.macroGuidance = result.macroGuidance;
        const nextState = state as unknown as StoreData;
        state.cgeGuidance = generateGuidanceForState(nextState);
        state.ui.guidance = mergeGuidance(state.calc.macroGuidance, state.cgeGuidance);
      });
      persistState(get());
    },

    setMacros: () => {
      const snapshot = get();
      if (snapshot.calc.derivedMetrics.tdee <= 0) return;

      const result = calculateMacros(snapshot.user, snapshot.calc);
      set((state) => {
        state.calc.macroPlan = result.macroPlan;
        state.calc.macroGuidance = result.macroGuidance;
        const nextState = state as unknown as StoreData;
        state.cgeGuidance = generateGuidanceForState(nextState);
        state.ui.guidance = mergeGuidance(state.calc.macroGuidance, state.cgeGuidance);
      });
      persistState(get());
    },

    setUser: (updates) => {
      set((state) => {
        Object.assign(state.user, updates);
      });
      persistState(get());
    },

    setRmr: () => {
      const snapshot = get();
      const rmr = calculateRmr(snapshot.user, 'mifflin');
      set((state) => {
        state.calc.derivedMetrics.rmr = rmr;
        state.calc.derivedMetrics.formulaUsed = 'mifflin';
      });
      persistState(get());
    },

    reset: () => {
      set((state) => {
        state.user = createInitialUser();
        state.calc = createInitialCalculation();
        state.cgeGuidance = [];
        state.ui = createInitialUi();
      });
      clearPersistedState();
    }
  }))
);

export type { StoreState } from './store/types';
