import type { GuidanceMessage } from '../macros';
import type { MacroOutput } from '../macros';
import type { PalKey } from '../tdee';
import type { DietKey } from '../tdee';
import type { Goal } from '../../models/UserInput';
import type { Sex } from '../../models/UserInput';

import { generateMealTimingGuidance, type MealTimingContext, type WorkoutTime } from './rules/mealTiming';
import { generateMicronutrientGuidance, type MicronutrientContext } from './rules/micronutrients';
import { generateHydrationGuidance, type HydrationContext } from './rules/hydration';
import { generateAllergySwapGuidance, type AllergySwapContext } from './rules/allergySwap';
import { generateLifestyleGuidance as generateLifestyleRules, type LifestyleContext } from './rules/lifestyle';

/**
 * Lifestyle factors for contextual guidance
 */
export interface LifestyleFactors {
  sleepHours?: number;
  stressLevel?: 1 | 2 | 3; // Simple Likert scale
}

/**
 * Context interface for the Contextual Guidance Engine
 */
export interface CGEContext {
  macros: MacroOutput;
  tdee: number;
  pal: PalKey;
  dietStyle: DietKey;
  allergies: string[];
  goal: Goal;
  sex: Sex;
  age: number;
  weightKg: number;
  workoutTime?: WorkoutTime;
  lifestyle?: LifestyleFactors;
}

/**
 * Input interface for the Contextual Guidance Engine
 */
export interface CGEInput {
  macros: MacroOutput;
  tdee: number;
  pal: PalKey;
  dietStyle: DietKey;
  allergies: string[];
  goal: 'loss' | 'gain' | 'maintain';
  workoutTime?: 'am' | 'pm';
  sleepHours?: number;
  stressLevel?: 1 | 2 | 3;
  /** Optional fields used by certain rules but not part of the public spec */
  weightKg?: number;
  sex?: Sex;
  age?: number;
  bodyFatPct?: number;
}

/**
 * Priority order for guidance message types
 */
const TYPE_PRIORITY: Record<GuidanceMessage['type'], number> = {
  critical: 3,
  warn: 2,
  info: 1
};

/**
 * Maximum number of guidance messages to show
 */
const MAX_GUIDANCE_MESSAGES = 5;

/**
 * Generate lifestyle guidance based on sleep and stress factors
 */
function generateLifestyleGuidance(ctx: CGEContext): GuidanceMessage[] {
  if (!ctx.lifestyle) {
    return [];
  }
  
  const lifestyleCtx: LifestyleContext = {
    sleepHours: ctx.lifestyle.sleepHours,
    stressLevel: ctx.lifestyle.stressLevel,
    goal: ctx.goal
  };
  
  return generateLifestyleRules(lifestyleCtx);
}

/**
 * Deduplicate guidance messages by keeping the highest priority version of each key
 */
function deduplicateGuidance(messages: GuidanceMessage[]): GuidanceMessage[] {
  const messageMap = new Map<string, GuidanceMessage>();
  
  for (const message of messages) {
    const existing = messageMap.get(message.key);
    
    if (!existing || TYPE_PRIORITY[message.type] > TYPE_PRIORITY[existing.type]) {
      messageMap.set(message.key, message);
    }
  }
  
  return Array.from(messageMap.values());
}

/**
 * Sort guidance messages by priority (critical > warn > info)
 */
function sortByPriority(messages: GuidanceMessage[]): GuidanceMessage[] {
  return [...messages].sort((a, b) => TYPE_PRIORITY[b.type] - TYPE_PRIORITY[a.type]);
}

/**
 * Add medical disclaimer if any guidance messages are present
 */
function addMedicalDisclaimer(messages: GuidanceMessage[]): GuidanceMessage[] {
  if (messages.length === 0) {
    return messages;
  }
  
  // Add disclaimer as the last message
  return [
    ...messages,
    {
      key: 'disclaimer.medical',
      type: 'info',
      category: 'validation',
      replacements: {
        text: 'This information is educational and not a substitute for professional medical advice.'
      }
    }
  ];
}

/**
 * Main function to generate contextual guidance
 * 
 * Orchestrates all rule modules and applies priority/deduplication logic
 */
export function generateContextualGuidance(input: CGEInput): GuidanceMessage[] {
  // Defensive: If macros or required macro fields are missing, return empty guidance
  if (!input.macros || typeof input.macros.proteinG !== 'number' || typeof input.macros.fatG !== 'number' || typeof input.macros.carbG !== 'number') {
    return [
      {
        key: 'guidance.missingMacros',
        type: 'warn',
        category: 'validation',
        replacements: { text: 'Macronutrient data is incomplete or missing.' }
      }
    ];
  }
  // Map the spec-compliant input into the richer internal context used by rule modules
  const ctx: CGEContext = {
    macros: input.macros,
    tdee: input.tdee,
    pal: input.pal,
    dietStyle: input.dietStyle,
    allergies: input.allergies,
    goal: input.goal,
    workoutTime: input.workoutTime,
    lifestyle: {
      sleepHours: input.sleepHours,
      stressLevel: input.stressLevel
    },
    // Optional metadata (not required by public spec)
    weightKg: input.weightKg ?? 0,
    sex: (input.sex ?? 'male') as Sex,
    age: input.age ?? 0
  };
  const allGuidance: GuidanceMessage[] = [];
  
  // Generate meal timing guidance
  if (ctx.workoutTime) {
    const mealTimingCtx: MealTimingContext = {
      goal: ctx.goal,
      workoutTime: ctx.workoutTime,
      palFactor: ctx.pal,
      proteinG: ctx.macros.proteinG,
      carbG: ctx.macros.carbG,
      targetKcal: ctx.tdee,
      weightKg: ctx.weightKg,
      bodyFatPct: input.bodyFatPct
    };
    allGuidance.push(...generateMealTimingGuidance(mealTimingCtx));
  }
  
  // Generate micronutrient guidance
  const micronutrientCtx: MicronutrientContext = {
    dietStyle: ctx.dietStyle,
    sex: ctx.sex,
    age: ctx.age
  };
  allGuidance.push(...generateMicronutrientGuidance(micronutrientCtx));
  
  // Generate hydration guidance
  if (ctx.weightKg && ctx.weightKg > 0) {
    const hydrationCtx: HydrationContext = {
      weightKg: ctx.weightKg,
      palFactor: ctx.pal,
      targetKcal: ctx.tdee
    };
    allGuidance.push(...generateHydrationGuidance(hydrationCtx));
  }
  
  // Generate allergy swap guidance
  if (ctx.allergies.length > 0) {
    const allergySwapCtx: AllergySwapContext = {
      allergies: ctx.allergies,
      dietStyle: ctx.dietStyle,
      proteinG: ctx.macros.proteinG,
      fatG: ctx.macros.fatG,
      carbG: ctx.macros.carbG
    };
    allGuidance.push(...generateAllergySwapGuidance(allergySwapCtx));
  }
  
  // Generate lifestyle guidance
  allGuidance.push(...generateLifestyleGuidance(ctx));
  
  // Apply deduplication (same key → keep highest priority)
  const deduplicatedGuidance = deduplicateGuidance(allGuidance);
  
  // Sort by priority
  const sortedGuidance = sortByPriority(deduplicatedGuidance);
  
  // Limit to maximum messages
  const limitedGuidance = sortedGuidance.slice(0, MAX_GUIDANCE_MESSAGES);
  
  // Add medical disclaimer if any guidance is present
  const finalGuidance = addMedicalDisclaimer(limitedGuidance);
  
  return finalGuidance;
}

/**
 * Merge validation guidance from macro engine with contextual guidance from CGE
 */
export function mergeGuidance(
  validationGuidance: GuidanceMessage[],
  contextualGuidance: GuidanceMessage[]
): GuidanceMessage[] {
  const allGuidance = [...validationGuidance, ...contextualGuidance];
  
  // Apply deduplication and priority sorting
  const deduplicatedGuidance = deduplicateGuidance(allGuidance);
  const sortedGuidance = sortByPriority(deduplicatedGuidance);
  
  // Limit to maximum messages (excluding medical disclaimer)
  const guidanceWithoutDisclaimer = sortedGuidance.filter(msg => msg.key !== 'disclaimer.medical');
  const limitedGuidance = guidanceWithoutDisclaimer.slice(0, MAX_GUIDANCE_MESSAGES);
  
  // Add disclaimer if we have any guidance
  return addMedicalDisclaimer(limitedGuidance);
} 