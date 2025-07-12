import { describe, it, expect } from 'vitest';
import { generateAllergySwapGuidance, type AllergySwapContext } from '../allergySwap';

describe('Allergy Swap Guidance Rules', () => {
  // Helper function to create base context
  const createContext = (overrides: Partial<AllergySwapContext> = {}): AllergySwapContext => ({
    allergies: [],
    dietStyle: 'balanced',
    proteinG: 120,
    fatG: 70,
    carbG: 250,
    ...overrides
  });

  describe('No Allergies Scenario', () => {
    it('should return empty guidance when no allergies present', () => {
      const context = createContext({
        allergies: []
      });
      
      const guidance = generateAllergySwapGuidance(context);
      
      expect(guidance).toHaveLength(0);
    });
  });

  describe('AL-1 Specification Compliance', () => {
    it('should handle AL-1 test case: peanut allergy with keto diet', () => {
      const context = createContext({
        allergies: ['peanut'],
        dietStyle: 'keto',
        proteinG: 120,
        fatG: 150,
        carbG: 25
      });
      
      const guidance = generateAllergySwapGuidance(context);
      
      // Should provide alternatives for peanut allergy
      expect(guidance.length).toBeGreaterThan(0);
      
      const proteinAlt = guidance.find(g => g.key === 'guidance.allergySwap.proteinAlternatives');
      const fatAlt = guidance.find(g => g.key === 'guidance.allergySwap.fatAlternatives');
      
      expect(proteinAlt).toBeDefined();
      expect(proteinAlt?.replacements?.allergen).toBe('peanut');
      expect(proteinAlt?.replacements?.alternatives).toContain('sunflower seed butter');
      
      expect(fatAlt).toBeDefined();
      expect(fatAlt?.replacements?.allergen).toBe('peanut');
      expect(fatAlt?.replacements?.alternatives).toContain('sunflower seed butter');
    });
  });

  describe('Individual Allergen Testing', () => {
    describe('Peanut Allergy', () => {
      it('should provide peanut alternatives for all macros', () => {
        const context = createContext({
          allergies: ['peanut'],
          dietStyle: 'balanced'
        });
        
        const guidance = generateAllergySwapGuidance(context);
        
        expect(guidance).toHaveLength(2); // protein + fat alternatives
        
        const proteinAlt = guidance.find(g => g.key === 'guidance.allergySwap.proteinAlternatives');
        const fatAlt = guidance.find(g => g.key === 'guidance.allergySwap.fatAlternatives');
        
        expect(proteinAlt?.replacements?.alternatives).toContain('sunflower seed butter');
        expect(fatAlt?.replacements?.alternatives).toContain('tahini');
      });

      it('should filter peanut alternatives for vegan diet', () => {
        const context = createContext({
          allergies: ['peanut'],
          dietStyle: 'vegan'
        });
        
        const guidance = generateAllergySwapGuidance(context);
        
        // Should still provide alternatives (all peanut alternatives are vegan-compatible)
        expect(guidance.length).toBeGreaterThan(0);
        
        guidance.forEach(message => {
          expect(message.replacements?.alternatives).not.toContain('dairy');
          expect(message.replacements?.alternatives).not.toContain('whey');
        });
      });
    });

    describe('Tree Nuts Allergy', () => {
      it('should provide tree nuts alternatives', () => {
        const context = createContext({
          allergies: ['tree_nuts'],
          dietStyle: 'balanced'
        });
        
        const guidance = generateAllergySwapGuidance(context);
        
        expect(guidance).toHaveLength(2); // protein + fat alternatives
        
        const proteinAlt = guidance.find(g => g.key === 'guidance.allergySwap.proteinAlternatives');
        const fatAlt = guidance.find(g => g.key === 'guidance.allergySwap.fatAlternatives');
        
        expect(proteinAlt?.replacements?.alternatives).toContain('seeds');
        expect(fatAlt?.replacements?.alternatives).toContain('avocado');
      });
    });

    describe('Dairy Allergy', () => {
      it('should provide dairy alternatives for all macros', () => {
        const context = createContext({
          allergies: ['dairy'],
          dietStyle: 'balanced'
        });
        
        const guidance = generateAllergySwapGuidance(context);
        
        expect(guidance).toHaveLength(2); // protein + fat alternatives
        
        const proteinAlt = guidance.find(g => g.key === 'guidance.allergySwap.proteinAlternatives');
        const fatAlt = guidance.find(g => g.key === 'guidance.allergySwap.fatAlternatives');
        
        expect(proteinAlt?.replacements?.alternatives).toContain('tofu');
        expect(fatAlt?.replacements?.alternatives).toContain('plant-based milks');
      });

      it('should be vegan-compatible for dairy alternatives', () => {
        const context = createContext({
          allergies: ['dairy'],
          dietStyle: 'vegan'
        });
        
        const guidance = generateAllergySwapGuidance(context);
        
        guidance.forEach(message => {
          expect(message.replacements?.alternatives).not.toContain('dairy');
          expect(message.replacements?.alternatives).not.toContain('whey');
          expect(message.replacements?.alternatives).not.toContain('casein');
        });
      });
    });

    describe('Gluten Allergy', () => {
      it('should provide gluten alternatives for carbs and protein', () => {
        const context = createContext({
          allergies: ['gluten'],
          dietStyle: 'balanced'
        });
        
        const guidance = generateAllergySwapGuidance(context);
        
        expect(guidance).toHaveLength(2); // carb + protein alternatives
        
        const carbAlt = guidance.find(g => g.key === 'guidance.allergySwap.carbAlternatives');
        const proteinAlt = guidance.find(g => g.key === 'guidance.allergySwap.proteinAlternatives');
        
        expect(carbAlt?.replacements?.alternatives).toContain('rice');
        expect(proteinAlt?.replacements?.alternatives).toContain('quinoa');
      });

      it('should filter high-carb gluten alternatives for keto diet', () => {
        const context = createContext({
          allergies: ['gluten'],
          dietStyle: 'keto',
          carbG: 20
        });
        
        const guidance = generateAllergySwapGuidance(context);
        
        const carbAlt = guidance.find(g => g.key === 'guidance.allergySwap.carbAlternatives');
        
        if (carbAlt) {
          expect(carbAlt.replacements?.alternatives).not.toContain('rice');
          expect(carbAlt.replacements?.alternatives).not.toContain('oats');
          expect(carbAlt.replacements?.alternatives).not.toContain('sweet potatoes');
        }
      });
    });

    describe('Soy Allergy', () => {
      it('should provide soy alternatives', () => {
        const context = createContext({
          allergies: ['soy'],
          dietStyle: 'balanced'
        });
        
        const guidance = generateAllergySwapGuidance(context);
        
        expect(guidance).toHaveLength(2); // protein + fat alternatives
        
        const proteinAlt = guidance.find(g => g.key === 'guidance.allergySwap.proteinAlternatives');
        const fatAlt = guidance.find(g => g.key === 'guidance.allergySwap.fatAlternatives');
        
        expect(proteinAlt?.replacements?.alternatives).toContain('pea protein');
        expect(fatAlt?.replacements?.alternatives).toContain('coconut products');
      });
    });

    describe('Shellfish Allergy', () => {
      it('should provide shellfish alternatives', () => {
        const context = createContext({
          allergies: ['shellfish'],
          dietStyle: 'balanced'
        });
        
        const guidance = generateAllergySwapGuidance(context);
        
        expect(guidance).toHaveLength(2); // protein + fat alternatives
        
        const proteinAlt = guidance.find(g => g.key === 'guidance.allergySwap.proteinAlternatives');
        const fatAlt = guidance.find(g => g.key === 'guidance.allergySwap.fatAlternatives');
        
        expect(proteinAlt?.replacements?.alternatives).toContain('fish (if tolerated)');
        expect(fatAlt?.replacements?.alternatives).toContain('algae-based omega-3');
      });
    });

    describe('Egg Allergy', () => {
      it('should provide egg alternatives', () => {
        const context = createContext({
          allergies: ['eggs'],
          dietStyle: 'balanced'
        });
        
        const guidance = generateAllergySwapGuidance(context);
        
        expect(guidance).toHaveLength(2); // protein + fat alternatives
        
        const proteinAlt = guidance.find(g => g.key === 'guidance.allergySwap.proteinAlternatives');
        const fatAlt = guidance.find(g => g.key === 'guidance.allergySwap.fatAlternatives');
        
        expect(proteinAlt?.replacements?.alternatives).toContain('tofu scramble');
        expect(fatAlt?.replacements?.alternatives).toContain('ground flax as binder');
      });
    });
  });

  describe('Multiple Allergies', () => {
    it('should handle multiple allergies with separate guidance', () => {
      const context = createContext({
        allergies: ['peanut', 'dairy'],
        dietStyle: 'balanced'
      });
      
      const guidance = generateAllergySwapGuidance(context);
      
      // Should have alternatives for both allergies
      expect(guidance.length).toBeGreaterThan(2);
      
      const peanutMessages = guidance.filter(g => g.replacements?.allergen === 'peanut');
      const dairyMessages = guidance.filter(g => g.replacements?.allergen === 'dairy');
      
      expect(peanutMessages.length).toBeGreaterThan(0);
      expect(dairyMessages.length).toBeGreaterThan(0);
    });

    it('should handle complex multi-allergy scenario', () => {
      const context = createContext({
        allergies: ['gluten', 'dairy', 'soy'],
        dietStyle: 'vegan'
      });
      
      const guidance = generateAllergySwapGuidance(context);
      
      // Should provide alternatives for all three allergies
      const allergensCovered = guidance.map(g => g.replacements?.allergen);
      expect(allergensCovered).toContain('gluten');
      expect(allergensCovered).toContain('dairy');
      expect(allergensCovered).toContain('soy');
      
      // All alternatives should be vegan-compatible
      guidance.forEach(message => {
        expect(message.replacements?.alternatives).not.toContain('dairy');
        expect(message.replacements?.alternatives).not.toContain('whey');
        expect(message.replacements?.alternatives).not.toContain('casein');
      });
    });
  });

  describe('Diet Style Compatibility', () => {
    describe('Vegan Diet Filtering', () => {
      it('should filter out animal products for vegan diet', () => {
        const context = createContext({
          allergies: ['dairy'],
          dietStyle: 'vegan'
        });
        
        const guidance = generateAllergySwapGuidance(context);
        
        guidance.forEach(message => {
          const alternatives = String(message.replacements?.alternatives || '').toLowerCase();
          expect(alternatives).not.toContain('dairy');
          expect(alternatives).not.toContain('whey');
          expect(alternatives).not.toContain('casein');
        });
      });
    });

    describe('Keto Diet Filtering', () => {
      it('should filter out high-carb alternatives for keto diet', () => {
        const context = createContext({
          allergies: ['gluten'],
          dietStyle: 'keto'
        });
        
        const guidance = generateAllergySwapGuidance(context);
        
                 const carbAlt = guidance.find(g => g.key === 'guidance.allergySwap.carbAlternatives');
         if (carbAlt) {
           const alternatives = String(carbAlt.replacements?.alternatives || '').toLowerCase();
           expect(alternatives).not.toContain('rice');
           expect(alternatives).not.toContain('oats');
           expect(alternatives).not.toContain('quinoa');
           expect(alternatives).not.toContain('sweet potato');
         }
      });
    });

    describe('Other Diet Styles', () => {
      it('should handle balanced diet without filtering', () => {
        const context = createContext({
          allergies: ['gluten'],
          dietStyle: 'balanced'
        });
        
        const guidance = generateAllergySwapGuidance(context);
        
        const carbAlt = guidance.find(g => g.key === 'guidance.allergySwap.carbAlternatives');
        expect(carbAlt?.replacements?.alternatives).toContain('rice');
        expect(carbAlt?.replacements?.alternatives).toContain('quinoa');
      });

      it('should handle high protein diet', () => {
        const context = createContext({
          allergies: ['dairy'],
          dietStyle: 'highProtein'
        });
        
        const guidance = generateAllergySwapGuidance(context);
        
        // Should provide protein alternatives
        const proteinAlt = guidance.find(g => g.key === 'guidance.allergySwap.proteinAlternatives');
        expect(proteinAlt).toBeDefined();
      });

      it('should handle low carb diet', () => {
        const context = createContext({
          allergies: ['gluten'],
          dietStyle: 'lowCarb'
        });
        
        const guidance = generateAllergySwapGuidance(context);
        
        // Should still provide alternatives (no special filtering for lowCarb yet)
        expect(guidance.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Macro-Specific Guidance', () => {
    it('should only provide protein alternatives when protein > 0', () => {
      const context = createContext({
        allergies: ['peanut'],
        proteinG: 120,
        fatG: 0,
        carbG: 0
      });
      
      const guidance = generateAllergySwapGuidance(context);
      
      const proteinAlt = guidance.find(g => g.key === 'guidance.allergySwap.proteinAlternatives');
      const fatAlt = guidance.find(g => g.key === 'guidance.allergySwap.fatAlternatives');
      const carbAlt = guidance.find(g => g.key === 'guidance.allergySwap.carbAlternatives');
      
      expect(proteinAlt).toBeDefined();
      expect(fatAlt).toBeUndefined();
      expect(carbAlt).toBeUndefined();
    });

    it('should only provide fat alternatives when fat > 0', () => {
      const context = createContext({
        allergies: ['peanut'],
        proteinG: 0,
        fatG: 70,
        carbG: 0
      });
      
      const guidance = generateAllergySwapGuidance(context);
      
      const proteinAlt = guidance.find(g => g.key === 'guidance.allergySwap.proteinAlternatives');
      const fatAlt = guidance.find(g => g.key === 'guidance.allergySwap.fatAlternatives');
      const carbAlt = guidance.find(g => g.key === 'guidance.allergySwap.carbAlternatives');
      
      expect(proteinAlt).toBeUndefined();
      expect(fatAlt).toBeDefined();
      expect(carbAlt).toBeUndefined();
    });

    it('should only provide carb alternatives when carbs > 0', () => {
      const context = createContext({
        allergies: ['gluten'],
        proteinG: 0,
        fatG: 0,
        carbG: 250
      });
      
      const guidance = generateAllergySwapGuidance(context);
      
      const proteinAlt = guidance.find(g => g.key === 'guidance.allergySwap.proteinAlternatives');
      const fatAlt = guidance.find(g => g.key === 'guidance.allergySwap.fatAlternatives');
      const carbAlt = guidance.find(g => g.key === 'guidance.allergySwap.carbAlternatives');
      
      expect(proteinAlt).toBeUndefined();
      expect(fatAlt).toBeUndefined();
      expect(carbAlt).toBeDefined();
    });
  });

  describe('Unknown Allergies', () => {
    it('should provide generic advice for unknown allergies', () => {
      const context = createContext({
        allergies: ['sesame', 'mustard'],
        dietStyle: 'balanced'
      });
      
      const guidance = generateAllergySwapGuidance(context);
      
      expect(guidance).toHaveLength(2);
      
      guidance.forEach(message => {
        expect(message.key).toBe('guidance.allergySwap.genericAdvice');
        expect(message.replacements?.advice).toContain('registered dietitian');
      });
    });

    it('should handle mixed known and unknown allergies', () => {
      const context = createContext({
        allergies: ['peanut', 'unknown_allergen'],
        dietStyle: 'balanced'
      });
      
      const guidance = generateAllergySwapGuidance(context);
      
      // Should have specific guidance for peanut and generic for unknown
      const peanutGuidance = guidance.filter(g => g.replacements?.allergen === 'peanut');
      const unknownGuidance = guidance.filter(g => g.replacements?.allergen === 'unknown_allergen');
      
      expect(peanutGuidance.length).toBeGreaterThan(0);
      expect(unknownGuidance).toHaveLength(1);
      expect(unknownGuidance[0].key).toBe('guidance.allergySwap.genericAdvice');
    });
  });

  describe('Case Sensitivity and Formatting', () => {
    it('should handle different case formats for allergens', () => {
      const context = createContext({
        allergies: ['PEANUT', 'Tree Nuts', 'tree_nuts'],
        dietStyle: 'balanced'
      });
      
      const guidance = generateAllergySwapGuidance(context);
      
      // Should handle PEANUT as peanut, and both tree nuts formats
      expect(guidance.length).toBeGreaterThan(0);
      
      const allergensCovered = guidance.map(g => g.replacements?.allergen);
      expect(allergensCovered).toContain('PEANUT');
      expect(allergensCovered).toContain('Tree Nuts');
      expect(allergensCovered).toContain('tree_nuts');
    });

    it('should handle spaces in allergen names', () => {
      const context = createContext({
        allergies: ['tree nuts'],
        dietStyle: 'balanced'
      });
      
      const guidance = generateAllergySwapGuidance(context);
      
      // Should convert "tree nuts" to "tree_nuts" for lookup
      expect(guidance.length).toBeGreaterThan(0);
    });
  });

  describe('Message Structure Validation', () => {
    it('should return properly structured guidance messages', () => {
      const context = createContext({
        allergies: ['peanut'],
        dietStyle: 'balanced'
      });
      
      const guidance = generateAllergySwapGuidance(context);
      
      guidance.forEach(message => {
        expect(message).toHaveProperty('key');
        expect(message).toHaveProperty('type');
        expect(message).toHaveProperty('category');
        expect(message.key).toMatch(/^guidance\.allergySwap\./);
        expect(['info', 'warn', 'critical']).toContain(message.type);
        expect(message.category).toBe('allergySwap');
        
        if (message.replacements) {
          expect(typeof message.replacements).toBe('object');
          expect(message.replacements).toHaveProperty('allergen');
        }
      });
    });

    it('should use consistent message types', () => {
      const context = createContext({
        allergies: ['peanut', 'dairy'],
        dietStyle: 'vegan'
      });
      
      const guidance = generateAllergySwapGuidance(context);
      
      // All allergy swap guidance should be 'info' level
      guidance.forEach(message => {
        expect(message.type).toBe('info');
      });
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle empty allergy array', () => {
      const context = createContext({
        allergies: [],
        dietStyle: 'balanced'
      });
      
      const guidance = generateAllergySwapGuidance(context);
      
      expect(guidance).toHaveLength(0);
    });

    it('should handle zero macros', () => {
      const context = createContext({
        allergies: ['peanut'],
        proteinG: 0,
        fatG: 0,
        carbG: 0
      });
      
      const guidance = generateAllergySwapGuidance(context);
      
      expect(guidance).toHaveLength(0);
    });

    it('should handle negative macros gracefully', () => {
      const context = createContext({
        allergies: ['peanut'],
        proteinG: -10,
        fatG: -5,
        carbG: -20
      });
      
      const guidance = generateAllergySwapGuidance(context);
      
      expect(guidance).toHaveLength(0);
    });

    it('should handle very high macro values', () => {
      const context = createContext({
        allergies: ['peanut'],
        proteinG: 500,
        fatG: 300,
        carbG: 1000
      });
      
      const guidance = generateAllergySwapGuidance(context);
      
      // Should still provide alternatives regardless of high values
      expect(guidance.length).toBeGreaterThan(0);
    });

    it('should handle duplicate allergies', () => {
      const context = createContext({
        allergies: ['peanut', 'peanut', 'dairy', 'dairy'],
        dietStyle: 'balanced'
      });
      
      const guidance = generateAllergySwapGuidance(context);
      
      // Should provide guidance for each occurrence (implementation dependent)
      const peanutCount = guidance.filter(g => g.replacements?.allergen === 'peanut').length;
      const dairyCount = guidance.filter(g => g.replacements?.allergen === 'dairy').length;
      
      expect(peanutCount).toBeGreaterThan(0);
      expect(dairyCount).toBeGreaterThan(0);
    });
  });

  describe('Integration Context Validation', () => {
    it('should handle all required context fields', () => {
      const fullContext: AllergySwapContext = {
        allergies: ['peanut'],
        dietStyle: 'balanced',
        proteinG: 120,
        fatG: 70,
        carbG: 250
      };
      
      expect(() => generateAllergySwapGuidance(fullContext)).not.toThrow();
      
      const guidance = generateAllergySwapGuidance(fullContext);
      expect(guidance.length).toBeGreaterThan(0);
    });

    it('should work with all diet styles', () => {
      const dietStyles = ['balanced', 'highProtein', 'lowCarb', 'keto', 'vegan', 'vegetarian'] as const;
      
      dietStyles.forEach(dietStyle => {
        const context = createContext({
          allergies: ['peanut'],
          dietStyle
        });
        
        expect(() => generateAllergySwapGuidance(context)).not.toThrow();
        
        const guidance = generateAllergySwapGuidance(context);
        expect(guidance.length).toBeGreaterThan(0);
        
        // All guidance should have proper structure
        guidance.forEach(message => {
          expect(message).toHaveProperty('key');
          expect(message).toHaveProperty('type');
          expect(message).toHaveProperty('category');
          expect(['info', 'warn', 'critical']).toContain(message.type);
          expect(message.category).toBe('allergySwap');
        });
      });
    });
  });
}); 