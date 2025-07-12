import type { DietStyle } from '../models/UserInput';

export interface DietPreset {
  /** Percentage of calories from protein (0–100). */
  proteinPct: number;
  /** Percentage of calories from fat (0–100). */
  fatPct: number;
  /** Percentage of calories from carbohydrates (optional if carbMaxG used). */
  carbPct?: number;
  /** Absolute carbohydrate ceiling in grams (e.g., keto ≤50 g). */
  carbMaxG?: number;
}

export const DIET_PRESETS: Record<DietStyle, DietPreset> = {
  balanced: { proteinPct: 20, fatPct: 30, carbPct: 50 },
  highProtein: { proteinPct: 30, fatPct: 25, carbPct: 45 },
  lowCarb: { proteinPct: 25, fatPct: 40, carbPct: 35 },
  keto: { proteinPct: 20, fatPct: 70, carbPct: 10, carbMaxG: 50 },
  vegan: { proteinPct: 25, fatPct: 30, carbPct: 45 },
  vegetarian: { proteinPct: 22, fatPct: 28, carbPct: 50 },
  paleo: { proteinPct: 25, fatPct: 35, carbPct: 40 },
  mediterranean: { proteinPct: 20, fatPct: 35, carbPct: 45 },
}; 