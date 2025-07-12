import type { GuidanceMessage } from '../../macros';
import type { Goal } from '../../../models/UserInput';

/**
 * Context for lifestyle guidance
 */
export interface LifestyleContext {
  sleepHours?: number;
  stressLevel?: 1 | 2 | 3; // Simple Likert scale
  goal: Goal;
}

/**
 * Generate lifestyle guidance based on sleep and stress factors
 * 
 * Rules:
 * - Sleep < 6 hours: warn-level guidance with goal-specific impact
 * - Stress level >= 3: info-level guidance about cortisol/recovery
 * - Goal-contextual messaging for different impacts
 */
export function generateLifestyleGuidance(ctx: LifestyleContext): GuidanceMessage[] {
  const guidance: GuidanceMessage[] = [];
  
  // Sleep guidance
  if (ctx.sleepHours !== undefined && ctx.sleepHours < 6) {
    guidance.push({
      key: 'guidance.lifestyle.sleepLow',
      type: 'warn',
      category: 'lifestyle',
      replacements: {
        current: ctx.sleepHours,
        target: '7-9',
        impact: ctx.goal === 'loss' ? 'fat loss' : 'muscle gain'
      }
    });
  }
  
  // Stress guidance
  if (ctx.stressLevel !== undefined && ctx.stressLevel >= 3) {
    guidance.push({
      key: 'guidance.lifestyle.stressHigh',
      type: 'info',
      category: 'lifestyle',
      replacements: {
        impact: 'cortisol levels and recovery'
      }
    });
  }
  
  return guidance;
} 