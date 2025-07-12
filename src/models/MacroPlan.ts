/**
 * Final calorie and macronutrient targets after applying the user's goal
 * (deficit, surplus, or maintenance).
 */
export interface MacroPlan {
  /** Goal-adjusted calorie target (kcal/day). */
  targetCalories: number;

  // Macros in grams per day
  proteinG: number;
  fatG: number;
  carbsG: number;

  // Macros as % of total calories
  proteinPct: number;
  fatPct: number;
  carbPct: number;

  /** Optional contextual guidance or warnings surfaced to the UI. */
  notes?: string[];
} 