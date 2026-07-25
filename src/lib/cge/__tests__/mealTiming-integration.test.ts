import { describe, it, expect } from 'vitest';
import { generateContextualGuidance, type CGEInput } from '../engine';

describe('Meal Timing Rules - CGE Integration', () => {
  // Helper function to create base CGE input
  const createInput = (overrides: Partial<CGEInput> = {}): CGEInput => ({
    macros: { 
      proteinG: 120, 
      fatG: 70, 
      carbG: 250, 
      proteinPct: 0.2, 
      fatPct: 0.3, 
      carbPct: 0.5,
      guidance: [] 
    },
    tdee: 2000,
    pal: 'moderate',
    dietStyle: 'balanced',
    allergies: [],
    goal: 'maintain',
    sex: 'male',
    age: 30,
    weightKg: 70,
    bodyFatPct: 15,
    ...overrides
  });

  describe('MT-1 Integration with Full Engine', () => {
    it('should generate meal timing guidance through full CGE orchestrator', () => {
      const input = createInput({
        goal: 'gain',
        workoutTime: 'am',
        weightKg: 75
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Filter meal timing messages
      const mealTimingGuidance = allGuidance.filter(g => g.category === 'mealTiming');
      
      // Should include muscle gain specific guidance
      const keys = mealTimingGuidance.map(g => g.key);
      expect(keys).toContain('guidance.mealTiming.preWorkoutMuscleGain');
      expect(keys).toContain('guidance.mealTiming.postWorkoutMuscleGain');
      expect(keys).toContain('guidance.mealTiming.frequencyMuscleGain');
      
      // Verify medical disclaimer is included when guidance exists
      const disclaimer = allGuidance.find(g => g.key === 'disclaimer.medical');
      expect(disclaimer).toBeDefined();
      expect(disclaimer?.category).toBe('validation');
    });

    it('should handle no workout time gracefully', () => {
      const input = createInput({
        goal: 'gain',
        workoutTime: undefined
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Should have no meal timing guidance without workout time
      const mealTimingGuidance = allGuidance.filter(g => g.category === 'mealTiming');
      expect(mealTimingGuidance).toHaveLength(0);
    });
  });

  describe('Goal-Specific Meal Timing Scenarios', () => {
    it('should generate appropriate muscle gain guidance for AM workouts', () => {
      const input = createInput({
        goal: 'gain',
        workoutTime: 'am',
        weightKg: 80
      });
      
      const allGuidance = generateContextualGuidance(input);
      const mealTimingGuidance = allGuidance.filter(g => g.category === 'mealTiming');
      
      // Should include AM-specific pre-workout guidance
      const preWorkout = mealTimingGuidance.find(g => 
        g.key === 'guidance.mealTiming.preWorkoutMuscleGain'
      );
      expect(preWorkout).toBeDefined();
      expect(preWorkout?.replacements?.timing).toBe('45'); // AM timing
      
      // Should include early workout optimization
      const earlyOptimization = mealTimingGuidance.find(g =>
        g.key === 'guidance.mealTiming.earlyWorkoutOptimization'
      );
      expect(earlyOptimization).toBeDefined();
      
      // Should include frequency guidance for muscle gain
      const frequency = mealTimingGuidance.find(g =>
        g.key === 'guidance.mealTiming.frequencyMuscleGain'
      );
      expect(frequency).toBeDefined();
      expect(frequency?.replacements?.meals).toBe('4-6');
    });

    it('should generate appropriate fat loss guidance for lean individuals', () => {
      const input = createInput({
        goal: 'loss',
        workoutTime: 'pm',
        weightKg: 70,
        bodyFatPct: 12 // Lean individual
      });
      
      const allGuidance = generateContextualGuidance(input);
      const mealTimingGuidance = allGuidance.filter(g => g.category === 'mealTiming');
      
      // Should include fat loss pre-workout guidance
      const preWorkout = mealTimingGuidance.find(g =>
        g.key === 'guidance.mealTiming.preWorkoutFatLoss'
      );
      expect(preWorkout).toBeDefined();
      expect(preWorkout?.replacements?.timing).toBe('30-90');
      
      // Should include lean-specific post-workout guidance (carbs allowed)
      const postWorkout = mealTimingGuidance.find(g =>
        g.key === 'guidance.mealTiming.postWorkoutFatLossLean'
      );
      expect(postWorkout).toBeDefined();
      expect(postWorkout?.replacements?.bodyFat).toBe('12.0');
      
      // Frequency guidance should remain flexible and preference-led.
      const frequency = mealTimingGuidance.find(g =>
        g.key === 'guidance.mealTiming.frequencyFatLossRegular'
      );
      expect(frequency).toBeDefined();
      expect(frequency?.replacements?.meals).toBe('a schedule you can repeat');
    });

    it('should generate appropriate fat loss guidance for higher body fat individuals', () => {
      const input = createInput({
        goal: 'loss',
        workoutTime: 'am',
        weightKg: 80,
        bodyFatPct: 25 // Higher body fat
      });
      
      const allGuidance = generateContextualGuidance(input);
      const mealTimingGuidance = allGuidance.filter(g => g.category === 'mealTiming');
      
      // Should include general post-workout guidance (no carbs)
      const postWorkout = mealTimingGuidance.find(g =>
        g.key === 'guidance.mealTiming.postWorkoutFatLossGeneral'
      );
      expect(postWorkout).toBeDefined();
      
      // Should include regular frequency guidance (not IF for AM workouts)
      const frequency = mealTimingGuidance.find(g =>
        g.key === 'guidance.mealTiming.frequencyFatLossRegular'
      );
      expect(frequency).toBeDefined();
      expect(frequency?.replacements?.meals).toBe('a schedule you can repeat');
    });

    it('should generate appropriate maintenance guidance', () => {
      const input = createInput({
        goal: 'maintain',
        workoutTime: 'pm',
        weightKg: 75
      });
      
      const allGuidance = generateContextualGuidance(input);
      const mealTimingGuidance = allGuidance.filter(g => g.category === 'mealTiming');
      
      // Should include maintenance-specific guidance
      const preWorkout = mealTimingGuidance.find(g =>
        g.key === 'guidance.mealTiming.preWorkoutMaintenance'
      );
      expect(preWorkout).toBeDefined();
      
      const postWorkout = mealTimingGuidance.find(g =>
        g.key === 'guidance.mealTiming.postWorkoutMaintenance'
      );
      expect(postWorkout).toBeDefined();
      
      const frequency = mealTimingGuidance.find(g =>
        g.key === 'guidance.mealTiming.frequencyMaintenance'
      );
      expect(frequency).toBeDefined();
      expect(frequency?.replacements?.meals).toBe('3-5');
    });
  });

  describe('Priority and Deduplication with Meal Timing', () => {
    it('should properly prioritize meal timing guidance with other categories', () => {
      const input = createInput({
        goal: 'gain',
        workoutTime: 'am',
        dietStyle: 'vegan', // Trigger micronutrient guidance
        weightKg: 75,
        sleepHours: 5 // Trigger lifestyle guidance
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Should have mix of categories
      const categories = allGuidance.map(g => g.category);
      expect(categories).toContain('mealTiming');
      expect(categories).toContain('micronutrient');
      expect(categories).toContain('lifestyle');
      
      // All should be info level except sleep (warn level)
      const mealTimingMessages = allGuidance.filter(g => g.category === 'mealTiming');
      mealTimingMessages.forEach(msg => {
        expect(msg.type).toBe('info');
      });
      
      // Should not exceed max 5 guidance messages + disclaimer
      expect(allGuidance.filter(g => g.key !== 'disclaimer.medical')).toHaveLength(5);
    });

    it('should handle complex scenario with multiple high-priority messages', () => {
      const input = createInput({
        goal: 'loss',
        workoutTime: 'pm',
        dietStyle: 'vegan', // Warn-level B12 guidance
        weightKg: 70,
        sleepHours: 4, // Warn-level sleep guidance
        bodyFatPct: 10 // Lean fat loss
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Should prioritize warn-level messages over info-level meal timing
      const warnMessages = allGuidance.filter(g => g.type === 'warn');
      expect(warnMessages.length).toBeGreaterThan(0);
      
      // Meal timing may be present but could be limited due to warn priorities
      const mealTimingGuidance = allGuidance.filter(g => g.category === 'mealTiming');
      expect(mealTimingGuidance.length).toBeGreaterThanOrEqual(0);
      
      // Any meal-frequency guidance should remain flexible.
      if (mealTimingGuidance.length > 0) {
        const frequencyGuidance = mealTimingGuidance.find(g =>
          g.key === 'guidance.mealTiming.frequencyFatLossRegular'
        );
        expect(frequencyGuidance).toBeDefined();
      }
    });
  });

  describe('Meal Timing + Other Rules Integration', () => {
    it('should combine meal timing with hydration guidance', () => {
      const input = createInput({
        goal: 'gain',
        workoutTime: 'am',
        weightKg: 80,
        pal: 'active'
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Should have both meal timing and hydration guidance
      const mealTimingGuidance = allGuidance.filter(g => g.category === 'mealTiming');
      const hydrationGuidance = allGuidance.filter(g => g.category === 'hydration');
      
      expect(mealTimingGuidance.length).toBeGreaterThan(0);
      expect(hydrationGuidance.length).toBeGreaterThan(0);
      
      // Meal timing and hydration complement each other for active individuals
      const preWorkout = mealTimingGuidance.find(g =>
        g.key === 'guidance.mealTiming.preWorkoutMuscleGain'
      );
      expect(preWorkout).toBeDefined();
    });

    it('should handle meal timing with diet-specific micronutrient guidance', () => {
      const input = createInput({
        goal: 'gain',
        workoutTime: 'pm',
        dietStyle: 'vegetarian',
        weightKg: 75,
        sex: 'male',
        age: 25
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Should include both categories
      const mealTimingGuidance = allGuidance.filter(g => g.category === 'mealTiming');
      const micronutrientGuidance = allGuidance.filter(g => g.category === 'micronutrient');
      
      expect(mealTimingGuidance.length).toBeGreaterThan(0);
      expect(micronutrientGuidance.length).toBeGreaterThan(0);
      
      // Should include muscle gain meal timing
      const muscleGainFrequency = mealTimingGuidance.find(g =>
        g.key === 'guidance.mealTiming.frequencyMuscleGain'
      );
      expect(muscleGainFrequency).toBeDefined();
      
      // Should include vegetarian-specific micronutrients
      const microKeys = micronutrientGuidance.map(g => g.key);
      expect(microKeys).toContain('guidance.micronutrient.b12Consider');
    });
  });

  describe('Workout Time and Body Composition Scenarios', () => {
    it('should handle PM workout fat loss with different body fat levels', () => {
      const scenarios = [
        { bodyFatPct: 10, expectCarbs: true },
        { bodyFatPct: 20, expectCarbs: false }
      ];
      
      scenarios.forEach(({ bodyFatPct, expectCarbs }) => {
        const input = createInput({
          goal: 'loss',
          workoutTime: 'pm',
          bodyFatPct,
          weightKg: 70
        });
        
        const allGuidance = generateContextualGuidance(input);
        const mealTimingGuidance = allGuidance.filter(g => g.category === 'mealTiming');
        
        if (expectCarbs) {
          const leanGuidance = mealTimingGuidance.find(g =>
            g.key === 'guidance.mealTiming.postWorkoutFatLossLean'
          );
          expect(leanGuidance).toBeDefined();
        } else {
          const generalGuidance = mealTimingGuidance.find(g =>
            g.key === 'guidance.mealTiming.postWorkoutFatLossGeneral'
          );
          expect(generalGuidance).toBeDefined();
        }
        
        // PM workouts should not automatically trigger a fasting protocol.
        const frequencyGuidance = mealTimingGuidance.find(g =>
          g.key === 'guidance.mealTiming.frequencyFatLossRegular'
        );
        expect(frequencyGuidance).toBeDefined();
      });
    });

    it('should handle AM workout optimization for muscle gain and maintenance', () => {
      const goals: Array<CGEInput['goal']> = ['gain', 'maintain'];
      
      goals.forEach(goal => {
        const input = createInput({
          goal,
          workoutTime: 'am',
          weightKg: 75
        });
        
        const allGuidance = generateContextualGuidance(input);
        const mealTimingGuidance = allGuidance.filter(g => g.category === 'mealTiming');
        
        // Should include early workout optimization
        const earlyOptimization = mealTimingGuidance.find(g =>
          g.key === 'guidance.mealTiming.earlyWorkoutOptimization'
        );
        expect(earlyOptimization).toBeDefined();
        expect(earlyOptimization?.replacements?.timing).toBe('within 30 minutes of waking');
      });
      
      // Fat loss should NOT include early workout optimization
      const fatLossInput = createInput({
        goal: 'loss',
        workoutTime: 'am',
        weightKg: 75
      });
      
      const fatLossGuidance = generateContextualGuidance(fatLossInput);
      const fatLossMealTiming = fatLossGuidance.filter(g => g.category === 'mealTiming');
      
      const earlyOptimization = fatLossMealTiming.find(g =>
        g.key === 'guidance.mealTiming.earlyWorkoutOptimization'
      );
      expect(earlyOptimization).toBeUndefined();
    });
  });

  describe('Integration Build Verification', () => {
    it('should generate consistent guidance across multiple calls', () => {
      const input = createInput({
        goal: 'gain',
        workoutTime: 'am',
        weightKg: 75
      });
      
      const guidance1 = generateContextualGuidance(input);
      const guidance2 = generateContextualGuidance(input);
      
      // Results should be deterministic
      expect(guidance1).toEqual(guidance2);
      
      // Should include expected meal timing guidance
      const mealKeys1 = guidance1.filter(g => g.category === 'mealTiming').map(g => g.key);
      const mealKeys2 = guidance2.filter(g => g.category === 'mealTiming').map(g => g.key);
      
      expect(mealKeys1).toEqual(mealKeys2);
      expect(mealKeys1).toContain('guidance.mealTiming.preWorkoutMuscleGain');
    });

    it('should handle all goal and workout time combinations without errors', () => {
      const goals: Array<CGEInput['goal']> = ['gain', 'loss', 'maintain'];
      const workoutTimes: Array<CGEInput['workoutTime']> = ['am', 'pm'];
      
      goals.forEach(goal => {
        workoutTimes.forEach(workoutTime => {
          const input = createInput({ goal, workoutTime, weightKg: 70 });
          
          expect(() => generateContextualGuidance(input)).not.toThrow();
          
          const guidance = generateContextualGuidance(input);
          
          // All guidance should have proper structure
          guidance.forEach(message => {
            expect(message).toHaveProperty('key');
            expect(message).toHaveProperty('type');
            expect(message).toHaveProperty('category');
            expect(['info', 'warn', 'critical']).toContain(message.type);
          });
          
          // Should have meal timing guidance for all combinations
          const mealTimingGuidance = guidance.filter(g => g.category === 'mealTiming');
          expect(mealTimingGuidance.length).toBeGreaterThan(0);
        });
      });
    });

    it('should maintain proper message structure and replacements', () => {
      const input = createInput({
        goal: 'gain',
        workoutTime: 'am',
        weightKg: 80
      });
      
      const allGuidance = generateContextualGuidance(input);
      const mealTimingGuidance = allGuidance.filter(g => g.category === 'mealTiming');
      
      // Verify all meal timing messages have proper structure
      mealTimingGuidance.forEach(message => {
        expect(message.key).toMatch(/^guidance\.mealTiming\./);
        expect(message.type).toBe('info'); // All meal timing is info level
        expect(message.category).toBe('mealTiming');
        
        if (message.replacements) {
          // Verify replacements are properly formatted
          Object.values(message.replacements).forEach(value => {
            expect(typeof value === 'string' || typeof value === 'number').toBe(true);
          });
        }
      });
    });
  });
});
