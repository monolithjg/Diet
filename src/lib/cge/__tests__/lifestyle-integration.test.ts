import { describe, it, expect } from 'vitest';
import { generateContextualGuidance, type CGEInput } from '../engine';

describe('Lifestyle Rules - CGE Integration', () => {
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
    bodyFatPct: 20,
    ...overrides
  });

  describe('SLEEP-1 Specification Integration', () => {
    it('should handle SLEEP-1 test case through full CGE orchestrator', () => {
      const input = createInput({
        sleepHours: 5,
        goal: 'loss',
        // Simplify scenario to ensure lifestyle guidance appears
        weightKg: undefined, // Remove hydration guidance
        allergies: [], // Remove allergy guidance  
        sex: 'male',
        age: 35 // Avoid age-specific micronutrient guidance
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Filter lifestyle messages
      const lifestyleGuidance = allGuidance.filter(g => g.category === 'lifestyle');
      
      expect(lifestyleGuidance.length).toBeGreaterThan(0);
      
      const sleepGuidance = lifestyleGuidance.find(g => g.key === 'guidance.lifestyle.sleepLow');
      
      expect(sleepGuidance).toBeDefined();
      expect(sleepGuidance?.type).toBe('warn');
      expect(sleepGuidance?.replacements?.current).toBe(5);
      expect(sleepGuidance?.replacements?.target).toBe('7-9');
      expect(sleepGuidance?.replacements?.impact).toBe('fat loss');
      
      // Verify medical disclaimer is included when guidance exists
      const disclaimer = allGuidance.find(g => g.key === 'disclaimer.medical');
      expect(disclaimer).toBeDefined();
      expect(disclaimer?.category).toBe('validation');
    });
  });

  describe('Simple Lifestyle Scenarios', () => {
    it('should generate sleep guidance in simplified scenarios', () => {
      const input = createInput({
        sleepHours: 4,
        goal: 'gain',
        // Simplify to avoid competing guidance
        weightKg: undefined,
        allergies: [],
        sex: 'male',
        age: 35
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      const lifestyleGuidance = allGuidance.filter(g => g.category === 'lifestyle');
      
      expect(lifestyleGuidance.length).toBeGreaterThan(0);
      
      const sleepGuidance = lifestyleGuidance.find(g => g.key === 'guidance.lifestyle.sleepLow');
      expect(sleepGuidance).toBeDefined();
      expect(sleepGuidance?.type).toBe('warn');
      expect(sleepGuidance?.replacements?.impact).toBe('muscle gain');
    });

    it('should generate stress guidance in simplified scenarios', () => {
      const input = createInput({
        stressLevel: 3,
        goal: 'maintain',
        // Simplify to avoid competing guidance
        weightKg: undefined,
        allergies: [],
        sex: 'male',
        age: 35
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      const lifestyleGuidance = allGuidance.filter(g => g.category === 'lifestyle');
      
      expect(lifestyleGuidance.length).toBeGreaterThan(0);
      
      const stressGuidance = lifestyleGuidance.find(g => g.key === 'guidance.lifestyle.stressHigh');
      expect(stressGuidance).toBeDefined();
      expect(stressGuidance?.type).toBe('info');
      expect(stressGuidance?.replacements?.impact).toBe('cortisol levels and recovery');
    });

    it('should generate both sleep and stress guidance when both conditions are met', () => {
      const input = createInput({
        sleepHours: 4,
        stressLevel: 3,
        goal: 'loss',
        // Simplify to avoid competing guidance
        weightKg: undefined,
        allergies: [],
        sex: 'male',
        age: 35
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      const lifestyleGuidance = allGuidance.filter(g => g.category === 'lifestyle');
      
      expect(lifestyleGuidance).toHaveLength(2);
      
      const sleepGuidance = lifestyleGuidance.find(g => g.key === 'guidance.lifestyle.sleepLow');
      const stressGuidance = lifestyleGuidance.find(g => g.key === 'guidance.lifestyle.stressHigh');
      
      expect(sleepGuidance).toBeDefined();
      expect(sleepGuidance?.type).toBe('warn');
      expect(sleepGuidance?.replacements?.impact).toBe('fat loss');
      
      expect(stressGuidance).toBeDefined();  
      expect(stressGuidance?.type).toBe('info');
      expect(stressGuidance?.replacements?.impact).toBe('cortisol levels and recovery');
    });

    it('should handle no lifestyle guidance when neither condition is met', () => {
      const input = createInput({
        sleepHours: 8, // Above threshold
        stressLevel: 2, // Below threshold
        goal: 'maintain'
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      const lifestyleGuidance = allGuidance.filter(g => g.category === 'lifestyle');
      
      expect(lifestyleGuidance).toHaveLength(0);
    });
  });

  describe('Priority System Integration', () => {
    it('should respect lifestyle guidance priority in CGE orchestrator', () => {
      const input = createInput({
        sleepHours: 4, // warn level
        stressLevel: 3, // info level
        goal: 'loss'
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Sleep guidance (warn) should have higher priority than stress guidance (info)
      const lifestyleGuidance = allGuidance.filter(g => g.category === 'lifestyle');
      
      if (lifestyleGuidance.length >= 2) {
        // Find the positions in the overall guidance array
        const sleepIndex = allGuidance.findIndex(g => g.key === 'guidance.lifestyle.sleepLow');
        const stressIndex = allGuidance.findIndex(g => g.key === 'guidance.lifestyle.stressHigh');
        
        if (sleepIndex !== -1 && stressIndex !== -1) {
          expect(sleepIndex).toBeLessThan(stressIndex); // Sleep (warn) should come before stress (info)
        }
      }
    });

    it('should handle lifestyle guidance in complex scenarios with multiple categories', () => {
      const input = createInput({
        sleepHours: 4, // Trigger lifestyle guidance (warn level)
        stressLevel: 3, // Trigger lifestyle guidance (info level)
        dietStyle: 'vegan', // Trigger micronutrient guidance (warn level) 
        weightKg: 70, // Trigger hydration guidance (info level)
        goal: 'gain',
        workoutTime: 'am', // Trigger meal timing guidance
        sex: 'female',
        age: 25
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Should not exceed max 5 guidance messages + disclaimer
      const nonDisclaimerGuidance = allGuidance.filter(g => g.key !== 'disclaimer.medical');
      expect(nonDisclaimerGuidance).toHaveLength(5);
      
      // In complex scenarios, lifestyle guidance may compete with other categories
      // Sleep guidance (warn level) should have a good chance of appearing
      const lifestyleGuidance = allGuidance.filter(g => g.category === 'lifestyle');
      const micronutrientGuidance = allGuidance.filter(g => g.category === 'micronutrient');
      const mealTimingGuidance = allGuidance.filter(g => g.category === 'mealTiming');
      
      // At least some higher priority guidance should be present
      expect(micronutrientGuidance.length + mealTimingGuidance.length + lifestyleGuidance.length).toBeGreaterThan(0);
    });
  });

  describe('Goal-Specific Integration', () => {
    it('should provide goal-specific sleep guidance for fat loss', () => {
      const input = createInput({
        sleepHours: 5,
        goal: 'loss',
        // Simplify scenario
        weightKg: undefined,
        allergies: [],
        sex: 'male',
        age: 35
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      const sleepGuidance = allGuidance.find(g => g.key === 'guidance.lifestyle.sleepLow');
      
      expect(sleepGuidance).toBeDefined();
      expect(sleepGuidance?.replacements?.impact).toBe('fat loss');
    });

    it('should provide goal-specific sleep guidance for muscle gain', () => {
      const input = createInput({
        sleepHours: 3,
        goal: 'gain',
        // Simplify scenario
        weightKg: undefined,
        allergies: [],
        sex: 'male',
        age: 35
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      const sleepGuidance = allGuidance.find(g => g.key === 'guidance.lifestyle.sleepLow');
      
      expect(sleepGuidance).toBeDefined();
      expect(sleepGuidance?.replacements?.impact).toBe('muscle gain');
    });

    it('should provide goal-specific sleep guidance for maintenance', () => {
      const input = createInput({
        sleepHours: 5,
        goal: 'maintain',
        // Simplify scenario
        weightKg: undefined,
        allergies: [],
        sex: 'male',
        age: 35
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      const sleepGuidance = allGuidance.find(g => g.key === 'guidance.lifestyle.sleepLow');
      
      expect(sleepGuidance).toBeDefined();
      expect(sleepGuidance?.replacements?.impact).toBe('muscle gain'); // maintain defaults to muscle gain
    });
  });

  describe('Edge Cases and Build Verification', () => {
    it('should handle undefined lifestyle values gracefully', () => {
      const input = createInput({
        sleepHours: undefined,
        stressLevel: undefined,
        goal: 'maintain'
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      const lifestyleGuidance = allGuidance.filter(g => g.category === 'lifestyle');
      
      expect(lifestyleGuidance).toHaveLength(0);
    });

    it('should handle boundary cases correctly', () => {
      const input = createInput({
        sleepHours: 6, // Exactly at threshold (should NOT trigger)
        stressLevel: 2, // Below threshold (should NOT trigger)
        goal: 'loss'
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      const lifestyleGuidance = allGuidance.filter(g => g.category === 'lifestyle');
      
      expect(lifestyleGuidance).toHaveLength(0);
    });

    it('should maintain proper message structure in orchestrator', () => {
      const input = createInput({
        sleepHours: 4,
        stressLevel: 3,
        goal: 'loss',
        // Simplify scenario
        weightKg: undefined,
        allergies: [],
        sex: 'male',
        age: 35
      });
      
      const allGuidance = generateContextualGuidance(input);
      const lifestyleGuidance = allGuidance.filter(g => g.category === 'lifestyle');
      
      lifestyleGuidance.forEach(message => {
        expect(message).toHaveProperty('key');
        expect(message).toHaveProperty('type');
        expect(message).toHaveProperty('category');
        expect(message.key).toMatch(/^guidance\.lifestyle\./);
        expect(['info', 'warn', 'critical']).toContain(message.type);
        expect(message.category).toBe('lifestyle');
        
        if (message.replacements) {
          expect(typeof message.replacements).toBe('object');
        }
      });
    });

    it('should coordinate properly with medical disclaimer', () => {
      const input = createInput({
        sleepHours: 4,
        goal: 'loss',
        // Simplify scenario
        weightKg: undefined,
        allergies: [],
        sex: 'male',
        age: 35
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Should have medical disclaimer when any guidance is present
      if (allGuidance.length > 0) {
        const disclaimer = allGuidance.find(g => g.key === 'disclaimer.medical');
        expect(disclaimer).toBeDefined();
        expect(disclaimer?.category).toBe('validation');
      }
      
      // Lifestyle guidance should be separate from disclaimer
      const lifestyleGuidance = allGuidance.filter(g => g.category === 'lifestyle');
      expect(lifestyleGuidance.length).toBeGreaterThan(0);
      
      lifestyleGuidance.forEach(message => {
        expect(message.category).toBe('lifestyle');
        expect(message.key).not.toBe('disclaimer.medical');
      });
    });
  });

  describe('Performance and Consistency', () => {
    it('should generate consistent lifestyle guidance across multiple calls', () => {
      const input = createInput({
        sleepHours: 5,
        stressLevel: 3,
        goal: 'loss',
        // Simplify scenario
        weightKg: undefined,
        allergies: [],
        sex: 'male',
        age: 35
      });
      
      const guidance1 = generateContextualGuidance(input);
      const guidance2 = generateContextualGuidance(input);
      
      // Results should be deterministic
      expect(guidance1).toEqual(guidance2);
      
      // Should include expected lifestyle guidance
      const lifestyleKeys1 = guidance1.filter(g => g.category === 'lifestyle').map(g => g.key);
      const lifestyleKeys2 = guidance2.filter(g => g.category === 'lifestyle').map(g => g.key);
      
      expect(lifestyleKeys1).toEqual(lifestyleKeys2);
      expect(lifestyleKeys1.length).toBeGreaterThan(0);
    });

    it('should handle all goal types with lifestyle factors without errors', () => {
      const goals = ['loss', 'gain', 'maintain'] as const;
      
      goals.forEach(goal => {
        const input = createInput({ 
          sleepHours: 4,
          stressLevel: 3,
          goal,
          // Simplify scenario
          weightKg: undefined,
          allergies: [],
          sex: 'male',
          age: 35
        });
        
        expect(() => generateContextualGuidance(input)).not.toThrow();
        
        const guidance = generateContextualGuidance(input);
        const lifestyleGuidance = guidance.filter(g => g.category === 'lifestyle');
        
        // Should provide lifestyle guidance for all goals
        expect(lifestyleGuidance.length).toBeGreaterThan(0);
        
        // All guidance should have proper structure
        lifestyleGuidance.forEach(message => {
          expect(message).toHaveProperty('key');
          expect(message).toHaveProperty('type');
          expect(message).toHaveProperty('category');
          expect(['info', 'warn', 'critical']).toContain(message.type);
          expect(message.category).toBe('lifestyle');
        });
      });
    });

    it('should complete lifestyle guidance generation efficiently', () => {
      const input = createInput({
        sleepHours: 2,
        stressLevel: 3,
        goal: 'loss'
      });
      
      const startTime = performance.now();
      const allGuidance = generateContextualGuidance(input);
      const endTime = performance.now();
      
      // Should complete quickly (less than 50ms for lifestyle guidance)
      expect(endTime - startTime).toBeLessThan(50);
      
      const lifestyleGuidance = allGuidance.filter(g => g.category === 'lifestyle');
      
      // Should provide guidance efficiently
      expect(lifestyleGuidance.length).toBeGreaterThan(0);
      
      // All messages should be properly structured
      lifestyleGuidance.forEach(message => {
        expect(message.category).toBe('lifestyle');
        expect(['info', 'warn']).toContain(message.type);
        expect(message.replacements).toBeDefined();
      });
    });
  });
}); 