import { describe, it, expect } from 'vitest';
import { generateContextualGuidance, type CGEInput } from '../engine';

describe('Micronutrient Rules - CGE Integration', () => {
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
    weightKg: 65,
    bodyFatPct: 20,
    ...overrides
  });

  describe('MIC-1 Integration with Full Engine', () => {
    it('should generate micronutrient guidance through full CGE orchestrator', () => {
      const input = createInput({
        dietStyle: 'vegan',
        sex: 'female',
        age: 25
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Filter micronutrient messages
      const microGuidance = allGuidance.filter(g => g.category === 'micronutrient');
      
      // Should include B12 and iron guidance (MIC-1 compliance)
      const keys = microGuidance.map(g => g.key);
      expect(keys).toContain('guidance.micronutrient.b12Supplement');
      expect(keys).toContain('guidance.micronutrient.ironAbsorption');
      
      // Verify medical disclaimer is included when guidance exists
      const disclaimer = allGuidance.find(g => g.key === 'disclaimer.medical');
      expect(disclaimer).toBeDefined();
      expect(disclaimer?.category).toBe('validation');
    });
  });

  describe('Priority and Deduplication with Micronutrients', () => {
    it('should properly prioritize micronutrient guidance with other categories', () => {
      const input = createInput({
        dietStyle: 'vegan',
        sex: 'female',
        age: 25,
        goal: 'gain',
        workoutTime: 'am'
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Should have mix of meal timing and micronutrient guidance
      const categories = allGuidance.map(g => g.category);
      expect(categories).toContain('mealTiming');
      expect(categories).toContain('micronutrient');
      
      // B12 guidance should be present (warn level)
      const b12Guidance = allGuidance.find(g => 
        g.key === 'guidance.micronutrient.b12Supplement'
      );
      expect(b12Guidance).toBeDefined();
      expect(b12Guidance?.type).toBe('warn');
      
      // Should not exceed max 5 guidance messages + disclaimer
      expect(allGuidance.filter(g => g.key !== 'disclaimer.medical')).toHaveLength(5);
    });

    it('should handle elderly vegan scenario with priority sorting', () => {
      const input = createInput({
        dietStyle: 'vegan',
        sex: 'female',
        age: 70
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Should prioritize elderly B12 guidance (warn level)
      const elderlyB12 = allGuidance.find(g => 
        g.key === 'guidance.micronutrient.b12SupplementElderly'
      );
      expect(elderlyB12).toBeDefined();
      expect(elderlyB12?.type).toBe('warn');
      
      // Should appear early in guidance list due to warn priority
      const nonDisclaimerGuidance = allGuidance.filter(g => g.key !== 'disclaimer.medical');
      const b12Index = nonDisclaimerGuidance.findIndex(g => 
        g.key === 'guidance.micronutrient.b12SupplementElderly'
      );
      expect(b12Index).toBeGreaterThanOrEqual(0);
      expect(b12Index).toBeLessThan(3); // Should be in top 3 due to warn priority
    });
  });

  describe('Micronutrient + Other Rules Integration', () => {
    it('should combine micronutrient guidance with hydration rules', () => {
      const input = createInput({
        dietStyle: 'keto',
        weightKg: 70,
        pal: 'active'
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Should have both electrolyte and hydration guidance
      const electrolyteGuidance = allGuidance.find(g => 
        g.key === 'guidance.micronutrient.electrolyteBalance'
      );
      const hydrationGuidance = allGuidance.find(g => 
        g.category === 'hydration'
      );
      
      expect(electrolyteGuidance).toBeDefined();
      expect(hydrationGuidance).toBeDefined();
      
      // Hydration and electrolyte guidance complement each other for keto
      expect(electrolyteGuidance?.replacements?.electrolytes).toContain('sodium');
      expect(hydrationGuidance?.key).toMatch(/hydration/);
    });

    it('should handle high-protein diet with comprehensive guidance', () => {
      const input = createInput({
        dietStyle: 'highProtein',
        weightKg: 80,
        pal: 'moderate'
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Should include protein hydration guidance
      const proteinHydration = allGuidance.find(g => 
        g.key === 'guidance.micronutrient.hydrationProtein'
      );
      expect(proteinHydration).toBeDefined();
      
      // Should also include general hydration guidance
      const generalHydration = allGuidance.find(g => 
        g.category === 'hydration' && !g.key.includes('micronutrient')
      );
      expect(generalHydration).toBeDefined();
    });
  });

  describe('Age and Diet Interaction Scenarios', () => {
    it('should handle complex vegetarian athlete scenario', () => {
      const input = createInput({
        dietStyle: 'vegetarian',
        sex: 'male',
        age: 28,
        goal: 'gain',
        workoutTime: 'pm'
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Should include vegetarian-specific micronutrients
      const microGuidance = allGuidance.filter(g => g.category === 'micronutrient');
      const keys = microGuidance.map(g => g.key);
      
      expect(keys).toContain('guidance.micronutrient.b12Consider');
      expect(keys).toContain('guidance.micronutrient.ironAbsorption');
      
      // Note: Creatine guidance may be filtered due to max 5 guidance limit
      // Since meal timing has priority for muscle gain goals
      expect(microGuidance.length).toBeGreaterThanOrEqual(2);
      
      // Should also include meal timing for muscle gain
      const mealTiming = allGuidance.filter(g => g.category === 'mealTiming');
      expect(mealTiming.length).toBeGreaterThan(0);
    });

    it('should handle minimal guidance scenario for low-risk individual', () => {
      const input = createInput({
        dietStyle: 'balanced',
        sex: 'male',
        age: 25,
        weightKg: 75
      });
      
      const allGuidance = generateContextualGuidance(input);
      
      // Should have minimal micronutrient guidance
      const microGuidance = allGuidance.filter(g => g.category === 'micronutrient');
      expect(microGuidance).toHaveLength(0);
      
      // Should still include disclaimer if any guidance exists
      if (allGuidance.length > 0) {
        const disclaimer = allGuidance.find(g => g.key === 'disclaimer.medical');
        expect(disclaimer).toBeDefined();
      }
    });
  });

  describe('Integration Build Verification', () => {
    it('should generate consistent guidance across multiple calls', () => {
      const input = createInput({
        dietStyle: 'vegan',
        sex: 'female',
        age: 30
      });
      
      const guidance1 = generateContextualGuidance(input);
      const guidance2 = generateContextualGuidance(input);
      
      // Results should be deterministic
      expect(guidance1).toEqual(guidance2);
      
      // Should include expected micronutrient guidance
      const microKeys1 = guidance1.filter(g => g.category === 'micronutrient').map(g => g.key);
      const microKeys2 = guidance2.filter(g => g.category === 'micronutrient').map(g => g.key);
      
      expect(microKeys1).toEqual(microKeys2);
      expect(microKeys1).toContain('guidance.micronutrient.b12Supplement');
    });

    it('should handle all diet styles without errors', () => {
      const dietStyles: Array<CGEInput['dietStyle']> = [
        'balanced', 'highProtein', 'keto', 'lowCarb', 'vegan', 'vegetarian'
      ];
      
      dietStyles.forEach(dietStyle => {
        const input = createInput({ dietStyle });
        
        expect(() => generateContextualGuidance(input)).not.toThrow();
        
        const guidance = generateContextualGuidance(input);
        
        // All guidance should have proper structure
        guidance.forEach(message => {
          expect(message).toHaveProperty('key');
          expect(message).toHaveProperty('type');
          expect(message).toHaveProperty('category');
          expect(['info', 'warn', 'critical']).toContain(message.type);
        });
      });
    });
  });
}); 