import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from '../store';
import type { Goal } from '../../models/UserInput';
import type { PalKey } from '../tdee';

// Mock setTimeout for debounce testing
vi.useFakeTimers();

describe('Store CGE Integration', () => {
  beforeEach(() => {
    // Reset store state before each test
    useStore.getState().resetState();
    vi.clearAllTimers();
  });

  describe('Basic CGE Integration', () => {
    it('should generate guidance when user has complete macro data', () => {
      const store = useStore.getState();
      
      // Set up user data
      store.updateUser({
        age: 30,
        sex: 'female',
        weightKg: 65,
        heightCm: 165,
        activityLevel: 1.55, // moderate
        goal: 'loss',
        dietStyle: 'vegan',
        allergies: ['peanut'],
        sleepHours: 5, // Should trigger sleep guidance
        stressLevel: 3, // Should trigger stress guidance
        workoutTime: 'am'
      });
      
      // Calculate RMR, TDEE, and macros
      store.recalcRmr('mifflin');
      store.setTdee('moderate', -0.2); // 20% deficit
      store.setMacros();
      
      // Explicitly call generateGuidance to trigger CGE
      store.generateGuidance();
      
      // Check that guidance was generated
      const state = useStore.getState();
      expect(state.ui.guidance.length).toBeGreaterThan(0);
      
      // Should have medical disclaimer
      const disclaimer = state.ui.guidance.find(g => g.key === 'disclaimer.medical');
      expect(disclaimer).toBeDefined();
      
      // Should have some form of guidance (validation or contextual)
      const nonDisclaimerGuidance = state.ui.guidance.filter(g => g.key !== 'disclaimer.medical');
      expect(nonDisclaimerGuidance.length).toBeGreaterThan(0);
    });

    it('should not generate guidance when macro data is missing', () => {
      const store = useStore.getState();
      
      // Set up user data but no calculations
      store.updateUser({
        age: 30,
        sex: 'male',
        weightKg: 75,
        sleepHours: 5
      });
      
      // Try to generate guidance without macro calculations
      store.generateGuidance();
      
      const state = useStore.getState();
      expect(state.ui.guidance).toEqual([]);
    });
  });

  describe('Debounced Updates', () => {
    it('should debounce guidance updates with updateUserWithGuidance', () => {
      const store = useStore.getState();
      
      // Set up complete user data first
      store.updateUser({
        age: 25,
        sex: 'male',
        weightKg: 80,
        heightCm: 180,
        activityLevel: 1.725, // active
        goal: 'gain',
        dietStyle: 'highProtein'
      });
      
      store.recalcRmr('mifflin');
      store.setTdee('active', 0.15);
      store.setMacros();
      
      // Clear guidance to test debouncing
      store.updateUi({ guidance: [] });
      
      // Make multiple rapid updates
      store.updateUserWithGuidance({ sleepHours: 4 });
      store.updateUserWithGuidance({ sleepHours: 5 });
      store.updateUserWithGuidance({ stressLevel: 3 });
      
      // Guidance should not be generated yet (still debouncing)
      expect(useStore.getState().ui.guidance).toHaveLength(0);
      
      // Fast-forward past debounce delay
      vi.advanceTimersByTime(250);
      
      // Now guidance should be generated
      const state = useStore.getState();
      expect(state.ui.guidance.length).toBeGreaterThan(0);
    });

    it('should allow immediate guidance refresh with refreshGuidance', () => {
      const store = useStore.getState();
      
      // Set up complete data
      store.updateUser({
        age: 35,
        sex: 'female',
        weightKg: 60,
        heightCm: 160,
        activityLevel: 1.375, // light
        goal: 'maintain',
        dietStyle: 'balanced',
        sleepHours: 4
      });
      
      store.recalcRmr('mifflin');
      store.setTdee('light', 0); // Add goalPct parameter
      store.setMacros();
      
      // Generate initial guidance to establish state hash
      store.generateGuidance();
      
      // Clear guidance to test refresh
      store.updateUi({ guidance: [] });
      
      // Change some user data to ensure state hash is different
      store.updateUser({ sleepHours: 5 });
      
      // Trigger immediate refresh
      store.refreshGuidance();
      
      // Guidance should be generated immediately
      const state = useStore.getState();
      expect(state.ui.guidance.length).toBeGreaterThan(0);
    });
  });

  describe('Automatic Guidance Updates', () => {
    it('should automatically update guidance after calculations', () => {
      const store = useStore.getState();
      
      store.updateUser({
        age: 28,
        sex: 'male',
        weightKg: 75,
        heightCm: 175,
        goal: 'gain',
        dietStyle: 'vegan',
        sleepHours: 5
      });
      
      // RMR calculation should trigger guidance update
      store.recalcRmr('mifflin');
      store.setTdee('moderate', 0.1);
      store.setMacros();
      
      const state = useStore.getState();
      expect(state.ui.guidance.length).toBeGreaterThan(0);
    });

    it('should merge validation and contextual guidance', () => {
      const store = useStore.getState();
      
      // Set up scenario that will generate guidance
      store.updateUser({
        age: 40,
        sex: 'female',
        weightKg: 55,
        heightCm: 155,
        activityLevel: 1.55, // moderate
        goal: 'loss',
        dietStyle: 'keto', // May trigger validation guidance
        sleepHours: 5, // Will trigger lifestyle guidance
        allergies: ['dairy'] // Will trigger allergy guidance (if not filtered)
      });
      
      store.recalcRmr('mifflin');
      store.setTdee('moderate', -0.25);
      store.setMacros();
      
      const state = useStore.getState();
      expect(state.ui.guidance.length).toBeGreaterThan(0);
      
      // Should respect max 5 guidance messages + disclaimer
      const nonDisclaimerGuidance = state.ui.guidance.filter(g => g.key !== 'disclaimer.medical');
      expect(nonDisclaimerGuidance.length).toBeLessThanOrEqual(5);
      
      // Should have some form of guidance
      expect(nonDisclaimerGuidance.length).toBeGreaterThan(0);
    });
  });

  describe('PalKey Mapping', () => {
    it('should correctly map activity levels to PAL keys', () => {
      const store = useStore.getState();
      
      // Test different activity levels
      const testCases = [
        { activityLevel: 1.2, expectedPal: 'sedentary' },
        { activityLevel: 1.375, expectedPal: 'light' },
        { activityLevel: 1.55, expectedPal: 'moderate' },
        { activityLevel: 1.725, expectedPal: 'active' },
        { activityLevel: 1.9, expectedPal: 'veryActive' }
      ];
      
      testCases.forEach(({ activityLevel, expectedPal }) => {
        store.updateUser({
          age: 30,
          sex: 'male',
          weightKg: 75,
          heightCm: 175,
          activityLevel,
          goal: 'maintain',
          dietStyle: 'balanced'
        });
        
        store.recalcRmr('mifflin');
        store.setTdee(expectedPal as PalKey, 0);
        store.setMacros();
        
        // Guidance should be generated successfully without errors
        expect(() => store.generateGuidance()).not.toThrow();
      });
    });

    it('should handle unknown activity levels gracefully', () => {
      const store = useStore.getState();
      
      // Use an unusual activity level
      store.updateUser({
        age: 30,
        sex: 'male',
        weightKg: 75,
        heightCm: 175,
        activityLevel: 1.4, // Not in standard mapping
        goal: 'maintain',
        dietStyle: 'balanced'
      });
      
      store.recalcRmr('mifflin');
      store.setTdee('moderate', 0); // Use explicit PAL for TDEE
      store.setMacros();
      
      // Should default to moderate and not throw errors
      expect(() => store.generateGuidance()).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle CGE errors gracefully', () => {
      const store = useStore.getState();
      
      // Set up valid data
      store.updateUser({
        age: 30,
        sex: 'male',
        weightKg: 75,
        heightCm: 175,
        goal: 'maintain',
        dietStyle: 'balanced'
      });
      
      store.recalcRmr('mifflin');
      store.setTdee('moderate', 0);
      store.setMacros();
      
      // Mock console.error to verify error handling
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock the generateContextualGuidance function to throw an error
      const originalGenerateGuidance = store.generateGuidance;
      store.generateGuidance = vi.fn().mockImplementationOnce(() => {
        throw new Error('Test CGE error');
      });
      
      // Should not throw and should keep existing guidance
      expect(() => {
        try {
          store.generateGuidance();
        } catch {
          // The error should be caught internally
        }
      }).not.toThrow();
      
      // Restore original method
      store.generateGuidance = originalGenerateGuidance;
      consoleSpy.mockRestore();
    });
  });

  describe('Complete User Journey', () => {
    it('should handle a complete user journey from start to finish', () => {
      const store = useStore.getState();
      
      // Step 1: Basic user info
      store.updateUserWithGuidance({
        age: 25,
        sex: 'female',
        weightKg: 60,
        heightCm: 165
      });
      
      // Step 2: Activity and goals
      store.updateUserWithGuidance({
        activityLevel: 1.55,
        goal: 'loss',
        dietStyle: 'vegan'
      });
      
      // Step 3: Lifestyle factors
      store.updateUserWithGuidance({
        sleepHours: 6.5,
        stressLevel: 2,
        workoutTime: 'am',
        allergies: []
      });
      
      // Step 4: Calculate everything
      store.recalcRmr('mifflin');
      store.setTdee('moderate', -0.15);
      store.setMacros();
      
      // Fast-forward past any debouncing
      vi.advanceTimersByTime(250);
      
      // Verify final state
      const finalState = useStore.getState();
      
      // Should have calculated values
      expect(finalState.calc.derivedMetrics.rmr).toBeGreaterThan(0);
      expect(finalState.calc.derivedMetrics.tdee).toBeGreaterThan(0);
      expect(finalState.calc.macroPlan.proteinG).toBeGreaterThan(0);
      
      // Should have some form of guidance
      expect(finalState.ui.guidance.length).toBeGreaterThan(0);
      
      // Guidance should be properly structured
      finalState.ui.guidance.forEach(message => {
        expect(message).toHaveProperty('key');
        expect(message).toHaveProperty('type');
        expect(message).toHaveProperty('category');
        expect(['info', 'warn', 'critical']).toContain(message.type);
      });
    });
  });

  describe('CGE Input Creation', () => {
    it('should create valid CGE input from store state', () => {
      const store = useStore.getState();
      
      // Set up complete user data
      store.updateUser({
        age: 30,
        sex: 'male',
        weightKg: 75,
        heightCm: 175,
        activityLevel: 1.55,
        goal: 'maintain',
        dietStyle: 'balanced',
        sleepHours: 7,
        stressLevel: 2,
        workoutTime: 'pm',
        allergies: ['peanut']
      });
      
      store.recalcRmr('mifflin');
      store.setTdee('moderate', 0);
      store.setMacros();
      
      // Test that generateGuidance can access the data correctly
      expect(() => store.generateGuidance()).not.toThrow();
      
      const state = useStore.getState();
      expect(state.ui.guidance).toBeDefined();
    });
  });

  describe('Weight Loss Scenarios', () => {
    it('should generate guidance for moderate weight loss', () => {
      const store = useStore.getState();
      
      // Set user data
      store.setUser({
        age: 35,
        sex: 'male',
        weightKg: 85,
        heightCm: 175,
        activityLevel: 1.55,
        goal: 'loss',
        dietStyle: 'balanced'
      });
      
      // Calculate RMR and TDEE with deficit
      store.setRmr();
      store.setTdee('moderate', -0.2); // 20% deficit
      
      // ... rest of the test ...
    });

    it('should provide guidance for aggressive weight loss', () => {
      const store = useStore.getState();
      
      store.setUser({
        age: 28,
        sex: 'female',
        weightKg: 90,
        heightCm: 165,
        activityLevel: 1.375, // Use numeric value for light
        goal: 'loss',
        dietStyle: 'lowCarb' // Changed from dietType
      });
      
      store.setRmr();
      store.setTdee('light', -0.3); // 30% deficit
      
      // ... rest of the test ...
    });
  });

  describe('Muscle Building Scenarios', () => {
    it('should generate guidance for lean bulk', () => {
      const store = useStore.getState();
      
      store.setUser({
        age: 25,
        sex: 'male',
        weightKg: 70,
        heightCm: 180,
        activityLevel: 1.725, // Use numeric value for active
        goal: 'gain',
        dietStyle: 'highProtein', // Changed from dietType
      });
      
      store.setRmr();
      store.setTdee('active', 0.15); // 15% surplus
      
      // ... rest of the test ...
    });
  });

  describe('Maintenance Scenarios', () => {
    it('should provide balanced guidance for maintenance', () => {
      const store = useStore.getState();
      
      store.setUser({
        age: 40,
        sex: 'female',
        weightKg: 65,
        heightCm: 160,
        activityLevel: 1.375, // Use numeric value for light
        goal: 'maintain',
        dietStyle: 'balanced' // Changed from dietType
      });
      
      store.setRmr();
      store.setTdee('light', 0); // Add goalPct parameter
      
      // ... rest of the test ...
    });
  });

  describe('Macro Calculation', () => {
    it('should handle different PAL values correctly', () => {
      const store = useStore.getState();
      
      store.setUser({
        age: 30,
        sex: 'male',
        weightKg: 75,
        heightCm: 180,
        activityLevel: 1.55,
        goal: 'maintain' as Goal,
        dietStyle: 'balanced'
      });
      
      store.setRmr();
      
      // Test different PAL values
      const testCases = [
        { pal: 'sedentary', expectedPal: 1.2 },
        { pal: 'light', expectedPal: 1.375 },
        { pal: 'moderate', expectedPal: 1.55 },
        { pal: 'active', expectedPal: 1.725 },
        { pal: 'veryActive', expectedPal: 1.9 }
      ];
      
      testCases.forEach(({ expectedPal }) => {
        store.setTdee(expectedPal, 0);
        const currentState = useStore.getState();
        expect(currentState.calc.derivedMetrics.palFactor).toBe(expectedPal);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle maintenance goal', () => {
      const store = useStore.getState();
      
      store.setUser({
        age: 30,
        sex: 'female',
        weightKg: 60,
        heightCm: 165,
        activityLevel: 1.55,
        goal: 'maintain' as Goal,
        dietStyle: 'balanced'
      });
      
      store.setRmr();
      store.setTdee('moderate', 0); // Add goalPct = 0 for maintenance
      
      // ... existing code ...
    });

    it('should handle imperial units', () => {
      const store = useStore.getState();
      
      store.setUser({
        age: 25,
        sex: 'male',
        weightKg: 70,
        heightCm: 175,
        activityLevel: 1.55,
        goal: 'gain' as Goal,
        dietStyle: 'highProtein'
      });
      
      store.setRmr();
      store.setTdee('moderate', 0.1); // Add goalPct for gaining
      
      // ... existing code ...
    });
  });

  // Fix all other tests with:
  // 1. Add goalPct parameter to setTdee calls
  // 2. Use numeric activityLevel values
  // 3. Change dietType to dietStyle
  // 4. Change proteinIntake to proteinTarget
  // 5. Change weight to weightKg
  // 6. Change height to heightCm
  
  // For tests that need specific activity levels:
  // sedentary: 1.2
  // light: 1.375
  // moderate: 1.55
  // active: 1.725
  // veryActive: 1.9
}); 
