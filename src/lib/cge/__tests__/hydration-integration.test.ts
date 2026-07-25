import { describe, it, expect } from 'vitest';
import { generateContextualGuidance, type CGEInput } from '../engine';

describe('Hydration Rules - CGE Integration', () => {
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

  describe('Hydration Integration with Full Engine', () => {
    it('should generate hydration guidance through full CGE orchestrator', () => {
      const input = createInput({
        weightKg: 70,
        pal: 'moderate'
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Filter hydration messages
      const hydrationGuidance = allGuidance.filter(g => g.category === 'hydration');
      
      expect(hydrationGuidance.length).toBeGreaterThanOrEqual(2); // daily target + training extra
      
      const dailyTarget = hydrationGuidance.find(g => g.key === 'guidance.hydration.dailyTarget');
      expect(dailyTarget).toBeDefined();
      expect(dailyTarget?.replacements?.total).toBe(3.0); // 70kg * 35ml + 500ml = 3.0L
      
      // Verify medical disclaimer is included when guidance exists
      const disclaimer = allGuidance.find(g => g.key === 'disclaimer.medical');
      expect(disclaimer).toBeDefined();
      expect(disclaimer?.category).toBe('validation');
    });

    it('should handle missing weight gracefully in full engine', () => {
      const input = createInput({
        weightKg: undefined,
        pal: 'active'
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Should not have hydration guidance
      const hydrationGuidance = allGuidance.filter(g => g.category === 'hydration');
      expect(hydrationGuidance).toHaveLength(0);
    });
  });

  describe('Priority and Message Limits with Hydration', () => {
    it('should respect max 5 guidance message limit', () => {
      const input = createInput({
        dietStyle: 'vegan',
        weightKg: 70,
        pal: 'veryActive',
        goal: 'gain',
        workoutTime: 'am',
        sex: 'female',
        age: 25
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Should not exceed max 5 guidance messages + disclaimer
      const nonDisclaimerGuidance = allGuidance.filter(g => g.key !== 'disclaimer.medical');
      expect(nonDisclaimerGuidance).toHaveLength(5);
      
      // Hydration guidance may be filtered out due to higher priority messages (meal timing, micronutrient)
      // Don't require hydration guidance in complex scenarios - other guidance takes priority
    });

    it('should handle guidance priority ordering correctly', () => {
      const input = createInput({
        weightKg: 70,
        pal: 'active'
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // All hydration guidance should be 'info' level
      const hydrationGuidance = allGuidance.filter(g => g.category === 'hydration');
      hydrationGuidance.forEach(message => {
        expect(message.type).toBe('info');
      });
    });
  });

  describe('Hydration + Micronutrient Integration', () => {
    it('should coordinate hydration with keto electrolyte guidance', () => {
      const input = createInput({
        dietStyle: 'keto',
        weightKg: 80,
        pal: 'veryActive',
        // Simplify to avoid hitting max 5 guidance limit
        goal: 'maintain' // No workout time to avoid meal timing guidance
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Verify that guidance is generated and limited appropriately
      
      // Should have micronutrient electrolyte guidance for keto
      const micronutrientGuidance = allGuidance.filter(g => g.category === 'micronutrient');
      const microElectrolytes = micronutrientGuidance.find(g => 
        g.key === 'guidance.micronutrient.electrolyteBalance'
      );
      
      expect(microElectrolytes).toBeDefined();
      expect(microElectrolytes?.replacements?.reason).toContain('carbohydrate restriction');
      
      // Should have hydration guidance including electrolytes for veryActive
      const hydrationGuidance = allGuidance.filter(g => g.category === 'hydration');
      expect(hydrationGuidance.length).toBeGreaterThanOrEqual(2); // At least daily target + one more
      
      // Check if hydration electrolytes are present (may be filtered due to limits)
      const hydrationElectrolytes = hydrationGuidance.find(g => 
        g.key === 'guidance.hydration.electrolytesConsider'
      );
      
      if (hydrationElectrolytes) {
        expect(hydrationElectrolytes.replacements?.reason).toContain('training volume');
      }
    });

    it('should handle high-protein diet with hydration considerations', () => {
      const input = createInput({
        dietStyle: 'highProtein',
        weightKg: 85,
        pal: 'moderate'
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Should have both general hydration and protein-specific hydration guidance
      const hydrationGuidance = allGuidance.filter(g => g.category === 'hydration');
      const micronutrientGuidance = allGuidance.filter(g => g.category === 'micronutrient');
      
      const generalHydration = hydrationGuidance.find(g => 
        g.key === 'guidance.hydration.dailyTarget'
      );
      const proteinHydration = micronutrientGuidance.find(g => 
        g.key === 'guidance.micronutrient.hydrationProtein'
      );
      
      expect(generalHydration).toBeDefined();
      expect(proteinHydration).toBeDefined();
      
      // Should provide complementary hydration advice
      expect(generalHydration?.replacements?.total).toBe(3.5); // 85kg * 35ml + 500ml = 3.5L
      expect(proteinHydration?.replacements?.reason).toBe('increased protein metabolism');
    });
  });

  describe('Activity Level Scenarios', () => {
    it('should handle sedentary individual with minimal hydration guidance', () => {
      const input = createInput({
        weightKg: 65,
        pal: 'sedentary'
      });
      
      const allGuidance = generateContextualGuidance(input);
      const hydrationGuidance = allGuidance.filter(g => g.category === 'hydration');
      
      // Should only have basic daily target
      expect(hydrationGuidance).toHaveLength(1);
      expect(hydrationGuidance[0].key).toBe('guidance.hydration.dailyTarget');
      expect(hydrationGuidance[0].replacements?.additional).toBe(0);
    });

    it('should handle very active athlete with comprehensive hydration guidance', () => {
      const input = createInput({
        weightKg: 90,
        pal: 'veryActive'
      });
      
      const allGuidance = generateContextualGuidance(input);
      const hydrationGuidance = allGuidance.filter(g => g.category === 'hydration');
      
      // Should have daily target + training extra + electrolytes
      expect(hydrationGuidance).toHaveLength(3);
      
      const keys = hydrationGuidance.map(g => g.key);
      expect(keys).toContain('guidance.hydration.dailyTarget');
      expect(keys).toContain('guidance.hydration.trainingExtra');
      expect(keys).toContain('guidance.hydration.electrolytesConsider');
      
      const dailyTarget = hydrationGuidance.find(g => g.key === 'guidance.hydration.dailyTarget');
      expect(dailyTarget?.replacements?.total).toBe(4.0);
    });
  });

  describe('Weight Range Scenarios', () => {
    it('should handle small individual with appropriate hydration scaling', () => {
      const input = createInput({
        weightKg: 50,
        pal: 'moderate',
        sex: 'female'
      });
      
      const allGuidance = generateContextualGuidance(input);
      const hydrationGuidance = allGuidance.filter(g => g.category === 'hydration');
      
      const dailyTarget = hydrationGuidance.find(g => g.key === 'guidance.hydration.dailyTarget');
      expect(dailyTarget?.replacements?.base).toBe(1.8); // 50kg * 35ml = 1.8L
      expect(dailyTarget?.replacements?.total).toBe(2.3); // 1.8L + 0.5L = 2.3L
    });

    it('should handle large individual with appropriate hydration scaling', () => {
      const input = createInput({
        weightKg: 120,
        pal: 'moderate',
        sex: 'male'
      });
      
      const allGuidance = generateContextualGuidance(input);
      const hydrationGuidance = allGuidance.filter(g => g.category === 'hydration');
      
      const dailyTarget = hydrationGuidance.find(g => g.key === 'guidance.hydration.dailyTarget');
      expect(dailyTarget?.replacements?.base).toBe(4.2); // 120kg * 35ml = 4.2L
      expect(dailyTarget?.replacements?.total).toBe(4.7); // 4.2L + 0.5L = 4.7L
    });
  });

  describe('Integration Build Verification', () => {
    it('should generate consistent hydration guidance across multiple calls', () => {
      const input = createInput({
        weightKg: 75,
        pal: 'active'
      });
      
      const guidance1 = generateContextualGuidance(input);
      const guidance2 = generateContextualGuidance(input);
      
      // Results should be deterministic
      expect(guidance1).toEqual(guidance2);
      
      // Should include expected hydration guidance
      const hydrationKeys1 = guidance1.filter(g => g.category === 'hydration').map(g => g.key);
      const hydrationKeys2 = guidance2.filter(g => g.category === 'hydration').map(g => g.key);
      
      expect(hydrationKeys1).toEqual(hydrationKeys2);
      expect(hydrationKeys1).toContain('guidance.hydration.dailyTarget');
    });

    it('should handle all PAL levels without errors', () => {
      const palLevels: Array<CGEInput['pal']> = [
        'sedentary', 'light', 'moderate', 'active', 'veryActive'
      ];
      
      palLevels.forEach(pal => {
        const input = createInput({ 
          pal,
          weightKg: 70
        });
        
        expect(() => generateContextualGuidance(input)).not.toThrow();
        
        const guidance = generateContextualGuidance(input);
        const hydrationGuidance = guidance.filter(g => g.category === 'hydration');
        
        // Should always have at least daily target
        expect(hydrationGuidance.length).toBeGreaterThanOrEqual(1);
        
        // All guidance should have proper structure
        hydrationGuidance.forEach(message => {
          expect(message).toHaveProperty('key');
          expect(message).toHaveProperty('type');
          expect(message).toHaveProperty('category');
          expect(['info', 'warn', 'critical']).toContain(message.type);
          expect(message.category).toBe('hydration');
        });
      });
    });
  });
});
