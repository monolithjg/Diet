import { describe, it, expect } from 'vitest';

import {
  mifflinStJeor,
  katchMcArdle,
  cunningham,
  manualRmr
} from '../rmr';

// Golden test cases from the engineering specification

describe('RMR Calculations', () => {
  describe('Mifflin–St Jeor', () => {
    it('TC-M1 (male)', () => {
      const { rmr } = mifflinStJeor({
        weightKg: 70,
        heightCm: 175,
        age: 30,
        sex: 'male'
      });
      expect(rmr).toBeCloseTo(1648.75, 2);
    });

    it('TC-M2 (female)', () => {
      const { rmr } = mifflinStJeor({
        weightKg: 60,
        heightCm: 165,
        age: 28,
        sex: 'female'
      });
      expect(rmr).toBeCloseTo(1330.25, 2);
    });
  });

  describe('Katch–McArdle', () => {
    it('TC-K1 (male)', () => {
      const { rmr } = katchMcArdle({ weightKg: 70, bodyFatPct: 15 });
      expect(rmr).toBeCloseTo(1655.2, 2);
    });

    it('TC-K2 (female)', () => {
      const { rmr } = katchMcArdle({ weightKg: 60, bodyFatPct: 25 });
      expect(rmr).toBeCloseTo(1342, 2);
    });
  });

  describe('Cunningham', () => {
    it('TC-C1 (male)', () => {
      const { rmr } = cunningham({ weightKg: 70, bodyFatPct: 15 });
      expect(rmr).toBeCloseTo(1809, 0); // precision 0 decimal because expected integer
    });

    it('TC-C2 (female)', () => {
      const { rmr } = cunningham({ weightKg: 60, bodyFatPct: 25 });
      expect(rmr).toBeCloseTo(1490, 0);
    });
  });

  describe('Manual Override', () => {
    it('returns the passed value within range', () => {
      const target = 2000;
      const { rmr } = manualRmr(target);
      expect(rmr).toBe(target);
    });
  });

  describe('Snapshots', () => {
    it('golden outputs snapshot', () => {
      const snapshot = {
        mifflinMale: mifflinStJeor({
          weightKg: 70,
          heightCm: 175,
          age: 30,
          sex: 'male'
        }),
        mifflinFemale: mifflinStJeor({
          weightKg: 60,
          heightCm: 165,
          age: 28,
          sex: 'female'
        }),
        katchMale: katchMcArdle({ weightKg: 70, bodyFatPct: 15 }),
        cunninghamMale: cunningham({ weightKg: 70, bodyFatPct: 15 })
      };
      expect(snapshot).toMatchInlineSnapshot(`
        {
          "cunninghamMale": {
            "rmr": 1809,
          },
          "katchMale": {
            "rmr": 1655.2,
          },
          "mifflinFemale": {
            "rmr": 1330.25,
          },
          "mifflinMale": {
            "rmr": 1648.75,
          },
        }
      `);
    });
  });
}); 