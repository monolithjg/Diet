/**
 * Metrics calculated from the raw UserInput before any goal adjustments.
 */
export interface DerivedMetrics {
  /** Resting / Basal Metabolic Rate (kcal/day). */
  rmr: number;
  /** Which formula produced the RMR value. */
  formulaUsed: 'mifflin' | 'katch' | 'cunningham' | 'manual';
  /** Physical Activity Level multiplier actually used. */
  palFactor: number;
  /** Thermic Effect of Food contribution (kcal/day). */
  tef: number;
  /** Maintenance Total Daily Energy Expenditure (kcal/day) BEFORE goal adjustment. */
  tdee: number;
} 