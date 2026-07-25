import { ValidationRanges, InputRangeError, MissingFieldError, UnrealisticCalorieError } from './errors';

// Re-export for test compatibility
export { UnrealisticCalorieError };

/**
 * Physical Activity Level (PAL) keys
 */
export type PalKey = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';

/**
 * Map of PAL keys to their multiplier values
 */
export const PAL_FACTORS: Record<PalKey, number> = {
  sedentary: 1.20,     // Desk job, ≤ 5,000 steps/day
  light: 1.375,        // Light exercise 1-3× week, 5-7k steps
  moderate: 1.55,      // Moderate exercise 3-5× week, 7-10k steps
  active: 1.725,       // Hard exercise 6-7× week, 10-14k steps
  veryActive: 1.90     // Athlete or laborer, 2-a-day training, >14k steps
};

/**
 * Map of PAL keys to their multiplier values
 */
export const PAL_VALUES = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9
};

/**
 * Diet style keys
 */
export type DietKey = 'balanced' | 'highProtein' | 'keto' | 'lowCarb' | 'vegan' | 'vegetarian' | 'custom';

/**
 * Estimated share of total expenditure attributable to the thermic effect of
 * food. These values are informational only: PAL already represents total
 * 24-hour expenditure, so TEF must not be added on top of RMR × PAL.
 */
export const TEF_PERCENTAGES: Record<Exclude<DietKey, 'custom'>, number> = {
  balanced: 0.10,      // 10%
  highProtein: 0.15,   // 15%
  keto: 0.12,          // 12%
  lowCarb: 0.12,       // 12%
  vegan: 0.11,         // 11%
  vegetarian: 0.10     // 10% (similar to balanced)
};

/**
 * Input interface for TDEE calculations
 */
export interface TdeeInput {
  rmr: number;                    // kcal, validated 800-4,000
  pal: PalKey;                    // enum from above
  dietStyle: DietKey;             // determines tefPct
  tefPct?: number;                // optional manual override (5-20%)
  goalPct?: number;               // -0.4 ... +0.2
  bodyFatPct?: number;            // optional for safety logic
  sex?: 'male' | 'female';        // optional for safety logic
}

/**
 * Output interface for TDEE calculations
 */
export interface TdeeOutput {
  tdee: number;                   // kcal/day
  tef: number;                    // kcal/day
  palFactor: number;
  adjustedCalories: number;       // kcal/day after goal
}

/* -------------------------------------------------------------------------- */
/*                             Helper Functions                                */
/* -------------------------------------------------------------------------- */

function assertRange(
  field: keyof typeof ValidationRanges,
  value: number
): void {
  const { min, max } = ValidationRanges[field];
  if (value < min || value > max) {
    throw new InputRangeError(field, value, min, max);
  }
}

function assertDefined<T>(field: string, value: T | undefined): asserts value is T {
  if (value === undefined || value === null) {
    throw new MissingFieldError(field);
  }
}

/**
 * Calculate TDEE and adjusted calories based on inputs
 */
export function calcTdee(
  input: TdeeInput,
  opts: { bodyCompSafety?: boolean } = {}
): TdeeOutput {
  const { bodyCompSafety = false } = opts;
  const { rmr, pal, dietStyle, tefPct: manualTefPct, goalPct, bodyFatPct, sex } = input;

  // Validation
  assertDefined('rmr', rmr);
  assertRange('manualRmr', rmr); // Reuse the RMR validation range
  assertDefined('pal', pal);
  
  const validPalKeys: PalKey[] = ['sedentary', 'light', 'moderate', 'active', 'veryActive'];
  if (!validPalKeys.includes(pal)) {
    throw new InputRangeError('pal', NaN, NaN, NaN);
  }

  // Get the PAL factor
  const palFactor = PAL_FACTORS[pal];
  
  // Determine TEF percentage based on diet style or manual override
  let tefPct: number;
  if (manualTefPct !== undefined) {
    assertRange('tefPct', manualTefPct);
    tefPct = manualTefPct;
  } else if (dietStyle === 'custom') {
    tefPct = 0.10; // Default to balanced for custom diet
  } else {
    tefPct = TEF_PERCENTAGES[dietStyle];
  }
  
  // PAL is total 24-hour expenditure divided by resting expenditure.
  // Therefore RMR × PAL is already the maintenance TDEE.
  const baseTdee = Math.round((rmr * palFactor) * 100) / 100;
  
  // Retain an estimated TEF component for explanation without double-counting
  // it in the maintenance estimate.
  const tef = baseTdee * tefPct;
  
  const tdee = baseTdee;
  
  // Apply goal adjustment if provided
  let adjustedCalories = tdee;
  if (goalPct !== undefined) {
    assertRange('goalPct', goalPct);
    adjustedCalories = Math.round((tdee * (1 + goalPct)) * 100) / 100;
    
    // Safety check for unrealistically low calories
    if (bodyCompSafety && sex) {
      // Apply body composition-specific safety checks when body fat % is provided
      if (bodyFatPct !== undefined) {
        // Check if user has low body fat and is in a deficit
        const isLowBodyFat = (sex === 'male' && bodyFatPct < 12) || 
                            (sex === 'female' && bodyFatPct < 20);
        
        if (isLowBodyFat && goalPct < 0) {
          // Cap deficit to -15% for low body fat individuals
          const safeDeficit = tdee * (1 - 0.15);
          adjustedCalories = Math.max(adjustedCalories, safeDeficit);
        }
        
      }

      // Always enforce absolute minimum safe calories when safety mode is enabled.
      const minSafeCalories = sex === 'female' ? 1200 : 1500;
      if (adjustedCalories < minSafeCalories) {
        throw new UnrealisticCalorieError(sex, adjustedCalories, minSafeCalories);
      }
    }
  }
  
  return {
    tdee,
    tef,
    palFactor,
    adjustedCalories
  };
} 
