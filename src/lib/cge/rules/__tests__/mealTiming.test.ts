import { describe, it, expect } from 'vitest';
import { generateMealTimingGuidance, type MealTimingContext } from '../mealTiming';

describe('generateMealTimingGuidance', () => {

  describe('No workout time specified', () => {
    it('should return empty guidance when workoutTime is undefined', () => {
      const ctx: MealTimingContext = {
        goal: 'gain',
        workoutTime: undefined,
        palFactor: 'moderate',
        proteinG: 150,
        carbG: 200,
        targetKcal: 2500,
        weightKg: 80
      };

      const result = generateMealTimingGuidance(ctx);
      expect(result).toEqual([]);
    });
  });

  describe('Muscle gain scenarios', () => {
    it('MT-1: should generate appropriate guidance for muscle gain AM workout', () => {
      const ctx: MealTimingContext = {
        goal: 'gain',
        workoutTime: 'am',
        palFactor: 'moderate',
        proteinG: 150,
        carbG: 200,
        targetKcal: 2500,
        weightKg: 80,
        bodyFatPct: 12
      };

      const result = generateMealTimingGuidance(ctx);
      
      // Should have 4 guidance messages for muscle gain
      expect(result).toHaveLength(4);
      
      // Check for specific keys that should be present
      const keys = result.map(msg => msg.key);
      expect(keys).toContain('guidance.mealTiming.preWorkoutMuscleGain');
      expect(keys).toContain('guidance.mealTiming.postWorkoutMuscleGain');
      expect(keys).toContain('guidance.mealTiming.frequencyMuscleGain');
      expect(keys).toContain('guidance.mealTiming.earlyWorkoutOptimization');
      
      // Verify calculations are correct
      const preWorkout = result.find(msg => msg.key === 'guidance.mealTiming.preWorkoutMuscleGain');
      expect(preWorkout?.replacements?.protein).toBe(24); // Math.max(20, Math.round(0.3 * 80))
      expect(preWorkout?.replacements?.carbs).toBe(40); // Math.round(0.5 * 80)
      expect(preWorkout?.replacements?.timing).toBe('45'); // AM workout timing
      
      const postWorkout = result.find(msg => msg.key === 'guidance.mealTiming.postWorkoutMuscleGain');
      expect(postWorkout?.replacements?.protein).toBe(32); // Math.max(25, Math.round(0.4 * 80))
      expect(postWorkout?.replacements?.carbs).toBe(80); // Math.round(1.0 * 80)
    });

    it('should generate appropriate guidance for muscle gain PM workout', () => {
      const ctx: MealTimingContext = {
        goal: 'gain',
        workoutTime: 'pm',
        palFactor: 'moderate',
        proteinG: 150,
        carbG: 200,
        targetKcal: 2500,
        weightKg: 80
      };

      const result = generateMealTimingGuidance(ctx);
      
      // Should have 3 guidance messages for PM muscle gain (no early workout optimization)
      expect(result).toHaveLength(3);
      
      const preWorkout = result.find(msg => msg.key === 'guidance.mealTiming.preWorkoutMuscleGain');
      expect(preWorkout?.replacements?.timing).toBe('60'); // PM workout timing
      expect(preWorkout?.replacements?.window).toBe('60-90'); // PM workout window
    });
  });

  describe('Fat loss scenarios', () => {
    it('should generate guidance for fat loss with high body fat (>15%)', () => {
      const ctx: MealTimingContext = {
        goal: 'loss',
        workoutTime: 'am',
        palFactor: 'moderate',
        proteinG: 120,
        carbG: 100,
        targetKcal: 1800,
        weightKg: 75,
        bodyFatPct: 20
      };

      const result = generateMealTimingGuidance(ctx);
      
      expect(result).toHaveLength(3);
      
      // Should not recommend post-workout carbs for high body fat
      const postWorkout = result.find(msg => msg.key === 'guidance.mealTiming.postWorkoutFatLossGeneral');
      expect(postWorkout).toBeDefined();
      expect(postWorkout?.replacements?.protein).toBe(20);
    });

    it('should generate guidance for fat loss with low body fat (<15%)', () => {
      const ctx: MealTimingContext = {
        goal: 'loss',
        workoutTime: 'pm',
        palFactor: 'moderate',
        proteinG: 120,
        carbG: 100,
        targetKcal: 1800,
        weightKg: 70,
        bodyFatPct: 12
      };

      const result = generateMealTimingGuidance(ctx);
      
      expect(result).toHaveLength(3);
      
      // Should recommend post-workout carbs for low body fat
      const postWorkout = result.find(msg => msg.key === 'guidance.mealTiming.postWorkoutFatLossLean');
      expect(postWorkout).toBeDefined();
      expect(postWorkout?.replacements?.protein).toBe(20);
      expect(postWorkout?.replacements?.carbs).toBe(35); // Math.round(0.5 * 70)
      expect(postWorkout?.replacements?.bodyFat).toBe('12.0');
      
      // Meal frequency should follow preference rather than prescribing fasting.
      const frequency = result.find(msg => msg.key === 'guidance.mealTiming.frequencyFatLossRegular');
      expect(frequency).toBeDefined();
      expect(frequency?.replacements?.meals).toBe('a schedule you can repeat');
    });

    it('should generate regular frequency guidance for fat loss AM workout', () => {
      const ctx: MealTimingContext = {
        goal: 'loss',
        workoutTime: 'am',
        palFactor: 'moderate',
        proteinG: 120,
        carbG: 100,
        targetKcal: 1800,
        weightKg: 70,
        bodyFatPct: 12
      };

      const result = generateMealTimingGuidance(ctx);
      
      // Should use regular frequency guidance for AM workouts (not IF)
      const frequency = result.find(msg => msg.key === 'guidance.mealTiming.frequencyFatLossRegular');
      expect(frequency).toBeDefined();
      expect(frequency?.replacements?.meals).toBe('a schedule you can repeat');
    });
  });

  describe('Maintenance scenarios', () => {
    it('should generate guidance for maintenance with AM workout', () => {
      const ctx: MealTimingContext = {
        goal: 'maintain',
        workoutTime: 'am',
        palFactor: 'moderate',
        proteinG: 130,
        carbG: 180,
        targetKcal: 2200,
        weightKg: 75
      };

      const result = generateMealTimingGuidance(ctx);
      
      expect(result).toHaveLength(4); // includes early workout optimization
      
      const keys = result.map(msg => msg.key);
      expect(keys).toContain('guidance.mealTiming.preWorkoutMaintenance');
      expect(keys).toContain('guidance.mealTiming.postWorkoutMaintenance');
      expect(keys).toContain('guidance.mealTiming.frequencyMaintenance');
      expect(keys).toContain('guidance.mealTiming.earlyWorkoutOptimization');
    });

    it('should generate guidance for maintenance with PM workout', () => {
      const ctx: MealTimingContext = {
        goal: 'maintain',
        workoutTime: 'pm',
        palFactor: 'moderate',
        proteinG: 130,
        carbG: 180,
        targetKcal: 2200,
        weightKg: 75
      };

      const result = generateMealTimingGuidance(ctx);
      
      expect(result).toHaveLength(3); // no early workout optimization for PM
      
      const keys = result.map(msg => msg.key);
      expect(keys).toContain('guidance.mealTiming.preWorkoutMaintenance');
      expect(keys).toContain('guidance.mealTiming.postWorkoutMaintenance');
      expect(keys).toContain('guidance.mealTiming.frequencyMaintenance');
      expect(keys).not.toContain('guidance.mealTiming.earlyWorkoutOptimization');
    });
  });

  describe('Edge cases and calculations', () => {
    it('should handle very light individuals (50kg)', () => {
      const ctx: MealTimingContext = {
        goal: 'gain',
        workoutTime: 'pm',
        palFactor: 'moderate',
        proteinG: 100,
        carbG: 150,
        targetKcal: 1800,
        weightKg: 50
      };

      const result = generateMealTimingGuidance(ctx);
      
      const preWorkout = result.find(msg => msg.key === 'guidance.mealTiming.preWorkoutMuscleGain');
      expect(preWorkout?.replacements?.protein).toBe(20); // Math.max(20, 15)
      expect(preWorkout?.replacements?.carbs).toBe(25); // Math.round(0.5 * 50)
      
      const postWorkout = result.find(msg => msg.key === 'guidance.mealTiming.postWorkoutMuscleGain');
      expect(postWorkout?.replacements?.protein).toBe(25); // Math.max(25, 20)
      expect(postWorkout?.replacements?.carbs).toBe(50); // Math.round(1.0 * 50)
    });

    it('should handle very heavy individuals (120kg)', () => {
      const ctx: MealTimingContext = {
        goal: 'gain',
        workoutTime: 'pm',
        palFactor: 'moderate',
        proteinG: 200,
        carbG: 300,
        targetKcal: 3500,
        weightKg: 120
      };

      const result = generateMealTimingGuidance(ctx);
      
      const preWorkout = result.find(msg => msg.key === 'guidance.mealTiming.preWorkoutMuscleGain');
      expect(preWorkout?.replacements?.protein).toBe(36); // Math.max(20, Math.round(0.3 * 120))
      expect(preWorkout?.replacements?.carbs).toBe(60); // Math.round(0.5 * 120)
      
      const postWorkout = result.find(msg => msg.key === 'guidance.mealTiming.postWorkoutMuscleGain');
      expect(postWorkout?.replacements?.protein).toBe(48); // Math.max(25, Math.round(0.4 * 120))
      expect(postWorkout?.replacements?.carbs).toBe(120); // Math.round(1.0 * 120)
    });

    it('should handle fat loss without body fat percentage', () => {
      const ctx: MealTimingContext = {
        goal: 'loss',
        workoutTime: 'pm',
        palFactor: 'moderate',
        proteinG: 120,
        carbG: 100,
        targetKcal: 1800,
        weightKg: 70
        // bodyFatPct is undefined
      };

      const result = generateMealTimingGuidance(ctx);
      
      // Should use general fat loss guidance when body fat is unknown
      const postWorkout = result.find(msg => msg.key === 'guidance.mealTiming.postWorkoutFatLossGeneral');
      expect(postWorkout).toBeDefined();
      expect(postWorkout?.replacements?.protein).toBe(20);
    });

    it('should ensure all messages have correct category and type', () => {
      const ctx: MealTimingContext = {
        goal: 'gain',
        workoutTime: 'am',
        palFactor: 'moderate',
        proteinG: 150,
        carbG: 200,
        targetKcal: 2500,
        weightKg: 80
      };

      const result = generateMealTimingGuidance(ctx);
      
      // All messages should be info type and mealTiming category
      result.forEach(message => {
        expect(message.type).toBe('info');
        expect(message.category).toBe('mealTiming');
        expect(message.key).toMatch(/^guidance\.mealTiming\./);
      });
    });
  });

  describe('Helper function tests', () => {
    // Testing the internal calculation functions indirectly through results
    it('should calculate protein recommendations correctly for different goals', () => {
      const gainCtx: MealTimingContext = {
        goal: 'gain',
        workoutTime: 'pm',
        palFactor: 'moderate',
        proteinG: 150,
        carbG: 200,
        targetKcal: 2500,
        weightKg: 80
      };

      const lossCtx: MealTimingContext = {
        goal: 'loss',
        workoutTime: 'pm',
        palFactor: 'moderate',
        proteinG: 120,
        carbG: 100,
        targetKcal: 1800,
        weightKg: 80,
        bodyFatPct: 20
      };

      const gainResult = generateMealTimingGuidance(gainCtx);
      const lossResult = generateMealTimingGuidance(lossCtx);

      const gainPreWorkout = gainResult.find(msg => msg.key === 'guidance.mealTiming.preWorkoutMuscleGain');
      const lossPreWorkout = lossResult.find(msg => msg.key === 'guidance.mealTiming.preWorkoutFatLoss');

      // Gain should have higher pre-workout protein
      expect(gainPreWorkout?.replacements?.protein).toBeGreaterThan(lossPreWorkout?.replacements?.protein as number);
    });
  });
});
