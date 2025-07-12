import { describe, it, expect } from 'vitest';
import { generateMicronutrientGuidance, type MicronutrientContext } from '../micronutrients';

describe('Micronutrient Guidance Rules', () => {
  // Helper function to create base context
  const createContext = (overrides: Partial<MicronutrientContext> = {}): MicronutrientContext => ({
    dietStyle: 'balanced',
    sex: 'female',
    age: 30,
    ...overrides
  });

  describe('MIC-1 Specification Compliance', () => {
    it('should generate B12 and iron guidance for vegan diet', () => {
      const context = createContext({
        dietStyle: 'vegan',
        sex: 'female',
        age: 25
      });
      
      const guidance = generateMicronutrientGuidance(context);
      
      // Extract message keys
      const keys = guidance.map(g => g.key);
      
      // MIC-1: Should include micronutrient.b12 and micronutrient.iron guidance
      expect(keys).toContain('guidance.micronutrient.b12Supplement');
      expect(keys).toContain('guidance.micronutrient.ironAbsorption');
      expect(keys).toContain('guidance.micronutrient.omega3Sources');
      expect(keys).toContain('guidance.micronutrient.calciumSources');
      expect(keys).toContain('guidance.micronutrient.creatineConsider');
      
      // Verify B12 guidance content
      const b12Guidance = guidance.find(g => g.key === 'guidance.micronutrient.b12Supplement');
      expect(b12Guidance?.type).toBe('warn');
      expect(b12Guidance?.category).toBe('micronutrient');
      expect(b12Guidance?.replacements?.supplement).toBe('B-12');
      expect(b12Guidance?.replacements?.dosage).toBe('10-25 mcg daily or 250 mcg weekly');
    });
  });

  describe('B12 Guidance - Age Stratification', () => {
    it('should provide enhanced B12 guidance for elderly vegans (≥65)', () => {
      const context = createContext({
        dietStyle: 'vegan',
        age: 70
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const b12Guidance = guidance.find(g => g.key === 'guidance.micronutrient.b12SupplementElderly');
      
      expect(b12Guidance).toBeDefined();
      expect(b12Guidance?.type).toBe('warn');
      expect(b12Guidance?.replacements?.dosage).toBe('25-100 mcg daily or 1000 mcg weekly');
      expect(b12Guidance?.replacements?.reason).toContain('decreased absorption with age');
    });

    it('should provide standard B12 guidance for younger vegans (<65)', () => {
      const context = createContext({
        dietStyle: 'vegan',
        age: 30
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const b12Guidance = guidance.find(g => g.key === 'guidance.micronutrient.b12Supplement');
      
      expect(b12Guidance).toBeDefined();
      expect(b12Guidance?.type).toBe('warn');
      expect(b12Guidance?.replacements?.dosage).toBe('10-25 mcg daily or 250 mcg weekly');
    });

    it('should provide lower-risk B12 guidance for vegetarians', () => {
      const context = createContext({
        dietStyle: 'vegetarian',
        age: 35
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const b12Guidance = guidance.find(g => g.key === 'guidance.micronutrient.b12Consider');
      
      expect(b12Guidance).toBeDefined();
      expect(b12Guidance?.type).toBe('info');
      expect(b12Guidance?.replacements?.reason).toContain('reduced intake from limited animal products');
    });
  });

  describe('Iron Guidance - Demographics and Diet', () => {
    it('should provide iron guidance for premenopausal women', () => {
      const context = createContext({
        sex: 'female',
        age: 25,
        dietStyle: 'balanced'
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const ironGuidance = guidance.find(g => g.key === 'guidance.micronutrient.ironNeeds');
      
      expect(ironGuidance).toBeDefined();
      expect(ironGuidance?.type).toBe('info');
      expect(ironGuidance?.replacements?.demographic).toBe('premenopausal women');
      expect(ironGuidance?.replacements?.amount).toBe('18mg daily');
    });

    it('should not provide iron guidance for postmenopausal women', () => {
      const context = createContext({
        sex: 'female',
        age: 55,
        dietStyle: 'balanced'
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const ironGuidance = guidance.find(g => g.key === 'guidance.micronutrient.ironNeeds');
      
      expect(ironGuidance).toBeUndefined();
    });

    it('should provide iron absorption guidance for plant-based diets', () => {
      const context = createContext({
        dietStyle: 'vegan',
        sex: 'male',
        age: 30
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const absorptionGuidance = guidance.find(g => g.key === 'guidance.micronutrient.ironAbsorption');
      
      expect(absorptionGuidance).toBeDefined();
      expect(absorptionGuidance?.type).toBe('info');
      expect(absorptionGuidance?.replacements?.enhancer).toBe('vitamin C-rich foods');
      expect(absorptionGuidance?.replacements?.timing).toContain('1-2 hours');
    });

    it('should provide iron absorption guidance for vegetarians', () => {
      const context = createContext({
        dietStyle: 'vegetarian',
        sex: 'male',
        age: 30
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const absorptionGuidance = guidance.find(g => g.key === 'guidance.micronutrient.ironAbsorption');
      
      expect(absorptionGuidance).toBeDefined();
    });
  });

  describe('Electrolyte Guidance - Keto/Low-Carb Diets', () => {
    it('should provide electrolyte guidance for keto diet', () => {
      const context = createContext({
        dietStyle: 'keto',
        age: 30
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const electrolyteGuidance = guidance.find(g => g.key === 'guidance.micronutrient.electrolyteBalance');
      
      expect(electrolyteGuidance).toBeDefined();
      expect(electrolyteGuidance?.type).toBe('info');
      expect(electrolyteGuidance?.replacements?.electrolytes).toBe('sodium, potassium, and magnesium');
      expect(electrolyteGuidance?.replacements?.reason).toContain('carbohydrate restriction');
    });

    it('should provide electrolyte guidance for low-carb diet', () => {
      const context = createContext({
        dietStyle: 'lowCarb',
        age: 30
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const electrolyteGuidance = guidance.find(g => g.key === 'guidance.micronutrient.electrolyteBalance');
      
      expect(electrolyteGuidance).toBeDefined();
    });

    it('should not provide electrolyte guidance for balanced diets', () => {
      const context = createContext({
        dietStyle: 'balanced',
        age: 30
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const electrolyteGuidance = guidance.find(g => g.key === 'guidance.micronutrient.electrolyteBalance');
      
      expect(electrolyteGuidance).toBeUndefined();
    });
  });

  describe('Vitamin D Guidance', () => {
    it('should provide vitamin D guidance for adults over 50', () => {
      const context = createContext({
        age: 55,
        sex: 'male'
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const vitDGuidance = guidance.find(g => g.key === 'guidance.micronutrient.vitaminDSupport');
      
      expect(vitDGuidance).toBeDefined();
      expect(vitDGuidance?.type).toBe('info');
      expect(vitDGuidance?.replacements?.demographic).toBe('adults over 50');
      expect(vitDGuidance?.replacements?.amount).toBe('600 IU daily');
    });

    it('should provide higher vitamin D for adults over 70', () => {
      const context = createContext({
        age: 75,
        sex: 'female'
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const vitDGuidance = guidance.find(g => g.key === 'guidance.micronutrient.vitaminDSupport');
      
      expect(vitDGuidance).toBeDefined();
      expect(vitDGuidance?.replacements?.amount).toBe('800 IU daily');
    });

    it('should provide vitamin D guidance for adult women', () => {
      const context = createContext({
        age: 30,
        sex: 'female'
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const vitDGuidance = guidance.find(g => g.key === 'guidance.micronutrient.vitaminDSupport');
      
      expect(vitDGuidance).toBeDefined();
      expect(vitDGuidance?.replacements?.demographic).toBe('adult women');
      expect(vitDGuidance?.replacements?.reason).toBe('bone health support');
    });

    it('should not provide vitamin D guidance for young men', () => {
      const context = createContext({
        age: 25,
        sex: 'male'
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const vitDGuidance = guidance.find(g => g.key === 'guidance.micronutrient.vitaminDSupport');
      
      expect(vitDGuidance).toBeUndefined();
    });
  });

  describe('Omega-3 and Calcium Guidance - Vegan Diet', () => {
    it('should provide omega-3 guidance for vegans', () => {
      const context = createContext({
        dietStyle: 'vegan'
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const omega3Guidance = guidance.find(g => g.key === 'guidance.micronutrient.omega3Sources');
      
      expect(omega3Guidance).toBeDefined();
      expect(omega3Guidance?.type).toBe('info');
      expect(omega3Guidance?.replacements?.foodSources).toContain('flax seeds');
      expect(omega3Guidance?.replacements?.supplement).toContain('algae-based');
    });

    it('should provide calcium guidance for vegans', () => {
      const context = createContext({
        dietStyle: 'vegan'
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const calciumGuidance = guidance.find(g => g.key === 'guidance.micronutrient.calciumSources');
      
      expect(calciumGuidance).toBeDefined();
      expect(calciumGuidance?.type).toBe('info');
      expect(calciumGuidance?.replacements?.sources).toContain('fortified plant milks');
      expect(calciumGuidance?.replacements?.amount).toBe('1000-1200mg daily');
    });

    it('should not provide omega-3 guidance for non-vegan diets', () => {
      const context = createContext({
        dietStyle: 'balanced'
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const omega3Guidance = guidance.find(g => g.key === 'guidance.micronutrient.omega3Sources');
      
      expect(omega3Guidance).toBeUndefined();
    });
  });

  describe('High-Protein Diet Considerations', () => {
    it('should provide hydration guidance for high-protein diets', () => {
      const context = createContext({
        dietStyle: 'highProtein'
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const hydrationGuidance = guidance.find(g => g.key === 'guidance.micronutrient.hydrationProtein');
      
      expect(hydrationGuidance).toBeDefined();
      expect(hydrationGuidance?.type).toBe('info');
      expect(hydrationGuidance?.replacements?.recommendation).toContain('hydration');
      expect(hydrationGuidance?.replacements?.reason).toBe('increased protein metabolism');
    });
  });

  describe('Creatine Guidance - Plant-Based Diets', () => {
    it('should provide creatine guidance for adult vegans', () => {
      const context = createContext({
        dietStyle: 'vegan',
        age: 25
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const creatineGuidance = guidance.find(g => g.key === 'guidance.micronutrient.creatineConsider');
      
      expect(creatineGuidance).toBeDefined();
      expect(creatineGuidance?.type).toBe('info');
      expect(creatineGuidance?.replacements?.supplement).toBe('creatine monohydrate');
      expect(creatineGuidance?.replacements?.amount).toBe('3-5g daily');
    });

    it('should provide creatine guidance for adult vegetarians', () => {
      const context = createContext({
        dietStyle: 'vegetarian',
        age: 30
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const creatineGuidance = guidance.find(g => g.key === 'guidance.micronutrient.creatineConsider');
      
      expect(creatineGuidance).toBeDefined();
    });

    it('should not provide creatine guidance for elderly vegans', () => {
      const context = createContext({
        dietStyle: 'vegan',
        age: 70
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const creatineGuidance = guidance.find(g => g.key === 'guidance.micronutrient.creatineConsider');
      
      expect(creatineGuidance).toBeUndefined();
    });

    it('should not provide creatine guidance for balanced diets', () => {
      const context = createContext({
        dietStyle: 'balanced',
        age: 25
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const creatineGuidance = guidance.find(g => g.key === 'guidance.micronutrient.creatineConsider');
      
      expect(creatineGuidance).toBeUndefined();
    });
  });

  describe('Diet x Demographic Combinations', () => {
    it('should handle young female vegan comprehensively', () => {
      const context = createContext({
        dietStyle: 'vegan',
        sex: 'female',
        age: 25
      });
      
      const guidance = generateMicronutrientGuidance(context);
      
      // Should get: B12, iron needs, iron absorption, vitamin D, omega-3, calcium, creatine
      expect(guidance).toHaveLength(7);
      expect(guidance.map(g => g.key)).toEqual(
        expect.arrayContaining([
          'guidance.micronutrient.b12Supplement',
          'guidance.micronutrient.ironNeeds',
          'guidance.micronutrient.ironAbsorption',
          'guidance.micronutrient.vitaminDSupport',
          'guidance.micronutrient.omega3Sources',
          'guidance.micronutrient.calciumSources',
          'guidance.micronutrient.creatineConsider'
        ])
      );
    });

    it('should handle elderly female vegan appropriately', () => {
      const context = createContext({
        dietStyle: 'vegan',
        sex: 'female',
        age: 70
      });
      
      const guidance = generateMicronutrientGuidance(context);
      
      // Should get: elderly B12, iron absorption, vitamin D (higher dose), omega-3, calcium
      // Should NOT get: iron needs (postmenopausal), creatine (elderly)
      expect(guidance).toHaveLength(5);
      expect(guidance.find(g => g.key === 'guidance.micronutrient.b12SupplementElderly')).toBeDefined();
      expect(guidance.find(g => g.key === 'guidance.micronutrient.ironNeeds')).toBeUndefined();
      expect(guidance.find(g => g.key === 'guidance.micronutrient.creatineConsider')).toBeUndefined();
    });

    it('should handle male vegetarian athlete scenario', () => {
      const context = createContext({
        dietStyle: 'vegetarian',
        sex: 'male',
        age: 28
      });
      
      const guidance = generateMicronutrientGuidance(context);
      
      // Should get: B12 (consider), iron absorption, creatine
      // Should NOT get: iron needs (male), vitamin D (young male), omega-3 (not vegan)
      expect(guidance).toHaveLength(3);
      expect(guidance.map(g => g.key)).toEqual(
        expect.arrayContaining([
          'guidance.micronutrient.b12Consider',
          'guidance.micronutrient.ironAbsorption',
          'guidance.micronutrient.creatineConsider'
        ])
      );
    });

    it('should handle keto diet comprehensively', () => {
      const context = createContext({
        dietStyle: 'keto',
        sex: 'male',
        age: 35
      });
      
      const guidance = generateMicronutrientGuidance(context);
      
      // Should get: electrolyte balance only
      expect(guidance).toHaveLength(1);
      expect(guidance[0].key).toBe('guidance.micronutrient.electrolyteBalance');
    });
  });

  describe('Edge Cases and Boundaries', () => {
    it('should handle exactly 50-year-old boundary for vitamin D', () => {
      const context = createContext({
        age: 50,
        sex: 'male'
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const vitDGuidance = guidance.find(g => g.key === 'guidance.micronutrient.vitaminDSupport');
      
      expect(vitDGuidance).toBeDefined();
      expect(vitDGuidance?.replacements?.demographic).toBe('adults over 50');
    });

    it('should handle exactly 65-year-old boundary for B12', () => {
      const context = createContext({
        dietStyle: 'vegan',
        age: 65
      });
      
      const guidance = generateMicronutrientGuidance(context);
      const b12Guidance = guidance.find(g => g.key === 'guidance.micronutrient.b12SupplementElderly');
      
      expect(b12Guidance).toBeDefined();
    });

    it('should handle empty guidance for minimal-risk scenario', () => {
      const context = createContext({
        dietStyle: 'balanced',
        sex: 'male',
        age: 25
      });
      
      const guidance = generateMicronutrientGuidance(context);
      
      expect(guidance).toHaveLength(0);
    });
  });

  describe('Message Structure Validation', () => {
    it('should return properly structured guidance messages', () => {
      const context = createContext({
        dietStyle: 'vegan',
        age: 30
      });
      
      const guidance = generateMicronutrientGuidance(context);
      
      guidance.forEach(message => {
        expect(message).toHaveProperty('key');
        expect(message).toHaveProperty('type');
        expect(message).toHaveProperty('category');
        expect(message.key).toMatch(/^guidance\.micronutrient\./);
        expect(['info', 'warn', 'critical']).toContain(message.type);
        expect(message.category).toBe('micronutrient');
        
        if (message.replacements) {
          expect(typeof message.replacements).toBe('object');
        }
      });
    });
  });
}); 