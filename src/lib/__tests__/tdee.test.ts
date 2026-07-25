import { describe, it, expect } from 'vitest';
import { 
  calcTdee, 
  UnrealisticCalorieError 
} from '../tdee';
import type { PalKey } from '../tdee';
import { InputRangeError } from '../errors';

describe('TDEE Calculations', () => {
  // TC-T1: Basic TDEE calculation with no goal
  it('TC-T1: calculates TDEE for moderate activity with balanced diet', () => {
    const result = calcTdee({
      rmr: 1650,
      pal: 'moderate',
      dietStyle: 'balanced'
    });
    
    // PAL-based maintenance already includes the thermic effect in population estimates.
    expect(result.tdee).toBeCloseTo(2557.5, 2);
    expect(result.palFactor).toBe(1.55);
    expect(result.tef).toBeCloseTo(255.75, 2);
    expect(result.adjustedCalories).toBeCloseTo(2557.5, 2);
  });

  // TC-T2: TDEE with 20% deficit
  it('TC-T2: calculates TDEE with a deficit goal', () => {
    const result = calcTdee({
      rmr: 1650,
      pal: 'moderate',
      dietStyle: 'balanced',
      goalPct: -0.20
    });
    
    expect(result.tdee).toBeCloseTo(2557.5, 2);
    expect(result.adjustedCalories).toBeCloseTo(2046, 1);
  });

  // TC-T3: High protein diet with active lifestyle
  it('TC-T3: calculates TDEE for active lifestyle with high protein diet', () => {
    const result = calcTdee({
      rmr: 2000,
      pal: 'active',
      dietStyle: 'highProtein'
    });
    
    expect(result.tdee).toBeCloseTo(3450, 1);
    expect(result.palFactor).toBe(1.725);
    expect(result.tef).toBeCloseTo(517.5, 1); // 15% of (2000 * 1.725)
    expect(result.adjustedCalories).toBeCloseTo(3450, 1);
  });

  // TC-T4: Keto diet with sedentary lifestyle and weight gain goal
  it('TC-T4: calculates TDEE for sedentary lifestyle with keto diet and surplus', () => {
    const result = calcTdee({
      rmr: 1400,
      pal: 'sedentary',
      dietStyle: 'keto',
      goalPct: 0.10
    });
    
    expect(result.tdee).toBeCloseTo(1680, 1);
    expect(result.palFactor).toBe(1.2);
    expect(result.tef).toBeCloseTo(201.6, 1); // 12% of (1400 * 1.2)
    expect(result.adjustedCalories).toBeCloseTo(1848, 2);
  });

  // Test custom TEF override
  it('respects manual TEF percentage override', () => {
    const result = calcTdee({
      rmr: 1650,
      pal: 'moderate',
      dietStyle: 'balanced',
      tefPct: 0.18 // 18% instead of default 10%
    });
    
    // TEF is retained as an explanatory component, not added to PAL-based TDEE.
    const baseTdee = 1650 * 1.55;
    const expectedTef = baseTdee * 0.18;
    
    expect(result.tef).toBeCloseTo(expectedTef, 2);
    expect(result.tdee).toBeCloseTo(baseTdee, 2);
  });

  // Test body composition safety for low body fat
  it('caps deficit for low body fat individuals when safety is enabled', () => {
    const result = calcTdee({
      rmr: 1650,
      pal: 'moderate',
      dietStyle: 'balanced',
      goalPct: -0.30, // 30% deficit
      bodyFatPct: 10, // low for male
      sex: 'male'
    }, { bodyCompSafety: true });
    
    const expectedTdee = 2557.5;
    const cappedAdjusted = expectedTdee * 0.85; // 15% deficit
    
    expect(result.tdee).toBeCloseTo(expectedTdee, 2);
    expect(result.adjustedCalories).toBeCloseTo(cappedAdjusted, 2);
  });

  // Test minimum safe calories
  it('throws an error when calories are too low for safety', () => {
    expect(() => {
      calcTdee({
        rmr: 1000,
        pal: 'sedentary',
        dietStyle: 'balanced',
        goalPct: -0.40, // 40% deficit
        sex: 'female',
        bodyFatPct: 25 // Adding this to ensure the safety check runs
      }, { bodyCompSafety: true });
    }).toThrow(UnrealisticCalorieError);
  });

  it('enforces minimum safe calories even when body fat is not provided', () => {
    expect(() => {
      calcTdee({
        rmr: 1000,
        pal: 'sedentary',
        dietStyle: 'balanced',
        goalPct: -0.40,
        sex: 'female'
      }, { bodyCompSafety: true });
    }).toThrow(UnrealisticCalorieError);
  });

  // Error cases
  describe('Error Handling', () => {
    // Edge E1: Goal out of range
    it('E1: throws error for goal percentage out of range', () => {
      expect(() => {
        calcTdee({
          rmr: 1650,
          pal: 'moderate',
          dietStyle: 'balanced',
          goalPct: -0.50 // Out of range (-50%)
        });
      }).toThrow(InputRangeError);
    });

    // Edge E2: TEF out of range
    it('E2: throws error for TEF percentage out of range', () => {
      expect(() => {
        calcTdee({
          rmr: 1650,
          pal: 'moderate',
          dietStyle: 'balanced',
          tefPct: 0.03 // Out of range (3%)
        });
      }).toThrow(InputRangeError);
    });

    // Missing required fields
    it('throws error for missing RMR', () => {
      expect(() => {
        calcTdee({
          rmr: undefined as unknown as number,
          pal: 'moderate',
          dietStyle: 'balanced'
        });
      }).toThrow();
    });

    it('throws error for missing PAL', () => {
      expect(() => {
        calcTdee({
          rmr: 1650,
          pal: undefined as unknown as PalKey,
          dietStyle: 'balanced'
        });
      }).toThrow();
    });
  });

  // Snapshot test for golden values
  it('golden outputs snapshot', () => {
    const snapshot = {
      moderateBalanced: calcTdee({
        rmr: 1650,
        pal: 'moderate',
        dietStyle: 'balanced'
      }),
      activeHighProtein: calcTdee({
        rmr: 2000,
        pal: 'active',
        dietStyle: 'highProtein'
      }),
      sedentaryKetoSurplus: calcTdee({
        rmr: 1400,
        pal: 'sedentary',
        dietStyle: 'keto',
        goalPct: 0.10
      })
    };
    
    expect(snapshot).toMatchSnapshot();
  });
}); 
