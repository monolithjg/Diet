import type { GuidanceMessage } from '../../macros';
import type { Goal } from '../../../models/UserInput';
import type { PalKey } from '../../tdee';

/**
 * Workout timing options
 */
export type WorkoutTime = 'am' | 'pm';

/**
 * Context for meal timing recommendations
 */
export interface MealTimingContext {
  goal: Goal;
  workoutTime?: WorkoutTime;
  palFactor: PalKey;
  proteinG: number;
  carbG: number;
  targetKcal: number;
  weightKg: number;
  bodyFatPct?: number;
}

/**
 * Calculate carbohydrate recommendations based on body weight and goal
 */
function calculateCarbRecommendations(weightKg: number, goal: Goal, bodyFatPct?: number) {
  const preWorkoutCarbs = goal === 'gain' ? Math.round(0.5 * weightKg) : 0;
  
  let postWorkoutCarbs = 0;
  if (goal === 'gain') {
    postWorkoutCarbs = Math.round(1.0 * weightKg);
  } else if (goal === 'loss') {
    // Only recommend carbs if body fat is less than 15%
    if (bodyFatPct !== undefined && bodyFatPct < 15) {
      postWorkoutCarbs = Math.round(0.5 * weightKg);
    }
  }
  
  return { preWorkoutCarbs, postWorkoutCarbs };
}

/**
 * Calculate protein recommendations based on goal and body weight
 */
function calculateProteinRecommendations(weightKg: number, goal: Goal) {
  const baseProtein = Math.round(0.3 * weightKg); // ~20-30g for most people
  
  const preWorkoutProtein = goal === 'gain' ? Math.max(20, baseProtein) : Math.max(15, Math.round(0.25 * weightKg));
  const postWorkoutProtein = goal === 'gain' ? Math.max(25, Math.round(0.4 * weightKg)) : 20;
  
  return { preWorkoutProtein, postWorkoutProtein };
}

/**
 * Generate meal timing guidance based on goal and workout schedule
 * 
 * Rules:
 * - Muscle gain: 20-30g protein + 0.5g/kg carbs 60min pre-workout
 * - Muscle gain: 20-40g protein + 1g/kg carbs within 2h post-workout
 * - Fat loss: A small protein-containing meal based on tolerance
 * - Fat loss: Protein plus carbohydrates based on training demands
 * - Maintenance: Light mixed meal pre/post
 * - Meal frequency follows preference and adherence
 */
export function generateMealTimingGuidance(ctx: MealTimingContext): GuidanceMessage[] {
  const guidance: GuidanceMessage[] = [];
  
  // Only generate guidance if workout time is specified
  if (!ctx.workoutTime) {
    return guidance;
  }
  
  // Calculate recommendations based on body weight and composition
  const { preWorkoutCarbs, postWorkoutCarbs } = calculateCarbRecommendations(ctx.weightKg, ctx.goal, ctx.bodyFatPct);
  const { preWorkoutProtein, postWorkoutProtein } = calculateProteinRecommendations(ctx.weightKg, ctx.goal);
  
  // Pre-workout guidance
  if (ctx.goal === 'gain') {
    guidance.push({
      key: 'guidance.mealTiming.preWorkoutMuscleGain',
      type: 'info',
      category: 'mealTiming',
      replacements: {
        protein: preWorkoutProtein,
        carbs: preWorkoutCarbs,
        timing: ctx.workoutTime === 'am' ? '45' : '60',
        window: ctx.workoutTime === 'am' ? '45-60' : '60-90'
      }
    });
  } else if (ctx.goal === 'loss') {
    guidance.push({
      key: 'guidance.mealTiming.preWorkoutFatLoss',
      type: 'info',
      category: 'mealTiming',
      replacements: {
        protein: preWorkoutProtein,
        timing: '30-90'
      }
    });
  } else {
    guidance.push({
      key: 'guidance.mealTiming.preWorkoutMaintenance',
      type: 'info',
      category: 'mealTiming',
      replacements: {
        recommendation: 'light mixed meal 45-60 minutes before training'
      }
    });
  }
  
  // Post-workout guidance
  if (ctx.goal === 'gain') {
    guidance.push({
      key: 'guidance.mealTiming.postWorkoutMuscleGain',
      type: 'info',
      category: 'mealTiming',
      replacements: {
        protein: postWorkoutProtein,
        carbs: postWorkoutCarbs,
        window: '2'
      }
    });
  } else if (ctx.goal === 'loss') {
    if (postWorkoutCarbs > 0) {
      guidance.push({
        key: 'guidance.mealTiming.postWorkoutFatLossLean',
        type: 'info',
        category: 'mealTiming',
        replacements: {
          protein: postWorkoutProtein,
          carbs: postWorkoutCarbs,
          bodyFat: ctx.bodyFatPct?.toFixed(1) || 'low'
        }
      });
    } else {
      guidance.push({
        key: 'guidance.mealTiming.postWorkoutFatLossGeneral',
        type: 'info',
        category: 'mealTiming',
        replacements: {
          protein: postWorkoutProtein
        }
      });
    }
  } else {
    guidance.push({
      key: 'guidance.mealTiming.postWorkoutMaintenance',
      type: 'info',
      category: 'mealTiming',
      replacements: {
        recommendation: 'balanced meal within 2 hours of training'
      }
    });
  }
  
  // Daily meal frequency guidance
  if (ctx.goal === 'gain') {
    guidance.push({
      key: 'guidance.mealTiming.frequencyMuscleGain',
      type: 'info',
      category: 'mealTiming',
      replacements: {
        meals: '4-6',
        reason: 'support muscle protein synthesis and energy needs'
      }
    });
  } else if (ctx.goal === 'loss') {
    guidance.push({
      key: 'guidance.mealTiming.frequencyFatLossRegular',
      type: 'info',
      category: 'mealTiming',
      replacements: {
        meals: 'a schedule you can repeat',
        reason: 'adherence, hunger control, and training quality'
      }
    });
  } else {
    guidance.push({
      key: 'guidance.mealTiming.frequencyMaintenance',
      type: 'info',
      category: 'mealTiming',
      replacements: {
        meals: '3-5',
        flexibility: 'based on personal preference and schedule'
      }
    });
  }
  
  // Additional timing optimization for AM workouts
  if (ctx.workoutTime === 'am' && (ctx.goal === 'gain' || ctx.goal === 'maintain')) {
    guidance.push({
      key: 'guidance.mealTiming.earlyWorkoutOptimization',
      type: 'info',
      category: 'mealTiming',
      replacements: {
        timing: 'within 30 minutes of waking',
        content: `${preWorkoutProtein}g protein`,
        postTiming: 'substantial breakfast within 1 hour post-workout'
      }
    });
  }
  
  return guidance;
}
