export type Sex = 'male' | 'female' | 'other' | 'unspecified';

export type Goal = 'loss' | 'maintain' | 'gain';

export type DietStyle =
  | 'balanced'
  | 'highProtein'
  | 'lowCarb'
  | 'keto'
  | 'vegan'
  | 'vegetarian'
  | 'paleo'
  | 'mediterranean';

/**
 * Optional user-defined macronutrient overrides (all in grams per day).
 */
export interface CustomMacros {
  /** grams of protein per day */
  proteinG?: number;
  /** grams of fat per day */
  fatG?: number;
  /** grams of carbohydrates per day */
  carbG?: number;
}

/**
 * Raw data captured from the wizard before any calculations.
 * All measurements are stored in metric units to keep the
 * calculation pipeline consistent and avoid rounding errors.
 */
export interface UserInput {
  /** Age in whole years (18-120). */
  age: number;
  sex: Sex;
  /** Body weight in kilograms (30-300 kg). */
  weightKg: number;
  /** Stature in centimetres (100-272 cm). */
  heightCm: number;
  /** Optional body-fat percentage (3-75 %). */
  bodyFatPct?: number;
  /** If supplied, overrides formula-based RMR. */
  rmrManual?: number;
  /** Physical Activity Level factor (1.2-2.5). */
  activityLevel: number;
  /** Thermic Effect of Food percentage override (0-30 %). */
  tefPct?: number;
  goal: Goal;
  /** Positive for surplus, negative for deficit (kcal/day). */
  deficitSurplusKcal?: number;
  /** Required before a nutrition plan can be calculated. */
  dietStyle?: DietStyle;
  /** Free-text allergens or restrictions (lower-case). */
  allergies: string[];
  /** Optional custom macro overrides in grams. */
  customMacros?: CustomMacros;
  /** Preferred unit system for UI display only. */
  unitPreference: 'metric' | 'imperial';
  /** Workout timing for meal timing guidance. */
  workoutTime?: 'am' | 'pm';
  /** Sleep duration in hours for lifestyle guidance. */
  sleepHours?: number;
  /** Stress level on 1-3 scale for lifestyle guidance. */
  stressLevel?: 1 | 2 | 3;
}
