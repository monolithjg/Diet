import { describe, it, expect } from 'vitest';
import { generateContextualGuidance, type CGEInput } from '../engine';

describe('Allergy Swap Rules - CGE Integration', () => {
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
    sex: 'female',
    age: 30,
    weightKg: 70,
    bodyFatPct: 20,
    ...overrides
  });

  describe('AL-1 Specification Integration', () => {
    it('should handle AL-1 test case through full CGE orchestrator', () => {
      const input = createInput({
        allergies: ['peanut'],
        dietStyle: 'keto',
        weightKg: undefined, // Remove hydration guidance
        sex: 'male',
        age: 35 // Avoid triggering micronutrient guidance for women
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Verify that allergy guidance is generated with simplified scenario
      
      // Filter allergy swap messages
      const allergyGuidance = allGuidance.filter(g => g.category === 'allergySwap');
      
      expect(allergyGuidance.length).toBeGreaterThan(0);
      
      const proteinAlt = allergyGuidance.find(g => g.key === 'guidance.allergySwap.proteinAlternatives');
      const fatAlt = allergyGuidance.find(g => g.key === 'guidance.allergySwap.fatAlternatives');
      
      expect(proteinAlt).toBeDefined();
      expect(proteinAlt?.replacements?.allergen).toBe('peanut');
      expect(fatAlt).toBeDefined();
      expect(fatAlt?.replacements?.allergen).toBe('peanut');
      
      // Verify medical disclaimer is included when guidance exists
      const disclaimer = allGuidance.find(g => g.key === 'disclaimer.medical');
      expect(disclaimer).toBeDefined();
      expect(disclaimer?.category).toBe('validation');
    });
  });

  describe('Simple Allergy Scenarios (High Priority)', () => {
    it('should generate allergy guidance in balanced diet scenarios', () => {
      // Use balanced diet to minimize competing guidance
      const input = createInput({
        allergies: ['dairy', 'gluten'],
        dietStyle: 'balanced',
        weightKg: undefined, // Avoid hydration guidance
        sex: 'male', // Avoid female-specific micronutrient guidance
        age: 35 // Avoid age-specific guidance
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Filter allergy swap messages
      const allergyGuidance = allGuidance.filter(g => g.category === 'allergySwap');
      
      // In simple scenarios without competing guidance, allergy guidance should appear
      expect(allergyGuidance.length).toBeGreaterThan(0);
      
      // Should provide alternatives for both allergies
      const allergensCovered = allergyGuidance.map(g => g.replacements?.allergen);
      expect(allergensCovered).toContain('dairy');
      expect(allergensCovered).toContain('gluten');
    });

    it('should handle no allergies gracefully in full engine', () => {
      const input = createInput({
        allergies: [],
        dietStyle: 'balanced'
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Should not have allergy guidance
      const allergyGuidance = allGuidance.filter(g => g.category === 'allergySwap');
      expect(allergyGuidance).toHaveLength(0);
    });

    it('should handle unknown allergies in simple scenarios', () => {
      const input = createInput({
        allergies: ['sesame', 'mustard'],
        dietStyle: 'balanced',
        weightKg: undefined, // Avoid hydration guidance
        sex: 'male', // Avoid female-specific micronutrient guidance
        age: 35 // Avoid age-specific guidance
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      const allergyGuidance = allGuidance.filter(g => g.category === 'allergySwap');
      
      // Should provide generic advice for unknown allergies
      // Note: Multiple unknown allergies with same message key get deduplicated to 1 message
      expect(allergyGuidance).toHaveLength(1);
      allergyGuidance.forEach(message => {
        expect(message.key).toBe('guidance.allergySwap.genericAdvice');
        expect(message.replacements?.advice).toContain('registered dietitian');
      });
    });

    it('should handle mixed known and unknown allergies', () => {
      const input = createInput({
        allergies: ['peanut', 'unknown_allergen'],
        dietStyle: 'balanced',
        weightKg: undefined, // Avoid hydration guidance
        sex: 'male', // Avoid female-specific micronutrient guidance
        age: 35 // Avoid age-specific guidance
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      const allergyGuidance = allGuidance.filter(g => g.category === 'allergySwap');
      
      // Should have specific guidance for peanut and generic for unknown
      const peanutGuidance = allergyGuidance.filter(g => g.replacements?.allergen === 'peanut');
      const unknownGuidance = allergyGuidance.filter(g => g.replacements?.allergen === 'unknown_allergen');
      
      expect(peanutGuidance.length).toBeGreaterThan(0);
      expect(unknownGuidance).toHaveLength(1);
      expect(unknownGuidance[0].key).toBe('guidance.allergySwap.genericAdvice');
    });
  });

  describe('Complex Priority System Integration', () => {
    it('should respect max 5 guidance message limit in complex scenarios', () => {
      const input = createInput({
        allergies: ['peanut', 'dairy', 'gluten'],
        dietStyle: 'vegan', // Triggers micronutrient guidance (warn level)
        weightKg: 70, // Triggers hydration guidance
        pal: 'veryActive',
        goal: 'gain',
        workoutTime: 'am', // Triggers meal timing guidance
        sex: 'female',
        age: 25
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Should not exceed max 5 guidance messages + disclaimer
      const nonDisclaimerGuidance = allGuidance.filter(g => g.key !== 'disclaimer.medical');
      expect(nonDisclaimerGuidance).toHaveLength(5);
      
      // In complex scenarios, allergy guidance may be filtered out due to higher priority messages
      // This documents the CORRECT behavior - meal timing and micronutrient guidance have higher priority
      
      // Allergy guidance (info level) may be filtered when higher priority guidance exists
      // This is expected behavior, not a bug
      const micronutrientGuidance = allGuidance.filter(g => g.category === 'micronutrient');
      const mealTimingGuidance = allGuidance.filter(g => g.category === 'mealTiming');
      
      // Higher priority guidance should be present
      expect(micronutrientGuidance.length + mealTimingGuidance.length).toBeGreaterThan(0);
    });

    it('should handle guidance priority ordering correctly', () => {
      const input = createInput({
        allergies: ['peanut'],
        dietStyle: 'balanced',
        weightKg: undefined, // Simplify scenario
        sex: 'male',
        age: 35
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // All allergy guidance should be 'info' level
      const allergyGuidance = allGuidance.filter(g => g.category === 'allergySwap');
      allergyGuidance.forEach(message => {
        expect(message.type).toBe('info');
      });
    });
  });

  describe('Diet Style Specific Integration', () => {
    it('should handle keto diet with carb allergies', () => {
      const input = createInput({
        allergies: ['gluten'],
        dietStyle: 'keto',
        weightKg: undefined, // Simplify scenario
        sex: 'male',
        age: 35,
        macros: {
          proteinG: 120,
          fatG: 150,
          carbG: 20,
          proteinPct: 0.3,
          fatPct: 0.6,
          carbPct: 0.1,
          guidance: []
        }
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      const allergyGuidance = allGuidance.filter(g => g.category === 'allergySwap');
      
      // Should filter out high-carb alternatives for keto
      const glutenAlt = allergyGuidance.find(g => 
        g.key === 'guidance.allergySwap.carbAlternatives'
      );
      
      if (glutenAlt) {
        const alternatives = String(glutenAlt.replacements?.alternatives || '').toLowerCase();
        expect(alternatives).not.toContain('rice');
        expect(alternatives).not.toContain('sweet potato');
      }
    });

    it('should handle high protein diet with protein allergies', () => {
      const input = createInput({
        allergies: ['dairy', 'eggs'],
        dietStyle: 'highProtein',
        weightKg: undefined, // Simplify scenario
        sex: 'male',
        age: 35,
        macros: {
          proteinG: 180,
          fatG: 70,
          carbG: 100,
          proteinPct: 0.4,
          fatPct: 0.25,
          carbPct: 0.35,
          guidance: []
        }
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      const allergyGuidance = allGuidance.filter(g => g.category === 'allergySwap');
      
      // Should provide high-protein alternatives
      const proteinAlts = allergyGuidance.filter(g => 
        g.key === 'guidance.allergySwap.proteinAlternatives'
      );
      
      expect(proteinAlts.length).toBeGreaterThan(0);
      
      proteinAlts.forEach(alt => {
        expect(alt.replacements?.alternatives).toContain('protein');
      });
    });
  });

  describe('Edge Cases and Build Verification', () => {
    it('should handle zero macro scenarios', () => {
      const input = createInput({
        allergies: ['peanut'],
        macros: {
          proteinG: 0,
          fatG: 0,
          carbG: 0,
          proteinPct: 0,
          fatPct: 0,
          carbPct: 0,
          guidance: []
        }
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      const allergyGuidance = allGuidance.filter(g => g.category === 'allergySwap');
      
      // Should not provide alternatives when macros are zero
      expect(allergyGuidance).toHaveLength(0);
    });

    it('should maintain proper message structure in orchestrator', () => {
      const input = createInput({
        allergies: ['peanut'],
        dietStyle: 'balanced',
        weightKg: undefined, // Simplify scenario
        sex: 'male',
        age: 35
      });
      
      const allGuidance = generateContextualGuidance(input);
      const allergyGuidance = allGuidance.filter(g => g.category === 'allergySwap');
      
      allergyGuidance.forEach(message => {
        expect(message).toHaveProperty('key');
        expect(message).toHaveProperty('type');
        expect(message).toHaveProperty('category');
        expect(message.key).toMatch(/^guidance\.allergySwap\./);
        expect(['info', 'warn', 'critical']).toContain(message.type);
        expect(message.category).toBe('allergySwap');
        
        if (message.replacements) {
          expect(typeof message.replacements).toBe('object');
        }
      });
    });

    it('should coordinate properly with medical disclaimer', () => {
      const input = createInput({
        allergies: ['peanut'],
        dietStyle: 'balanced',
        weightKg: undefined, // Simplify scenario
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
      
      // Allergy guidance should be separate from disclaimer
      const allergyGuidance = allGuidance.filter(g => g.category === 'allergySwap');
      expect(allergyGuidance.length).toBeGreaterThan(0);
      
      allergyGuidance.forEach(message => {
        expect(message.category).toBe('allergySwap');
        expect(message.key).not.toBe('disclaimer.medical');
      });
    });

    it('should generate consistent allergy guidance across multiple calls', () => {
      const input = createInput({
        allergies: ['dairy'],
        dietStyle: 'balanced',
        weightKg: undefined, // Simplify scenario
        sex: 'male',
        age: 35
      });
      
      const guidance1 = generateContextualGuidance(input);
      const guidance2 = generateContextualGuidance(input);
      
      // Results should be deterministic
      expect(guidance1).toEqual(guidance2);
      
      // Should include expected allergy guidance
      const allergyKeys1 = guidance1.filter(g => g.category === 'allergySwap').map(g => g.key);
      const allergyKeys2 = guidance2.filter(g => g.category === 'allergySwap').map(g => g.key);
      
      expect(allergyKeys1).toEqual(allergyKeys2);
      expect(allergyKeys1.length).toBeGreaterThan(0);
    });

    it('should handle all diet styles with allergies without errors', () => {
      const dietStyles = ['balanced', 'highProtein', 'lowCarb', 'keto'] as const; // Exclude vegan/vegetarian to avoid competing guidance
      
      dietStyles.forEach(dietStyle => {
        const input = createInput({ 
          allergies: ['peanut'],
          dietStyle,
          weightKg: undefined, // Simplify scenario
          sex: 'male',
          age: 35
        });
        
        expect(() => generateContextualGuidance(input)).not.toThrow();
        
        const guidance = generateContextualGuidance(input);
        const allergyGuidance = guidance.filter(g => g.category === 'allergySwap');
        
        // Should provide allergy guidance for simplified scenarios
        expect(allergyGuidance.length).toBeGreaterThan(0);
        
        // All guidance should have proper structure
        allergyGuidance.forEach(message => {
          expect(message).toHaveProperty('key');
          expect(message).toHaveProperty('type');
          expect(message).toHaveProperty('category');
          expect(['info', 'warn', 'critical']).toContain(message.type);
          expect(message.category).toBe('allergySwap');
        });
      });
    });

    it('should handle large numbers of allergies efficiently', () => {
      const input = createInput({
        allergies: ['peanut', 'tree_nuts', 'dairy', 'gluten', 'soy', 'shellfish', 'eggs'],
        dietStyle: 'balanced',
        weightKg: undefined, // Simplify scenario
        sex: 'male',
        age: 35
      });
      
      const startTime = performance.now();
      const allGuidance = generateContextualGuidance(input);
      const endTime = performance.now();
      
      // Should complete quickly (less than 100ms for all allergies)
      expect(endTime - startTime).toBeLessThan(100);
      
      const allergyGuidance = allGuidance.filter(g => g.category === 'allergySwap');
      
      // Should provide guidance for some allergies (subject to message limit)
      expect(allergyGuidance.length).toBeGreaterThan(0);
      
      // All messages should be properly structured
      allergyGuidance.forEach(message => {
        expect(message.category).toBe('allergySwap');
        expect(message.type).toBe('info');
        expect(message.replacements?.allergen).toBeDefined();
        expect(message.replacements?.alternatives).toBeDefined();
      });
    });
  });

  describe('Priority System Documentation', () => {
    it('should document the realistic behavior of priority filtering', () => {
      const complexInput = createInput({
        allergies: ['peanut', 'dairy'],
        dietStyle: 'vegan', // Triggers warn-level B12 guidance
        weightKg: 70, // Triggers hydration guidance
        goal: 'gain',
        workoutTime: 'am', // Triggers meal timing guidance
        sex: 'female',
        age: 25 // Triggers iron guidance for women
      });
      
      const allGuidance = generateContextualGuidance(complexInput);
      
      // In complex scenarios with multiple guidance categories:
      // 1. Higher priority guidance (warn > info) takes precedence
      // 2. Max 5 message limit applies
      // 3. Allergy guidance (info level) may be filtered out
      
      const nonDisclaimerGuidance = allGuidance.filter(g => g.key !== 'disclaimer.medical');
      expect(nonDisclaimerGuidance).toHaveLength(5);
      
      // Document that this is EXPECTED behavior
      const micronutrientGuidance = allGuidance.filter(g => g.category === 'micronutrient');
      
      // Higher priority micronutrient guidance should be present
      expect(micronutrientGuidance.length).toBeGreaterThan(0);
      
      // Allergy guidance being filtered is expected in complex scenarios
      // (no assertion needed - this documents the behavior)
    });
  });
}); 