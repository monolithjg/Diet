// Temporary simplified Zustand store (no persist) to debug infinite loop
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { UserInput, Goal } from '../models/UserInput';
import type { DerivedMetrics } from '../models/DerivedMetrics';
import type { MacroPlan } from '../models/MacroPlan';
import { mifflinStJeor, katchMcArdle, cunningham, manualRmr } from './rmr';
import { calcTdee, PAL_VALUES } from './tdee';
import { allocateMacros } from './macros';
import { generateContextualGuidance, mergeGuidance } from './cge/engine';
import type { GuidanceMessage } from './macros';

interface StoreState {
  user: UserInput;
  calc: {
    derivedMetrics: DerivedMetrics;
    macroPlan: MacroPlan;
  };
  cgeGuidance: any[];
  ui: typeof initialUi;
  updateUser: (userData: Partial<UserInput>) => void;
  updateCalc: (calcData: Partial<{ derivedMetrics?: DerivedMetrics; macroPlan?: MacroPlan }>) => void;
  updateUi: (uiData: Partial<typeof initialUi> | ((prev: typeof initialUi) => Partial<typeof initialUi>)) => void;
  resetState: () => void;
  generateGuidance: () => void;
  updateUserWithGuidance: (userData: Partial<UserInput>) => void;
  refreshGuidance: () => void;
  recalcRmr: (formula?: string) => void;
  setTdee: (pal: string, goalPct: number, options?: any) => void;
  setMacros: (dietStyle?: string, proteinTarget?: number) => void;
  setUser: (updates: Partial<UserInput>) => void;
  setRmr: (options?: any) => void;
  reset: () => void;
}

const initialUser: UserInput = {
  age: 30,
  sex: 'male',
  heightCm: 175,
  weightKg: 70,
  activityLevel: 1.55,
  goal: 'maintain' as Goal,
  dietStyle: 'balanced',
  allergies: [],
  unitPreference: 'metric'
};

const initialCalc = {
  derivedMetrics: {
    rmr: 0,
    formulaUsed: 'mifflin' as const,
    palFactor: 1.2,
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
  }
};

const initialUi = {
  step: 1,
  unit: 'metric' as 'metric' | 'imperial',
  guidance: [] as GuidanceMessage[]
};

function constructCGEInput(state: any): any {
  // Construct the CGE input directly from the relevant parts of the state
  // Adjust as needed based on actual requirements
  return { user: state.user, calc: state.calc };
}

// Utility to coerce dietStyle to DietKey
const validDietKeys = ['balanced', 'highProtein', 'keto', 'lowCarb', 'vegan', 'vegetarian', 'custom'] as const;
function toDietKey(val: any): typeof validDietKeys[number] {
  return validDietKeys.includes(val) ? val : 'balanced';
}

// Utility to map MacroPlan to MacroOutput
function macroPlanToMacroOutput(plan: MacroPlan): any {
  return {
    proteinG: typeof plan.proteinG === 'number' ? plan.proteinG : 0,
    fatG: typeof plan.fatG === 'number' ? plan.fatG : 0,
    carbG: typeof plan.carbsG === 'number' ? plan.carbsG : 0, // MacroOutput uses carbG, MacroPlan uses carbsG
    proteinPct: typeof plan.proteinPct === 'number' ? plan.proteinPct : 0,
    fatPct: typeof plan.fatPct === 'number' ? plan.fatPct : 0,
    carbPct: typeof plan.carbPct === 'number' ? plan.carbPct : 0,
    guidance: Array.isArray(plan.notes) ? plan.notes : [] // Store does not track guidance, so pass empty array or notes
  };
}

// Helper function to persist state
const persistState = (state: StoreState) => {
  try {
    localStorage.setItem('dietCalculatorState', JSON.stringify({
      user: state.user,
      calc: state.calc
    }));
  } catch (e) {
    console.error('Failed to persist state:', e);
  }
};

// Helper function to load persisted state
const loadPersistedState = () => {
  try {
    const saved = localStorage.getItem('dietCalculatorState');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        user: { ...initialUser, ...parsed.user },
        calc: { ...initialCalc, ...parsed.calc }
      };
    }
  } catch (e) {
    console.error('Failed to load persisted state:', e);
  }
  return { user: initialUser, calc: initialCalc };
};

const { user: persistedUser, calc: persistedCalc } = loadPersistedState();

export const useStore = create<StoreState>()(
  immer((set, get) => ({
    user: persistedUser,
    calc: persistedCalc,
    ui: initialUi,
    cgeGuidance: [],

    updateUser: (userData: Partial<UserInput>) => set((state: any) => { Object.assign(state.user, userData); }),
    updateCalc: (calcData: Partial<{ derivedMetrics?: DerivedMetrics; macroPlan?: MacroPlan }>) => set((state: any) => {
      if (calcData.derivedMetrics) Object.assign(state.calc.derivedMetrics, calcData.derivedMetrics);
      if (calcData.macroPlan) Object.assign(state.calc.macroPlan, calcData.macroPlan);
    }),
    updateUi: (uiData: Partial<typeof initialUi> | ((prev: typeof initialUi) => Partial<typeof initialUi>)) => {
      console.log('[updateUi called]', uiData, new Error().stack);
      set((state: any) => {
        if (typeof uiData === 'function') {
          const updated = uiData(state.ui);
          Object.assign(state.ui, updated);
        } else {
          Object.assign(state.ui, uiData);
        }
      });
    },
    resetState: () => set(() => ({ user: initialUser, calc: initialCalc, ui: { ...initialUi } })),

    generateGuidance: () => {
      const state = get() as any;
      const cgeInput = constructCGEInput(state);
      if (!cgeInput) return set((draft: any) => { draft.ui.guidance = []; });
      try {
        const contextual = generateContextualGuidance(cgeInput);
        const validation = state.ui.guidance.filter((g: any) => g.category === 'validation');
        const merged = mergeGuidance(validation, contextual);
        if (JSON.stringify(merged) !== JSON.stringify(state.ui.guidance)) {
          set((draft: any) => { draft.ui.guidance = merged; });
        }
      } catch (err) {
        console.error('CGE failure:', err);
      }
    },

    updateUserWithGuidance: (userData: Partial<UserInput>) => {
      set((state: any) => { Object.assign(state.user, userData); });
      scheduleGuidanceUpdate(get);
    },
    refreshGuidance: () => scheduleGuidanceUpdate(get),

    recalcRmr: (formula?: string) => {
      const state = get() as any;
      const selected = formula ?? state.calc.derivedMetrics.formulaUsed ?? 'mifflin';
      const { user } = state;
      let rmrValue = 0;
      try {
        console.log('[Store] recalcRmr input user:', user, 'formula:', selected);
        switch (selected) {
          case 'manual':
            rmrValue = user.rmrManual !== undefined ? manualRmr(user.rmrManual).rmr : mifflinStJeor(user).rmr;
            break;
          case 'katch':
            rmrValue = katchMcArdle({ weightKg: user.weightKg, bodyFatPct: user.bodyFatPct ?? 0 }).rmr;
            break;
          case 'cunningham':
            rmrValue = cunningham({ weightKg: user.weightKg, bodyFatPct: user.bodyFatPct ?? 0 }).rmr;
            break;
          default:
            rmrValue = mifflinStJeor(user).rmr;
        }
        console.log('[Store] recalcRmr output rmrValue:', rmrValue);
      } catch (err) {
        console.error('RMR calculation failed:', err);
        return;
      }
      set((draft: any) => {
        draft.calc.derivedMetrics.rmr = rmrValue;
        draft.calc.derivedMetrics.formulaUsed = selected;
        console.log('[Store] recalcRmr set derivedMetrics.rmr:', draft.calc.derivedMetrics.rmr);
      });
      scheduleGuidanceUpdate(get);
    },

    setTdee: (pal, goalPct, options) => {
      set((state) => {
        // Ensure pal is a valid PalKey (string)
        let palKey: keyof typeof PAL_VALUES = 'moderate';
        if (typeof pal === 'string' && pal in PAL_VALUES) {
          palKey = pal as keyof typeof PAL_VALUES;
        }
        // Ensure dietStyle is a valid DietKey
        const dietStyle = toDietKey(state.user.dietStyle);
        // Ensure sex is 'male' or 'female'
        const sex = state.user.sex === 'male' || state.user.sex === 'female' ? state.user.sex : 'male';
        console.log('[Store] setTdee input:', {
          rmr: state.calc.derivedMetrics.rmr,
          pal: palKey,
          dietStyle,
          goalPct,
          sex,
          bodyFatPct: state.user.bodyFatPct
        });
        const tdeeResult = calcTdee({
          rmr: state.calc.derivedMetrics.rmr,
          pal: palKey,
          dietStyle,
          goalPct,
          sex,
          bodyFatPct: state.user.bodyFatPct
        });
        console.log('[Store] setTdee output tdeeResult:', tdeeResult);
        state.calc.derivedMetrics.palFactor = tdeeResult.palFactor;
        state.calc.derivedMetrics.tef = tdeeResult.tef;
        state.calc.derivedMetrics.tdee = tdeeResult.tdee;
        // Recalculate macros
        const macros = allocateMacros({
          targetKcal: tdeeResult.tdee,
          weightKg: state.user.weightKg,
          dietStyle,
          goal: ['loss', 'gain', 'maintain'].includes(state.user.goal) ? state.user.goal : 'maintain',
        });
        console.log('[Store] setTdee output macros:', macros);
        state.calc.macroPlan = { ...state.calc.macroPlan, ...macros, carbsG: macros.carbG };
        // Update CGE guidance
        state.cgeGuidance = generateContextualGuidance({
          macros: macroPlanToMacroOutput(state.calc.macroPlan),
          tdee: state.calc.derivedMetrics.tdee,
          pal: palKey,
          dietStyle,
          allergies: state.user.allergies || [],
          goal: ['loss', 'gain', 'maintain'].includes(state.user.goal) ? state.user.goal : 'maintain',
          workoutTime: state.user.workoutTime,
          sleepHours: state.user.sleepHours,
          stressLevel: state.user.stressLevel,
          weightKg: state.user.weightKg,
          sex,
          age: state.user.age,
          bodyFatPct: state.user.bodyFatPct
        });
        console.log('[Store] setTdee set derivedMetrics.tdee:', state.calc.derivedMetrics.tdee);
        persistState(get());
      });
    },

    setMacros: () => {
      set((state) => {
        if (state.calc.derivedMetrics.tdee > 0) {
          const dietStyle = toDietKey(state.user.dietStyle);
          console.log('[Store] setMacros input:', {
            targetKcal: state.calc.derivedMetrics.tdee,
            weightKg: state.user.weightKg,
            dietStyle,
            goal: ['loss', 'gain', 'maintain'].includes(state.user.goal) ? state.user.goal : 'maintain',
          });
          const macros = allocateMacros({
            targetKcal: state.calc.derivedMetrics.tdee,
            weightKg: state.user.weightKg,
            dietStyle,
            goal: ['loss', 'gain', 'maintain'].includes(state.user.goal) ? state.user.goal : 'maintain',
          });
          console.log('[Store] setMacros output macros:', macros);
          state.calc.macroPlan = { 
            ...state.calc.macroPlan, 
            ...macros, 
            carbsG: macros.carbG,
            // set targetCalories last so it is not overwritten
            targetCalories: state.calc.derivedMetrics.tdee
          };
          // Update CGE guidance
          let palKey: keyof typeof PAL_VALUES = 'moderate';
          if (typeof state.user.activityLevel === 'string' && state.user.activityLevel in PAL_VALUES) {
            palKey = state.user.activityLevel as keyof typeof PAL_VALUES;
          }
          const sex = state.user.sex === 'male' || state.user.sex === 'female' ? state.user.sex : 'male';
          state.cgeGuidance = generateContextualGuidance({
            macros: macroPlanToMacroOutput(state.calc.macroPlan),
            tdee: state.calc.derivedMetrics.tdee,
            pal: palKey,
            dietStyle,
            allergies: state.user.allergies || [],
            goal: ['loss', 'gain', 'maintain'].includes(state.user.goal) ? state.user.goal : 'maintain',
            workoutTime: state.user.workoutTime,
            sleepHours: state.user.sleepHours,
            stressLevel: state.user.stressLevel,
            weightKg: state.user.weightKg,
            sex,
            age: state.user.age,
            bodyFatPct: state.user.bodyFatPct
          });
          console.log('[Store] setMacros set macroPlan.targetCalories:', state.calc.macroPlan.targetCalories);
          persistState(get());
        }
      });
    },

    setUser: (updates: Partial<UserInput>) => {
      set((state: any) => {
        Object.assign(state.user, updates);
        persistState(get());
      });
    },
    setRmr: () => {
      set((state) => {
        // Only pass required fields and ensure sex is valid
        const sex = state.user.sex === 'male' || state.user.sex === 'female' ? state.user.sex : 'male';
        const rmrResult = mifflinStJeor({
          weightKg: state.user.weightKg,
          heightCm: state.user.heightCm,
          age: state.user.age,
          sex
        });
        state.calc.derivedMetrics.rmr = rmrResult.rmr;
        state.calc.derivedMetrics.formulaUsed = 'mifflin';
        persistState(get());
      });
    },
    reset: () => {
      set((state) => {
        state.user = initialUser;
        state.calc = initialCalc;
        state.cgeGuidance = [];
        localStorage.removeItem('dietCalculatorState');
      });
    }
  }))
);

let guidanceTimeout: ReturnType<typeof setTimeout> | null = null;
function scheduleGuidanceUpdate(get: () => StoreState) {
  if (guidanceTimeout) clearTimeout(guidanceTimeout);
  guidanceTimeout = setTimeout(() => {
    (get() as any).generateGuidance();
    guidanceTimeout = null;
  }, 250);
}
