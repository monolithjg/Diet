import { describe, expect, it } from 'vitest';
import { calibrateWeightTrend } from '../calibration';

describe('calibrateWeightTrend', () => {
  it('holds the target when adherence is too low to diagnose it', () => {
    const result = calibrateWeightTrend({
      goal: 'loss',
      earlierAverageKg: 80,
      recentAverageKg: 79.5,
      adherenceDays: 8
    });

    expect(result.status).toBe('low-adherence');
    expect(result.adherencePct).toBe(57);
  });

  it('recognizes a gradual loss trend', () => {
    const result = calibrateWeightTrend({
      goal: 'loss',
      earlierAverageKg: 80,
      recentAverageKg: 79.6,
      adherenceDays: 13
    });

    expect(result.status).toBe('on-track');
    expect(result.weeklyChangePct).toBe(-0.5);
  });

  it('flags a loss trend faster than one percent per week', () => {
    const result = calibrateWeightTrend({
      goal: 'loss',
      earlierAverageKg: 80,
      recentAverageKg: 79,
      adherenceDays: 14
    });

    expect(result.status).toBe('faster-than-band');
  });

  it('recognizes a conservative gain trend', () => {
    const result = calibrateWeightTrend({
      goal: 'gain',
      earlierAverageKg: 80,
      recentAverageKg: 80.24,
      adherenceDays: 12
    });

    expect(result.status).toBe('on-track');
    expect(result.weeklyChangePct).toBe(0.3);
  });

  it('recognizes stable maintenance', () => {
    const result = calibrateWeightTrend({
      goal: 'maintain',
      earlierAverageKg: 80,
      recentAverageKg: 80.1,
      adherenceDays: 12
    });

    expect(result.status).toBe('on-track');
  });

  it('validates weight and adherence ranges', () => {
    expect(() => calibrateWeightTrend({
      goal: 'maintain',
      earlierAverageKg: 0,
      recentAverageKg: 80,
      adherenceDays: 14
    })).toThrow(RangeError);

    expect(() => calibrateWeightTrend({
      goal: 'maintain',
      earlierAverageKg: 80,
      recentAverageKg: 80,
      adherenceDays: 15
    })).toThrow(RangeError);
  });
});
