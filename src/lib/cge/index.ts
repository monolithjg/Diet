// Main engine exports
export { generateContextualGuidance, mergeGuidance } from './engine';
export type { CGEContext, CGEInput, LifestyleFactors } from './engine';

// Rule module exports
export { generateMealTimingGuidance } from './rules/mealTiming';
export type { MealTimingContext, WorkoutTime } from './rules/mealTiming';

export { generateMicronutrientGuidance } from './rules/micronutrients';
export type { MicronutrientContext } from './rules/micronutrients';

export { generateHydrationGuidance } from './rules/hydration';
export type { HydrationContext } from './rules/hydration';

export { generateAllergySwapGuidance } from './rules/allergySwap';
export type { AllergySwapContext } from './rules/allergySwap'; 