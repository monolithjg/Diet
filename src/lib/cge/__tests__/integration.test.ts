import { describe, it, expect } from 'vitest';
import { generateContextualGuidance } from '../engine';
import type { MacroOutput } from '../../macros';

describe('CGE Integration Tests - Meal Timing', () => {
  const baseMacros: MacroOutput = {
    proteinG: 150,
    fatG: 80,
    carbG: 200,
    proteinPct: 0.2,
    fatPct: 0.3,
    carbPct: 0.5,
    guidance: []
  };

  describe('Full Engine Integration', () => {
    it('MT-1: should generate meal timing guidance through full CGE engine for muscle gain AM workout', () => {
      const input = {
        macros: baseMacros,
        tdee: 2500,
        pal: 'moderate' as const,
        dietStyle: 'balanced' as const,
        allergies: [],
        goal: 'gain' as const,
        workoutTime: 'am' as const,
        weightKg: 80,
        bodyFatPct: 12
      };

      const result = generateContextualGuidance(input);
      
      // Should have meal timing messages
      const mealTimingMessages = result.filter(msg => msg.category === 'mealTiming');
      expect(mealTimingMessages.length).toBeGreaterThan(0);
      
      // Check for key message types
      const keys = mealTimingMessages.map(msg => msg.key);
      expect(keys).toContain('guidance.mealTiming.preWorkoutMuscleGain');
      expect(keys).toContain('guidance.mealTiming.postWorkoutMuscleGain');
      expect(keys).toContain('guidance.mealTiming.frequencyMuscleGain');
      expect(keys).toContain('guidance.mealTiming.earlyWorkoutOptimization');
      
      // Verify calculations are passed through correctly
      const preWorkout = mealTimingMessages.find(msg => msg.key === 'guidance.mealTiming.preWorkoutMuscleGain');
      expect(preWorkout?.replacements?.protein).toBe(24); // Math.max(20, Math.round(0.3 * 80))
      expect(preWorkout?.replacements?.carbs).toBe(40); // Math.round(0.5 * 80)
    });

    it('should generate appropriate guidance for fat loss with body fat integration', () => {
      const input = {
        macros: baseMacros,
        tdee: 1800,
        pal: 'moderate' as const,
        dietStyle: 'balanced' as const,
        allergies: [],
        goal: 'loss' as const,
        workoutTime: 'pm' as const,
        weightKg: 70,
        bodyFatPct: 12 // <15% should get carbs
      };

      const result = generateContextualGuidance(input);
      
      const mealTimingMessages = result.filter(msg => msg.category === 'mealTiming');
      expect(mealTimingMessages.length).toBe(3);
      
      // Should recommend carbs for low body fat
      const postWorkout = mealTimingMessages.find(msg => msg.key === 'guidance.mealTiming.postWorkoutFatLossLean');
      expect(postWorkout).toBeDefined();
      expect(postWorkout?.replacements?.carbs).toBe(35); // Math.round(0.5 * 70)
      
      // Should recommend IF for PM workout
      const frequency = mealTimingMessages.find(msg => msg.key === 'guidance.mealTiming.frequencyFatLossIF');
      expect(frequency).toBeDefined();
    });

    it('should not generate meal timing guidance when workoutTime is not provided', () => {
      const input = {
        macros: baseMacros,
        tdee: 2200,
        pal: 'moderate' as const,
        dietStyle: 'balanced' as const,
        allergies: [],
        goal: 'maintain' as const,
        // workoutTime not provided
        weightKg: 75
      };

      const result = generateContextualGuidance(input);
      
      const mealTimingMessages = result.filter(msg => msg.category === 'mealTiming');
      expect(mealTimingMessages).toHaveLength(0);
    });

    it('should include medical disclaimer when meal timing guidance is generated', () => {
      const input = {
        macros: baseMacros,
        tdee: 2500,
        pal: 'moderate' as const,
        dietStyle: 'balanced' as const,
        allergies: [],
        goal: 'gain' as const,
        workoutTime: 'am' as const,
        weightKg: 80
      };

      const result = generateContextualGuidance(input);
      
      // Should have medical disclaimer
      const disclaimer = result.find(msg => msg.key === 'disclaimer.medical');
      expect(disclaimer).toBeDefined();
      expect(disclaimer?.type).toBe('info');
      expect(disclaimer?.category).toBe('validation');
    });

    it('should respect max 5 messages limit including meal timing', () => {
      const input = {
        macros: baseMacros,
        tdee: 2500,
        pal: 'veryActive' as const,
        dietStyle: 'vegan' as const,
        allergies: ['peanut', 'dairy'],
        goal: 'gain' as const,
        workoutTime: 'am' as const,
        sleepHours: 5, // should trigger sleep guidance
        stressLevel: 3 as const, // should trigger stress guidance
        weightKg: 80,
        sex: 'female' as const,
        age: 25
      };

      const result = generateContextualGuidance(input);
      
      // Should not exceed 5 messages (excluding disclaimer)
      const guidanceMessages = result.filter(msg => msg.key !== 'disclaimer.medical');
      expect(guidanceMessages.length).toBeLessThanOrEqual(5);
      
      // Should still have meal timing in the mix
      const hasMealTiming = result.some(msg => msg.category === 'mealTiming');
      expect(hasMealTiming).toBe(true);
    });
  });
}); 