import { describe, it, expect } from 'vitest';
import { allocateMacros, MacroConflictError } from '../macros';
import type { MacroInput } from '../macros';

/**
 * Helper function to compare values with tolerance
 */
function expectClose(actual: number, expected: number, tolerance = 0.1): void {
  expect(actual).toBeGreaterThanOrEqual(expected - tolerance);
  expect(actual).toBeLessThanOrEqual(expected + tolerance);
}

describe('Macronutrient Allocation Engine', () => {
  // Golden test cases
  describe('Golden cases', () => {
    it('G-1: Balanced default distribution', () => {
      const input: MacroInput = {
        targetKcal: 2500,
        weightKg: 80,
        bodyFatPct: 20,
        dietStyle: 'balanced',
        goal: 'maintain'
      };
      
      const result = allocateMacros(input);
      
      // Balanced defaults allocate 20% protein, 30% fat, and the remainder to carbs.
      expectClose(result.proteinG, 125, 2);
      expectClose(result.fatG, 83, 2);
      expectClose(result.carbG, 313, 3);
      
      // Check percentages are roughly correct
      expectClose(result.proteinPct, 0.2, 0.02);
      expectClose(result.fatPct, 0.3, 0.02);
      expectClose(result.carbPct, 0.5, 0.02);
      
      // No critical guidance expected
      expect(result.guidance.filter(g => g.type === 'critical').length).toBe(0);
    });
    
    it('G-2: Keto distribution', () => {
      const input: MacroInput = {
        targetKcal: 2200,
        weightKg: 75,
        bodyFatPct: 15,
        dietStyle: 'keto',
        goal: 'maintain'
      };
      
      const result = allocateMacros(input);
      
      // Expected: P floor 123 g, F ≈ 171 g (70%), C ≤ 50 g
      const lbm = 75 * (1 - 15/100); // 63.75 kg
      const expectedProteinFloor = lbm * 0.8; // Minimum 0.8g/kg LBM
      
      expect(result.proteinG).toBeGreaterThanOrEqual(expectedProteinFloor);
      expectClose(result.fatG, 171, 5);
      expect(result.carbG).toBeLessThanOrEqual(50);
      
      // Verify that protein and fat together make up ≈ 90% of calories
      const proteinFatPct = result.proteinPct + result.fatPct;
      expectClose(proteinFatPct, 0.9, 0.02);
      
      // No critical guidance expected for proper keto
      expect(result.guidance.filter(g => g.key === 'carb_keto_break').length).toBe(0);
    });
    
    it('G-3: High-protein override', () => {
      const input: MacroInput = {
        targetKcal: 2400,
        weightKg: 75,
        bodyFatPct: 15,
        dietStyle: 'balanced',
        goal: 'gain',
        custom: {
          proteinG: 250
        }
      };
      
      const result = allocateMacros(input);
      
      // Engine should keep 250g protein, trim carbs first
      expect(result.proteinG).toBe(250);
      
      // Fat should not be below floor
      const minFatG = 0.3 * 75; // 0.3g/kg bodyweight
      expect(result.fatG).toBeGreaterThanOrEqual(minFatG);
      
      // Total calories should be close to target
      const totalCalories = 
        result.proteinG * 4 + 
        result.fatG * 9 + 
        result.carbG * 4;
      
      expectClose(totalCalories, 2400, 50);
      
      // Should have high protein guidance
      expect(result.guidance.some(g => g.key === 'prot_high')).toBe(true);
    });
  });
  
  // Edge cases
  describe('Edge cases', () => {
    it('E-1: Protein override below floor', () => {
      const input: MacroInput = {
        targetKcal: 2000,
        weightKg: 70,
        bodyFatPct: 20,
        dietStyle: 'balanced',
        goal: 'maintain',
        custom: {
          proteinG: 30 // Below the lean-mass-based floor
        }
      };
      
      const result = allocateMacros(input);
      
      // Minimum protein should be enforced (LBM ~ 56kg, min = 0.8g/kg = ~45g)
      const lbm = 70 * 0.8;
      const minProtein = lbm * 0.8; // 0.8g/kg LBM
      expect(result.proteinG).toBeGreaterThanOrEqual(minProtein);
      
      // Should have guidance about protein being raised
      expect(result.guidance.some(g => g.key === 'proteinFloorRaised')).toBe(true);
      expect(result.guidance.some(g => g.key === 'prot_low_general')).toBe(true);
    });
    
    it('E-2: Unsatisfiable constraints throws MacroConflictError', () => {
      const input: MacroInput = {
        targetKcal: 1200, // Very low calories
        weightKg: 80,
        bodyFatPct: 20,
        dietStyle: 'keto',
        goal: 'loss',
        custom: {
          proteinG: 250 // Too high once minimum fat is also enforced
        }
      };
      
      // Should throw MacroConflictError
      expect(() => allocateMacros(input)).toThrow(MacroConflictError);
    });
    
    it('E-3: does not infer fiber intake from carbohydrate grams', () => {
      const input: MacroInput = {
        targetKcal: 2000,
        weightKg: 70,
        bodyFatPct: 15,
        dietStyle: 'keto', // Very low carb
        goal: 'loss'
      };
      
      const result = allocateMacros(input);
      
      expect(result.guidance.some(g => g.key === 'fiber_low')).toBe(false);
    });
  });
  
  // Additional test cases
  describe('Additional cases', () => {
    it('Validates input parameters', () => {
      // Missing target calories
      expect(() => 
        allocateMacros({
          targetKcal: 0, // Invalid
          weightKg: 70,
          dietStyle: 'balanced',
          goal: 'maintain'
        })
      ).toThrow();
      
      // Missing weight
      expect(() => 
        allocateMacros({
          targetKcal: 2000,
          weightKg: 0, // Invalid
          dietStyle: 'balanced',
          goal: 'maintain'
        })
      ).toThrow();
      
      // Invalid body fat percentage
      expect(() => 
        allocateMacros({
          targetKcal: 2000,
          weightKg: 70,
          bodyFatPct: 100, // Invalid
          dietStyle: 'balanced',
          goal: 'maintain'
        })
      ).toThrow();
    });
    
    it('Handles low calorie diets correctly', () => {
      const input: MacroInput = {
        targetKcal: 1300, // Very low calories
        weightKg: 60,
        bodyFatPct: 25,
        dietStyle: 'balanced',
        goal: 'loss'
      };
      
      const result = allocateMacros(input);
      
      // Should prioritize protein and essential fats
      const lbm = 60 * (1 - 25/100); // 45 kg
      const minProtein = lbm * 0.8; // ~36g
      const minFat = 60 * 0.3; // ~18g
      
      expect(result.proteinG).toBeGreaterThanOrEqual(minProtein);
      expect(result.fatG).toBeGreaterThanOrEqual(minFat);
      
      // Total calories should be close to target
      const totalCalories = 
        result.proteinG * 4 + 
        result.fatG * 9 + 
        result.carbG * 4;
      
      expectClose(totalCalories, 1300, 50);
    });
    
    it('Handles very high protein diet correctly', () => {
      const input: MacroInput = {
        targetKcal: 3000,
        weightKg: 90,
        bodyFatPct: 10,
        dietStyle: 'highProtein',
        goal: 'gain'
      };
      
      const result = allocateMacros(input);
      
      // For a 90kg person at 10% body fat (81kg LBM), target protein range for muscle gain
      // would be 1.8-2.4 g/kg LBM = 146-194g protein
      const lbm = 90 * (1 - 10/100); // 81 kg
      const targetProteinMin = lbm * 1.8; // ~146g
      
      expect(result.proteinG).toBeGreaterThanOrEqual(targetProteinMin);
      expect(result.proteinPct).toBeGreaterThanOrEqual(0.25); // High protein diet
      
      // Total calories should be close to target
      const totalCalories = 
        result.proteinG * 4 + 
        result.fatG * 9 + 
        result.carbG * 4;
      
      expectClose(totalCalories, 3000, 50);
    });
    
    it('Handles custom macros correctly', () => {
      const input: MacroInput = {
        targetKcal: 2200,
        weightKg: 75,
        dietStyle: 'balanced',
        goal: 'maintain',
        custom: {
          proteinG: 120,
          fatG: 80
          // carbG omitted - should be calculated automatically
        }
      };
      
      const result = allocateMacros(input);
      
      // Should respect custom values
      expect(result.proteinG).toBe(120);
      expect(result.fatG).toBe(80);
      
      // Carbs should fill the remaining calories
      const proteinFatCalories = 120 * 4 + 80 * 9;
      const remainingCalories = 2200 - proteinFatCalories;
      const expectedCarbsG = remainingCalories / 4;
      
      expectClose(result.carbG, expectedCarbsG, 1);
      
      // Total calories should be close to target
      const totalCalories = 
        result.proteinG * 4 + 
        result.fatG * 9 + 
        result.carbG * 4;
      
      expectClose(totalCalories, 2200, 50);
    });
  });
});
