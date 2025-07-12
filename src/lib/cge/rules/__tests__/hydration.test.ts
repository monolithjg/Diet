import { describe, it, expect } from 'vitest';
import { generateHydrationGuidance, type HydrationContext } from '../hydration';

describe('Hydration Guidance Rules', () => {
  // Helper function to create base context
  const createContext = (overrides: Partial<HydrationContext> = {}): HydrationContext => ({
    weightKg: 70,
    palFactor: 'moderate',
    targetKcal: 2000,
    ...overrides
  });

  describe('Base Hydration Calculation (35ml/kg)', () => {
    it('should calculate correct base hydration for 70kg individual', () => {
      const context = createContext({
        weightKg: 70,
        palFactor: 'sedentary'
      });
      
      const guidance = generateHydrationGuidance(context);
      
      expect(guidance).toHaveLength(1);
      const dailyTarget = guidance.find(g => g.key === 'guidance.hydration.dailyTarget');
      
      expect(dailyTarget).toBeDefined();
      expect(dailyTarget?.replacements?.total).toBe(2.5); // (70 * 35) / 1000 = 2.45, rounded to 2.5L
      expect(dailyTarget?.replacements?.base).toBe(2.5);
      expect(dailyTarget?.replacements?.additional).toBe(0);
      expect(dailyTarget?.replacements?.reason).toBe('low activity');
    });

    it('should calculate correct base hydration for different weights', () => {
      const testCases = [
        { weight: 50, expectedBase: 1.8 }, // 50 * 35 = 1750ml = 1.8L
        { weight: 60, expectedBase: 2.1 }, // 60 * 35 = 2100ml = 2.1L
        { weight: 80, expectedBase: 2.8 }, // 80 * 35 = 2800ml = 2.8L
        { weight: 90, expectedBase: 3.2 }, // 90 * 35 = 3150ml = 3.2L (rounded)
        { weight: 100, expectedBase: 3.5 } // 100 * 35 = 3500ml = 3.5L
      ];

      testCases.forEach(({ weight, expectedBase }) => {
        const context = createContext({
          weightKg: weight,
          palFactor: 'sedentary'
        });
        
        const guidance = generateHydrationGuidance(context);
        const dailyTarget = guidance.find(g => g.key === 'guidance.hydration.dailyTarget');
        
        expect(dailyTarget?.replacements?.base).toBe(expectedBase);
      });
    });
  });

  describe('Activity Level Adjustments', () => {
    it('should provide no additional hydration for sedentary activity', () => {
      const context = createContext({
        weightKg: 70,
        palFactor: 'sedentary'
      });
      
      const guidance = generateHydrationGuidance(context);
      
      expect(guidance).toHaveLength(1);
      const dailyTarget = guidance.find(g => g.key === 'guidance.hydration.dailyTarget');
      
      expect(dailyTarget?.replacements?.additional).toBe(0);
      expect(dailyTarget?.replacements?.reason).toBe('low activity');
      expect(guidance.find(g => g.key === 'guidance.hydration.trainingExtra')).toBeUndefined();
      expect(guidance.find(g => g.key === 'guidance.hydration.electrolytesConsider')).toBeUndefined();
    });

    it('should provide no additional hydration for light activity', () => {
      const context = createContext({
        weightKg: 70,
        palFactor: 'light'
      });
      
      const guidance = generateHydrationGuidance(context);
      
      expect(guidance).toHaveLength(1);
      const dailyTarget = guidance.find(g => g.key === 'guidance.hydration.dailyTarget');
      
      expect(dailyTarget?.replacements?.additional).toBe(0);
      expect(dailyTarget?.replacements?.reason).toBe('low activity');
    });

    it('should provide +500ml for moderate activity', () => {
      const context = createContext({
        weightKg: 70,
        palFactor: 'moderate'
      });
      
      const guidance = generateHydrationGuidance(context);
      
      expect(guidance).toHaveLength(2);
      const dailyTarget = guidance.find(g => g.key === 'guidance.hydration.dailyTarget');
      const trainingExtra = guidance.find(g => g.key === 'guidance.hydration.trainingExtra');
      
      expect(dailyTarget?.replacements?.total).toBe(3.0); // 2.5L base + 0.5L = 3.0L
      expect(dailyTarget?.replacements?.additional).toBe(500);
      expect(dailyTarget?.replacements?.reason).toBe('moderate training');
      
      expect(trainingExtra).toBeDefined();
      expect(trainingExtra?.replacements?.amount).toBe(500);
      expect(trainingExtra?.replacements?.timing).toBe('during and post-workout');
    });

    it('should provide +750ml for active individuals', () => {
      const context = createContext({
        weightKg: 70,
        palFactor: 'active'
      });
      
      const guidance = generateHydrationGuidance(context);
      
      expect(guidance).toHaveLength(3); // daily target + training extra + electrolytes
      const dailyTarget = guidance.find(g => g.key === 'guidance.hydration.dailyTarget');
      const trainingExtra = guidance.find(g => g.key === 'guidance.hydration.trainingExtra');
      const electrolytes = guidance.find(g => g.key === 'guidance.hydration.electrolytesConsider');
      
      expect(dailyTarget?.replacements?.total).toBe(3.2); // 2.5L base + 0.75L = 3.25L rounded to 3.2L
      expect(dailyTarget?.replacements?.additional).toBe(750);
      expect(dailyTarget?.replacements?.reason).toBe('high training volume');
      
      expect(trainingExtra).toBeDefined();
      expect(trainingExtra?.replacements?.amount).toBe(750);
      
      expect(electrolytes).toBeDefined();
      expect(electrolytes?.replacements?.reason).toBe('high training volume and sweat loss');
    });

    it('should provide +750ml for very active individuals', () => {
      const context = createContext({
        weightKg: 70,
        palFactor: 'veryActive'
      });
      
      const guidance = generateHydrationGuidance(context);
      
      expect(guidance).toHaveLength(3); // daily target + training extra + electrolytes
      const dailyTarget = guidance.find(g => g.key === 'guidance.hydration.dailyTarget');
      const electrolytes = guidance.find(g => g.key === 'guidance.hydration.electrolytesConsider');
      
      expect(dailyTarget?.replacements?.total).toBe(3.2); // 2.5L base + 0.75L
      expect(dailyTarget?.replacements?.additional).toBe(750);
      expect(dailyTarget?.replacements?.reason).toBe('high training volume');
      
      expect(electrolytes).toBeDefined();
    });
  });

  describe('Weight × Activity Combinations', () => {
    it('should calculate correctly for small active individual', () => {
      const context = createContext({
        weightKg: 50,
        palFactor: 'active'
      });
      
      const guidance = generateHydrationGuidance(context);
      const dailyTarget = guidance.find(g => g.key === 'guidance.hydration.dailyTarget');
      
      // 50kg * 35ml = 1750ml = 1.8L base + 750ml = 2.55L rounded to 2.5L
      expect(dailyTarget?.replacements?.base).toBe(1.8);
      expect(dailyTarget?.replacements?.total).toBe(2.5);
      expect(dailyTarget?.replacements?.additional).toBe(750);
    });

    it('should calculate correctly for large moderate individual', () => {
      const context = createContext({
        weightKg: 100,
        palFactor: 'moderate'
      });
      
      const guidance = generateHydrationGuidance(context);
      const dailyTarget = guidance.find(g => g.key === 'guidance.hydration.dailyTarget');
      
      // 100kg * 35ml = 3500ml = 3.5L base + 500ml = 4.0L
      expect(dailyTarget?.replacements?.base).toBe(3.5);
      expect(dailyTarget?.replacements?.total).toBe(4.0);
      expect(dailyTarget?.replacements?.additional).toBe(500);
    });

    it('should calculate correctly for very large very active individual', () => {
      const context = createContext({
        weightKg: 120,
        palFactor: 'veryActive'
      });
      
      const guidance = generateHydrationGuidance(context);
      const dailyTarget = guidance.find(g => g.key === 'guidance.hydration.dailyTarget');
      
      // 120kg * 35ml = 4200ml = 4.2L base + 750ml = 4.95L rounded to 5.0L
      expect(dailyTarget?.replacements?.base).toBe(4.2);
      expect(dailyTarget?.replacements?.total).toBe(5.0);
      expect(dailyTarget?.replacements?.additional).toBe(750);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle missing weight gracefully', () => {
      const context = createContext({
        weightKg: undefined,
        palFactor: 'active'
      });
      
      const guidance = generateHydrationGuidance(context);
      
      expect(guidance).toHaveLength(0);
    });

    it('should handle zero weight gracefully', () => {
      const context = createContext({
        weightKg: 0,
        palFactor: 'active'
      });
      
      const guidance = generateHydrationGuidance(context);
      
      // Zero weight is treated as falsy, so returns empty array
      expect(guidance).toHaveLength(0);
    });

    it('should handle very small weight (30kg)', () => {
      const context = createContext({
        weightKg: 30,
        palFactor: 'moderate'
      });
      
      const guidance = generateHydrationGuidance(context);
      const dailyTarget = guidance.find(g => g.key === 'guidance.hydration.dailyTarget');
      
      // 30kg * 35ml = 1050ml = 1.1L base + 500ml = 1.6L
      expect(dailyTarget?.replacements?.base).toBe(1.1);
      expect(dailyTarget?.replacements?.total).toBe(1.6);
    });

    it('should handle very large weight (150kg)', () => {
      const context = createContext({
        weightKg: 150,
        palFactor: 'light'
      });
      
      const guidance = generateHydrationGuidance(context);
      const dailyTarget = guidance.find(g => g.key === 'guidance.hydration.dailyTarget');
      
      // 150kg * 35ml = 5250ml = 5.3L base + 0ml = 5.3L
      expect(dailyTarget?.replacements?.base).toBe(5.3);
      expect(dailyTarget?.replacements?.total).toBe(5.3);
      expect(dailyTarget?.replacements?.additional).toBe(0);
    });
  });

  describe('Electrolyte Guidance Triggers', () => {
    it('should not provide electrolyte guidance for low activity levels', () => {
      const lowActivityLevels = ['sedentary', 'light', 'moderate'] as const;
      
      lowActivityLevels.forEach(palFactor => {
        const context = createContext({
          weightKg: 70,
          palFactor
        });
        
        const guidance = generateHydrationGuidance(context);
        const electrolytes = guidance.find(g => g.key === 'guidance.hydration.electrolytesConsider');
        
        expect(electrolytes).toBeUndefined();
      });
    });

    it('should provide electrolyte guidance for high activity levels', () => {
      const highActivityLevels = ['active', 'veryActive'] as const;
      
      highActivityLevels.forEach(palFactor => {
        const context = createContext({
          weightKg: 70,
          palFactor
        });
        
        const guidance = generateHydrationGuidance(context);
        const electrolytes = guidance.find(g => g.key === 'guidance.hydration.electrolytesConsider');
        
        expect(electrolytes).toBeDefined();
        expect(electrolytes?.type).toBe('info');
        expect(electrolytes?.category).toBe('hydration');
        expect(electrolytes?.replacements?.reason).toBe('high training volume and sweat loss');
      });
    });
  });

  describe('Rounding and Precision', () => {
    it('should round hydration values appropriately', () => {
      const context = createContext({
        weightKg: 73, // 73 * 35 = 2555ml = 2.555L
        palFactor: 'moderate' // +500ml = 3055ml = 3.055L
      });
      
      const guidance = generateHydrationGuidance(context);
      const dailyTarget = guidance.find(g => g.key === 'guidance.hydration.dailyTarget');
      
      expect(dailyTarget?.replacements?.base).toBe(2.6); // 2.555 rounded to 2.6
      expect(dailyTarget?.replacements?.total).toBe(3.1); // 3.055 rounded to 3.1
    });

    it('should handle half-liter rounding consistently', () => {
      const context = createContext({
        weightKg: 71, // 71 * 35 = 2485ml = 2.485L
        palFactor: 'active' // +750ml = 3235ml = 3.235L
      });
      
      const guidance = generateHydrationGuidance(context);
      const dailyTarget = guidance.find(g => g.key === 'guidance.hydration.dailyTarget');
      
      expect(dailyTarget?.replacements?.base).toBe(2.5); // 2.485 rounded to 2.5
      expect(dailyTarget?.replacements?.total).toBe(3.2); // 3.235 rounded to 3.2
    });
  });

  describe('Message Structure Validation', () => {
    it('should return properly structured guidance messages', () => {
      const context = createContext({
        weightKg: 70,
        palFactor: 'active'
      });
      
      const guidance = generateHydrationGuidance(context);
      
      guidance.forEach(message => {
        expect(message).toHaveProperty('key');
        expect(message).toHaveProperty('type');
        expect(message).toHaveProperty('category');
        expect(message.key).toMatch(/^guidance\.hydration\./);
        expect(['info', 'warn', 'critical']).toContain(message.type);
        expect(message.category).toBe('hydration');
        
        if (message.replacements) {
          expect(typeof message.replacements).toBe('object');
        }
      });
    });

    it('should use consistent message types', () => {
      const context = createContext({
        weightKg: 70,
        palFactor: 'veryActive'
      });
      
      const guidance = generateHydrationGuidance(context);
      
      // All hydration guidance should be 'info' level
      guidance.forEach(message => {
        expect(message.type).toBe('info');
      });
    });
  });

  describe('Integration Context Validation', () => {
    it('should handle all required context fields', () => {
      const fullContext: HydrationContext = {
        weightKg: 75,
        palFactor: 'moderate',
        targetKcal: 2200
      };
      
      expect(() => generateHydrationGuidance(fullContext)).not.toThrow();
      
      const guidance = generateHydrationGuidance(fullContext);
      expect(guidance.length).toBeGreaterThan(0);
    });

    it('should work with minimal required context', () => {
      const minimalContext: HydrationContext = {
        palFactor: 'sedentary',
        targetKcal: 1800
        // weightKg is optional and missing
      };
      
      expect(() => generateHydrationGuidance(minimalContext)).not.toThrow();
      
      const guidance = generateHydrationGuidance(minimalContext);
      expect(guidance).toHaveLength(0); // Should return empty array when weight is missing
    });
  });
}); 