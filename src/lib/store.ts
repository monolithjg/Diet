// Temporary simplified Zustand store (no persist) to debug infinite loop
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { setAutoFreeze } from 'immer';
import type { UserInput, Goal } from '../models/UserInput';
import type { DerivedMetrics } from '../models/DerivedMetrics';
import type { MacroPlan } from '../models/MacroPlan';
import { mifflinStJeor, katchMcArdle, cunningham, manualRmr } from './rmr';
import { calcTdee, PAL_VALUES } from './tdee';
import type { PalKey } from './tdee';
import { allocateMacros } from './macros';
import { generateContextualGuidance, mergeGuidance } from './cge/engine';
import type { CGEInput } from './cge/engine';
import type { GuidanceMessage, MacroOutput } from './macros';

setAutoFreeze(false);

interface StoreState {
  user: UserInput;
  calc: {
    derivedMetrics: DerivedMetrics;
    macroPlan: MacroPlan;
    macroGuidance: GuidanceMessage[];
  };
  cgeGuidance: GuidanceMessage[];
  ui: typeof initialUi;
  updateUser: (userData: Partial<UserInput>) => void;
  updateCalc: (calcData: Partial<{ derivedMetrics?: DerivedMetrics; macroPlan?: MacroPlan }>) => void;
  updateUi: (uiData: Partial<typeof initialUi> | ((prev: typeof initialUi) => Partial<typeof initialUi>)) => void;
  resetState: () => void;
  generateGuidance: () => void;
  updateUserWithGuidance: (userData: Partial<UserInput>) => void;
  refreshGuidance: () => void;
  recalcRmr: (formula?: string) => void;
  setTdee: (pal: string | number, goalPct: number) => void;
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
  allergies: [],
  unitPreference: 'metric'
};

const initialCalc = {
  derivedMetrics: {
    rmr: 0,
    formulaUsed: 'mifflin' as const,
    palFactor: 1.2,
    palKey: 'moderate' as PalKey,
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
  macroGuidance: [] as GuidanceMessage[]
};

const initialUi = {
  step: 1,
  unit: 'metric' as 'metric' | 'imperial',
  guidance: [] as GuidanceMessage[]
};

function createInitialUser(): UserInput {
  return {
    ...initialUser,
    allergies: Array.isArray(initialUser.allergies) ? [...initialUser.allergies] : []
  };
}

function createInitialCalc() {
  return {
    derivedMetrics: { ...initialCalc.derivedMetrics },
    macroPlan: { ...initialCalc.macroPlan },
    macroGuidance: [...initialCalc.macroGuidance]
  };
}

function constructCGEInput(state: StoreState): CGEInput | null {
  const { user, calc } = state;

  if (!calc?.derivedMetrics || calc.derivedMetrics.tdee <= 0) {
    return null;
  }

  const palKey = calc.derivedMetrics.palKey ?? mapActivityLevelToPal(user.activityLevel);
  const sex = user.sex === 'male' || user.sex === 'female' ? user.sex : 'male';
  const goal: Goal = ['loss', 'gain', 'maintain'].includes(user.goal) ? user.goal : 'maintain';
  const macros = macroPlanToMacroOutput(calc.macroPlan, calc.macroGuidance);

  return {
    macros,
    tdee: calc.derivedMetrics.tdee,
    pal: palKey,
    dietStyle: toDietKey(user.dietStyle),
    allergies: Array.isArray(user.allergies) ? user.allergies : [],
    goal,
    workoutTime: user.workoutTime,
    sleepHours: user.sleepHours,
    stressLevel: user.stressLevel,
    weightKg: user.weightKg,
    sex,
    age: user.age,
    bodyFatPct: user.bodyFatPct
  };
}

// Utility to coerce dietStyle to DietKey
const validDietKeys = ['balanced', 'highProtein', 'keto', 'lowCarb', 'vegan', 'vegetarian', 'custom'] as const;
function toDietKey(val: any): typeof validDietKeys[number] {
  return validDietKeys.includes(val) ? val : 'balanced';
}

function mapActivityLevelToPal(activityLevel: unknown): PalKey {
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

// Utility to map MacroPlan to MacroOutput
function macroPlanToMacroOutput(plan: MacroPlan, guidance: GuidanceMessage[] = []): MacroOutput {
  return {
    proteinG: typeof plan.proteinG === 'number' ? plan.proteinG : 0,
    fatG: typeof plan.fatG === 'number' ? plan.fatG : 0,
    carbG: typeof plan.carbsG === 'number' ? plan.carbsG : 0, // MacroOutput uses carbG, MacroPlan uses carbsG
    proteinPct: typeof plan.proteinPct === 'number' ? plan.proteinPct : 0,
    fatPct: typeof plan.fatPct === 'number' ? plan.fatPct : 0,
    carbPct: typeof plan.carbPct === 'number' ? plan.carbPct : 0,
    guidance: [...guidance]
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
      const calcFromStorage = parsed.calc ?? {};
      return {
        user: { ...initialUser, ...parsed.user },
        calc: {
          derivedMetrics: { ...initialCalc.derivedMetrics, ...(calcFromStorage.derivedMetrics ?? {}) },
          macroPlan: { ...initialCalc.macroPlan, ...(calcFromStorage.macroPlan ?? {}) },
          macroGuidance: Array.isArray(calcFromStorage.macroGuidance)
            ? calcFromStorage.macroGuidance
            : [...initialCalc.macroGuidance]
        }
      };
    }
  } catch (e) {
    console.error('Failed to load persisted state:', e);
  }
  return { user: createInitialUser(), calc: createInitialCalc() };
};

const { user: persistedUser, calc: persistedCalc } = loadPersistedState();

export const useStore = create<StoreState>()(
  immer((set, get) => ({
    user: persistedUser ?? createInitialUser(),
    calc: persistedCalc ?? createInitialCalc(),
    ui: { ...initialUi },
    cgeGuidance: [],

    updateUser: (userData: Partial<UserInput>) => set((state: any) => { Object.assign(state.user, userData); }),
    updateCalc: (calcData: Partial<{ derivedMetrics?: DerivedMetrics; macroPlan?: MacroPlan }>) => set((state: any) => {
      if (calcData.derivedMetrics) Object.assign(state.calc.derivedMetrics, calcData.derivedMetrics);
      if (calcData.macroPlan) Object.assign(state.calc.macroPlan, calcData.macroPlan);
    }),
    updateUi: (uiData: Partial<typeof initialUi> | ((prev: typeof initialUi) => Partial<typeof initialUi>)) => {
      set((state: any) => {
        if (typeof uiData === 'function') {
          const updated = uiData(state.ui);
          Object.assign(state.ui, updated);
        } else {
          Object.assign(state.ui, uiData);
        }
      });
    },
    resetState: () => set(() => ({
      user: createInitialUser(),
      calc: createInitialCalc(),
      ui: { ...initialUi }
    })),

    generateGuidance: () => {
      const state = get();
      const cgeInput = constructCGEInput(state);
      if (!cgeInput) {
        return set((draft: StoreState) => {
          draft.cgeGuidance = [];
          draft.ui.guidance = [
            {
              key: 'guidance.missingMacros',
              type: 'warn',
              category: 'validation',
              replacements: { text: 'Macronutrient data is incomplete or missing.' }
            }
          ];
        });
      }
      try {
        const contextual = generateContextualGuidance(cgeInput);
        const macroGuidance = Array.isArray(state.calc.macroGuidance) ? state.calc.macroGuidance : [];
        const merged = mergeGuidance(macroGuidance, contextual);
        set((draft: StoreState) => {
          draft.cgeGuidance = contextual;
          draft.ui.guidance = merged;
        });
      } catch (err) {
        console.error('CGE failure:', err);
      }
    },

    updateUserWithGuidance: (userData: Partial<UserInput>) => {
      set((state: any) => { Object.assign(state.user, userData); });
      scheduleGuidanceUpdate(get);
    },
    refreshGuidance: () => {
      get().generateGuidance();
    },

    recalcRmr: (formula?: string) => {
      const state = get() as any;
      const selected = formula ?? state.calc.derivedMetrics.formulaUsed ?? 'mifflin';
      const { user } = state;
      let rmrValue = 0;
      try {
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
      } catch (err) {
        console.error('RMR calculation failed:', err);
        return;
      }
      set((draft: any) => {
        draft.calc.derivedMetrics.rmr = rmrValue;
        draft.calc.derivedMetrics.formulaUsed = selected;
      });
      scheduleGuidanceUpdate(get);
    },

    setTdee: (pal, goalPct) => {
      const snapshot = get();

      let palKey: PalKey;
      let palFactorOverride: number | undefined;

      if (typeof pal === 'string' && pal in PAL_VALUES) {
        palKey = pal as PalKey;
      } else if (typeof pal === 'number') {
        palFactorOverride = pal;
        const normalizedInput = Number(pal.toFixed(3));
        const exactMatch = (Object.entries(PAL_VALUES) as [PalKey, number][]).find(
          ([, value]) => Number(value.toFixed(3)) === normalizedInput
        );
        palKey = exactMatch ? exactMatch[0] : mapActivityLevelToPal(pal);
      } else {
        palKey = mapActivityLevelToPal(snapshot.user.activityLevel);
      }

      const dietStyle = toDietKey(snapshot.user.dietStyle);
      const sex = snapshot.user.sex === 'male' || snapshot.user.sex === 'female' ? snapshot.user.sex : 'male';
      const goal: Goal = ['loss', 'gain', 'maintain'].includes(snapshot.user.goal) ? snapshot.user.goal : 'maintain';

      const tdeeResult = calcTdee({
        rmr: snapshot.calc.derivedMetrics.rmr,
        pal: palKey,
        dietStyle,
        goalPct,
        sex,
        bodyFatPct: snapshot.user.bodyFatPct
      });

      const resolvedPalFactor = palFactorOverride ?? PAL_VALUES[palKey];

      const macroResult = allocateMacros({
        targetKcal: tdeeResult.tdee,
        weightKg: snapshot.user.weightKg,
        dietStyle,
        goal
      });
      const {
        guidance: macroGuidance = [],
        carbG,
        ...macroRest
      } = macroResult;

      const macroPlanForGuidance: MacroPlan = {
        ...snapshot.calc.macroPlan,
        ...macroRest,
        carbsG: carbG,
        targetCalories: tdeeResult.tdee
      };

      const contextualGuidance = generateContextualGuidance({
        macros: macroPlanToMacroOutput(macroPlanForGuidance, macroGuidance),
        tdee: tdeeResult.tdee,
        pal: palKey,
        dietStyle,
        allergies: snapshot.user.allergies || [],
        goal,
        workoutTime: snapshot.user.workoutTime,
        sleepHours: snapshot.user.sleepHours,
        stressLevel: snapshot.user.stressLevel,
        weightKg: snapshot.user.weightKg,
        sex,
        age: snapshot.user.age,
        bodyFatPct: snapshot.user.bodyFatPct
      });

      const mergedGuidance = mergeGuidance(macroGuidance, contextualGuidance);

      set((state) => {
        state.calc.derivedMetrics.palFactor = resolvedPalFactor;
        state.calc.derivedMetrics.palKey = palKey;
        state.calc.derivedMetrics.tef = tdeeResult.tef;
        state.calc.derivedMetrics.tdee = tdeeResult.tdee;

        state.calc.macroPlan = {
          ...state.calc.macroPlan,
          ...macroRest,
          carbsG: carbG,
          targetCalories: tdeeResult.tdee
        };
        state.calc.macroGuidance = macroGuidance;
        state.cgeGuidance = contextualGuidance;
        state.ui.guidance = mergedGuidance;
      });

      persistState(get());
    },

    setMacros: () => {
      set((state) => {
        if (state.calc.derivedMetrics.tdee > 0) {
          const dietStyle = toDietKey(state.user.dietStyle);
          const macroResult = allocateMacros({
            targetKcal: state.calc.derivedMetrics.tdee,
            weightKg: state.user.weightKg,
            dietStyle,
            goal: ['loss', 'gain', 'maintain'].includes(state.user.goal) ? state.user.goal : 'maintain',
          });
          const {
            guidance: macroGuidance = [],
            carbG,
            ...macroRest
          } = macroResult;
          state.calc.macroPlan = { 
            ...state.calc.macroPlan, 
            ...macroRest, 
            carbsG: carbG,
            // set targetCalories last so it is not overwritten
            targetCalories: state.calc.derivedMetrics.tdee
          };
          state.calc.macroGuidance = macroGuidance;
          // Update CGE guidance
          const palKey = state.calc.derivedMetrics.palKey ?? mapActivityLevelToPal(state.user.activityLevel);
          const sex = state.user.sex === 'male' || state.user.sex === 'female' ? state.user.sex : 'male';
          const goal: Goal = ['loss', 'gain', 'maintain'].includes(state.user.goal) ? state.user.goal : 'maintain';
          const contextualGuidance = generateContextualGuidance({
            macros: macroPlanToMacroOutput(state.calc.macroPlan, state.calc.macroGuidance),
            tdee: state.calc.derivedMetrics.tdee,
            pal: palKey,
            dietStyle,
            allergies: state.user.allergies || [],
            goal,
            workoutTime: state.user.workoutTime,
            sleepHours: state.user.sleepHours,
            stressLevel: state.user.stressLevel,
            weightKg: state.user.weightKg,
            sex,
            age: state.user.age,
            bodyFatPct: state.user.bodyFatPct
          });
          state.cgeGuidance = contextualGuidance;
          state.ui.guidance = mergeGuidance(state.calc.macroGuidance, contextualGuidance);
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
        state.user = createInitialUser();
        state.calc = createInitialCalc();
        state.cgeGuidance = [];
        state.ui = { ...initialUi };
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
