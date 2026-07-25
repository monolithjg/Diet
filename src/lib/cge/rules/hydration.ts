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
 * - Starting range: 30-35ml/kg body weight
 * - Activity adjustment is a prompt to account for sweat, not a prescription
 * - Climate considerations (future enhancement)
 */
export function generateHydrationGuidance(ctx: HydrationContext): GuidanceMessage[] {
  const guidance: GuidanceMessage[] = [];
  
  // Skip if weight is not provided
  if (!ctx.weightKg) {
    return guidance;
  }
  
  const baseLowL = Math.round((ctx.weightKg * 30 / 1000) * 10) / 10;
  const baseHighL = Math.round((ctx.weightKg * 35 / 1000) * 10) / 10;
  
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
  
  const activityHighL = Math.round((baseHighL + additionalMl / 1000) * 10) / 10;
  
  // Base hydration guidance
  guidance.push({
    key: 'guidance.hydration.dailyTarget',
    type: 'info',
    category: 'hydration',
    replacements: {
      target: `${baseLowL}-${activityHighL}L`,
      reason: activityLevel,
      // Structured values retained for analytics and non-display consumers.
      base: baseHighL,
      total: activityHighL,
      additional: additionalMl
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
        timing: 'based on workout duration, climate, and measured sweat loss'
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
