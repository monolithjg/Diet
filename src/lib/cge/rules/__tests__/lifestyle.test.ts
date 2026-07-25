import { describe, it, expect } from 'vitest';
import { generateLifestyleGuidance, type LifestyleContext } from '../lifestyle';

describe('Lifestyle Guidance Rules', () => {
  // Helper function to create base context
  const createContext = (overrides: Partial<LifestyleContext> = {}): LifestyleContext => ({
    goal: 'maintain',
    ...overrides
  });

  describe('No Lifestyle Data Scenario', () => {
    it('should return empty guidance when no lifestyle data provided', () => {
      const context = createContext({
        sleepHours: undefined,
        stressLevel: undefined
      });
      
      const guidance = generateLifestyleGuidance(context);
      
      expect(guidance).toHaveLength(0);
    });
  });

  describe('SLEEP-1 Specification Compliance', () => {
    it('should handle SLEEP-1 test case: sleepHours=5 triggers sleep_low guidance', () => {
      const context = createContext({
        sleepHours: 5,
        goal: 'loss'
      });
      
      const guidance = generateLifestyleGuidance(context);
      
      expect(guidance).toHaveLength(1);
      expect(guidance[0]).toEqual({
        key: 'guidance.lifestyle.sleepLow',
        type: 'warn',
        category: 'lifestyle',
        replacements: {
          current: 5,
          target: '7-9',
          impact: 'fat loss'
        }
      });
    });
  });

  describe('Sleep Guidance Tests', () => {
    describe('Sleep Threshold Testing', () => {
      it('should trigger guidance for sleep < 6 hours', () => {
        const testCases = [0, 1, 2, 3, 4, 5, 5.5];
        
        testCases.forEach(sleepHours => {
          const context = createContext({ sleepHours, goal: 'gain' });
          const guidance = generateLifestyleGuidance(context);
          
          expect(guidance).toHaveLength(1);
          expect(guidance[0].key).toBe('guidance.lifestyle.sleepLow');
          expect(guidance[0].type).toBe('warn');
          expect(guidance[0].replacements?.current).toBe(sleepHours);
        });
      });

      it('should not trigger guidance for sleep >= 6 hours', () => {
        const testCases = [6, 6.5, 7, 8, 9, 10, 12];
        
        testCases.forEach(sleepHours => {
          const context = createContext({ sleepHours });
          const guidance = generateLifestyleGuidance(context);
          
          expect(guidance).toHaveLength(0);
        });
      });

      it('should not trigger guidance when sleepHours is undefined', () => {
        const context = createContext({ sleepHours: undefined });
        const guidance = generateLifestyleGuidance(context);
        
        expect(guidance).toHaveLength(0);
      });
    });

    describe('Goal-Specific Impact Messaging', () => {
      it('should show fat loss impact for loss goal', () => {
        const context = createContext({
          sleepHours: 5,
          goal: 'loss'
        });
        
        const guidance = generateLifestyleGuidance(context);
        
        expect(guidance[0].replacements?.impact).toBe('fat loss');
      });

      it('should show muscle gain impact for gain goal', () => {
        const context = createContext({
          sleepHours: 4,
          goal: 'gain'
        });
        
        const guidance = generateLifestyleGuidance(context);
        
        expect(guidance[0].replacements?.impact).toBe('muscle gain');
      });

      it('should show muscle gain impact for maintain goal', () => {
        const context = createContext({
          sleepHours: 3,
          goal: 'maintain'
        });
        
        const guidance = generateLifestyleGuidance(context);
        
        expect(guidance[0].replacements?.impact).toBe('muscle gain');
      });
    });

    describe('Sleep Guidance Message Structure', () => {
      it('should have correct message structure and content', () => {
        const context = createContext({
          sleepHours: 4.5,
          goal: 'loss'
        });
        
        const guidance = generateLifestyleGuidance(context);
        
        expect(guidance[0]).toEqual({
          key: 'guidance.lifestyle.sleepLow',
          type: 'warn',
          category: 'lifestyle',
          replacements: {
            current: 4.5,
            target: '7-9',
            impact: 'fat loss'
          }
        });
      });
    });
  });

  describe('Stress Guidance Tests', () => {
    describe('Stress Level Testing', () => {
      it('should not trigger guidance for low stress levels (1-2)', () => {
        const testCases: Array<1 | 2> = [1, 2];
        
        testCases.forEach(stressLevel => {
          const context = createContext({ stressLevel });
          const guidance = generateLifestyleGuidance(context);
          
          expect(guidance).toHaveLength(0);
        });
      });

      it('should trigger guidance for high stress level (3)', () => {
        const context = createContext({
          stressLevel: 3,
          goal: 'gain'
        });
        
        const guidance = generateLifestyleGuidance(context);
        
        expect(guidance).toHaveLength(1);
        expect(guidance[0].key).toBe('guidance.lifestyle.stressHigh');
        expect(guidance[0].type).toBe('info');
      });

      it('should not trigger guidance when stressLevel is undefined', () => {
        const context = createContext({ stressLevel: undefined });
        const guidance = generateLifestyleGuidance(context);
        
        expect(guidance).toHaveLength(0);
      });
    });

    describe('Stress Guidance Message Structure', () => {
      it('should have correct message structure and content', () => {
        const context = createContext({
          stressLevel: 3,
          goal: 'maintain'
        });
        
        const guidance = generateLifestyleGuidance(context);
        
        expect(guidance[0]).toEqual({
          key: 'guidance.lifestyle.stressHigh',
          type: 'info',
          category: 'lifestyle',
          replacements: {
            impact: 'sleep, recovery, and plan adherence'
          }
        });
      });

      it('should have consistent impact message regardless of goal', () => {
        const goals = ['loss', 'gain', 'maintain'] as const;
        
        goals.forEach(goal => {
          const context = createContext({ stressLevel: 3, goal });
          const guidance = generateLifestyleGuidance(context);
          
          expect(guidance[0].replacements?.impact).toBe('sleep, recovery, and plan adherence');
        });
      });
    });
  });

  describe('Combined Sleep and Stress Scenarios', () => {
    it('should provide both sleep and stress guidance when both conditions are met', () => {
      const context = createContext({
        sleepHours: 4,
        stressLevel: 3,
        goal: 'loss'
      });
      
      const guidance = generateLifestyleGuidance(context);
      
      expect(guidance).toHaveLength(2);
      
      const sleepGuidance = guidance.find(g => g.key === 'guidance.lifestyle.sleepLow');
      const stressGuidance = guidance.find(g => g.key === 'guidance.lifestyle.stressHigh');
      
      expect(sleepGuidance).toBeDefined();
      expect(sleepGuidance?.type).toBe('warn');
      expect(sleepGuidance?.replacements?.impact).toBe('fat loss');
      
      expect(stressGuidance).toBeDefined();
      expect(stressGuidance?.type).toBe('info');
      expect(stressGuidance?.replacements?.impact).toBe('sleep, recovery, and plan adherence');
    });

    it('should provide only sleep guidance when only sleep condition is met', () => {
      const context = createContext({
        sleepHours: 5,
        stressLevel: 2, // Below threshold
        goal: 'gain'
      });
      
      const guidance = generateLifestyleGuidance(context);
      
      expect(guidance).toHaveLength(1);
      expect(guidance[0].key).toBe('guidance.lifestyle.sleepLow');
    });

    it('should provide only stress guidance when only stress condition is met', () => {
      const context = createContext({
        sleepHours: 8, // Above threshold
        stressLevel: 3,
        goal: 'maintain'
      });
      
      const guidance = generateLifestyleGuidance(context);
      
      expect(guidance).toHaveLength(1);
      expect(guidance[0].key).toBe('guidance.lifestyle.stressHigh');
    });

    it('should provide no guidance when neither condition is met', () => {
      const context = createContext({
        sleepHours: 8, // Above threshold
        stressLevel: 2, // Below threshold
        goal: 'maintain'
      });
      
      const guidance = generateLifestyleGuidance(context);
      
      expect(guidance).toHaveLength(0);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle exactly 6 hours sleep (boundary case)', () => {
      const context = createContext({
        sleepHours: 6,
        goal: 'loss'
      });
      
      const guidance = generateLifestyleGuidance(context);
      
      expect(guidance).toHaveLength(0); // Should NOT trigger (>= 6 is ok)
    });

    it('should handle very low sleep values', () => {
      const context = createContext({
        sleepHours: 0,
        goal: 'gain'
      });
      
      const guidance = generateLifestyleGuidance(context);
      
      expect(guidance).toHaveLength(1);
      expect(guidance[0].replacements?.current).toBe(0);
    });

    it('should handle fractional sleep hours', () => {
      const context = createContext({
        sleepHours: 5.75,
        goal: 'maintain'
      });
      
      const guidance = generateLifestyleGuidance(context);
      
      expect(guidance).toHaveLength(1);
      expect(guidance[0].replacements?.current).toBe(5.75);
    });

    it('should handle all valid stress levels', () => {
      const stressLevels: Array<1 | 2 | 3> = [1, 2, 3];
      
      stressLevels.forEach(stressLevel => {
        const context = createContext({ stressLevel });
        const guidance = generateLifestyleGuidance(context);
        
        if (stressLevel >= 3) {
          expect(guidance.length).toBeGreaterThan(0);
          expect(guidance[0].key).toBe('guidance.lifestyle.stressHigh');
        } else {
          expect(guidance.filter(g => g.key === 'guidance.lifestyle.stressHigh')).toHaveLength(0);
        }
      });
    });
  });

  describe('Message Priority and Category Validation', () => {
    it('should assign warn priority to sleep guidance', () => {
      const context = createContext({
        sleepHours: 4,
        goal: 'loss'
      });
      
      const guidance = generateLifestyleGuidance(context);
      
      expect(guidance[0].type).toBe('warn');
      expect(guidance[0].category).toBe('lifestyle');
    });

    it('should assign info priority to stress guidance', () => {
      const context = createContext({
        stressLevel: 3,
        goal: 'gain'
      });
      
      const guidance = generateLifestyleGuidance(context);
      
      expect(guidance[0].type).toBe('info');
      expect(guidance[0].category).toBe('lifestyle');
    });

    it('should maintain priority order when both guidance types are present', () => {
      const context = createContext({
        sleepHours: 3,
        stressLevel: 3,
        goal: 'loss'
      });
      
      const guidance = generateLifestyleGuidance(context);
      
      expect(guidance).toHaveLength(2);
      
      // Sleep should come first (warn priority)
      expect(guidance[0].key).toBe('guidance.lifestyle.sleepLow');
      expect(guidance[0].type).toBe('warn');
      
      // Stress should come second (info priority)
      expect(guidance[1].key).toBe('guidance.lifestyle.stressHigh');
      expect(guidance[1].type).toBe('info');
    });
  });

  describe('Integration Context Validation', () => {
    it('should handle all required context fields', () => {
      const fullContext: LifestyleContext = {
        sleepHours: 5,
        stressLevel: 3,
        goal: 'loss'
      };
      
      expect(() => generateLifestyleGuidance(fullContext)).not.toThrow();
      
      const guidance = generateLifestyleGuidance(fullContext);
      expect(guidance.length).toBe(2);
    });

    it('should work with all goal types', () => {
      const goals = ['loss', 'gain', 'maintain'] as const;
      
      goals.forEach(goal => {
        const context = createContext({
          sleepHours: 4,
          stressLevel: 3,
          goal
        });
        
        expect(() => generateLifestyleGuidance(context)).not.toThrow();
        
        const guidance = generateLifestyleGuidance(context);
        expect(guidance).toHaveLength(2);
        
        // Sleep guidance should have goal-specific impact
        const sleepGuidance = guidance.find(g => g.key === 'guidance.lifestyle.sleepLow');
        expect(sleepGuidance?.replacements?.impact).toBe(
          goal === 'loss' ? 'fat loss' : 'muscle gain'
        );
        
        // Stress guidance should be consistent
        const stressGuidance = guidance.find(g => g.key === 'guidance.lifestyle.stressHigh');
        expect(stressGuidance?.replacements?.impact).toBe('sleep, recovery, and plan adherence');
      });
    });

    it('should return properly structured guidance messages', () => {
      const context = createContext({
        sleepHours: 4,
        stressLevel: 3,
        goal: 'loss'
      });
      
      const guidance = generateLifestyleGuidance(context);
      
      guidance.forEach(message => {
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
  });
});
