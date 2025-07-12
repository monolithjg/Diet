import type { GuidanceMessage } from '../../macros';
import type { PalKey } from '../../tdee';

/**
 * Context for hydration recommendations
 */
export interface HydrationContext {
  weightKg?: number;
  palFactor: PalKey;
  targetKcal: number;
}

/**
 * Generate hydration guidance based on body weight and activity level
 * 
 * Rules:
 * - Base hydration: 35ml/kg body weight
 * - Activity adjustment: +500ml on training days
 * - Climate considerations (future enhancement)
 */
export function generateHydrationGuidance(ctx: HydrationContext): GuidanceMessage[] {
  const guidance: GuidanceMessage[] = [];
  
  // Skip if weight is not provided
  if (!ctx.weightKg) {
    return guidance;
  }
  
  // Calculate base hydration needs (35ml/kg)
  const baseHydrationMl = Math.round(ctx.weightKg * 35);
  const baseHydrationL = Math.round((baseHydrationMl / 1000) * 10) / 10; // Round to 1 decimal
  
  // Activity-based adjustments
  let additionalMl = 0;
  let activityLevel = '';
  
  switch (ctx.palFactor) {
    case 'sedentary':
    case 'light':
      additionalMl = 0;
      activityLevel = 'low activity';
      break;
    case 'moderate':
      additionalMl = 500;
      activityLevel = 'moderate training';
      break;
    case 'active':
    case 'veryActive':
      additionalMl = 750;
      activityLevel = 'high training volume';
      break;
  }
  
  const totalHydrationMl = baseHydrationMl + additionalMl;
  const totalHydrationL = Math.round((totalHydrationMl / 1000) * 10) / 10;
  
  // Base hydration guidance
  guidance.push({
    key: 'guidance.hydration.dailyTarget',
    type: 'info',
    category: 'hydration',
    replacements: {
      total: totalHydrationL,
      base: baseHydrationL,
      additional: additionalMl,
      reason: activityLevel
    }
  });
  
  // Training day specific guidance
  if (additionalMl > 0) {
    guidance.push({
      key: 'guidance.hydration.trainingExtra',
      type: 'info',
      category: 'hydration',
      replacements: {
        amount: additionalMl,
        timing: 'during and post-workout'
      }
    });
  }
  
  // Electrolyte guidance for high activity
  if (ctx.palFactor === 'active' || ctx.palFactor === 'veryActive') {
    guidance.push({
      key: 'guidance.hydration.electrolytesConsider',
      type: 'info',
      category: 'hydration',
      replacements: {
        reason: 'high training volume and sweat loss'
      }
    });
  }
  
  return guidance;
} 