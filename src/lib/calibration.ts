import type { Goal } from '../models/UserInput';

export type CalibrationStatus =
  | 'low-adherence'
  | 'on-track'
  | 'slower-than-band'
  | 'faster-than-band'
  | 'opposite-direction';

export interface CalibrationInput {
  goal: Goal;
  earlierAverageKg: number;
  recentAverageKg: number;
  adherenceDays: number;
}

export interface CalibrationResult {
  status: CalibrationStatus;
  weeklyChangeKg: number;
  weeklyChangePct: number;
  adherencePct: number;
  headline: string;
  detail: string;
  nextStep: string;
}

const MIN_ADHERENCE_DAYS = 11;

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function validateInput(input: CalibrationInput): void {
  if (
    !Number.isFinite(input.earlierAverageKg)
    || !Number.isFinite(input.recentAverageKg)
    || input.earlierAverageKg < 20
    || input.earlierAverageKg > 400
    || input.recentAverageKg < 20
    || input.recentAverageKg > 400
  ) {
    throw new RangeError('Weekly average weights must be between 20 and 400 kg.');
  }

  if (
    !Number.isInteger(input.adherenceDays)
    || input.adherenceDays < 0
    || input.adherenceDays > 14
  ) {
    throw new RangeError('Adherence days must be a whole number from 0 to 14.');
  }
}

export function calibrateWeightTrend(input: CalibrationInput): CalibrationResult {
  validateInput(input);

  const weeklyChangeKg = input.recentAverageKg - input.earlierAverageKg;
  const weeklyChangePct = (weeklyChangeKg / input.earlierAverageKg) * 100;
  const adherencePct = (input.adherenceDays / 14) * 100;
  const shared = {
    weeklyChangeKg: round(weeklyChangeKg, 2),
    weeklyChangePct: round(weeklyChangePct, 2),
    adherencePct: round(adherencePct, 0)
  };

  if (input.adherenceDays < MIN_ADHERENCE_DAYS) {
    return {
      ...shared,
      status: 'low-adherence',
      headline: 'Hold the target for now',
      detail: 'The trend is real data, but there are not enough consistent days to diagnose the calorie estimate.',
      nextStep: 'Keep the current target, improve consistency, and repeat this check-in after another two weeks.'
    };
  }

  if (input.goal === 'loss') {
    if (weeklyChangePct < -1) {
      return {
        ...shared,
        status: 'faster-than-band',
        headline: 'Loss is faster than the planning band',
        detail: 'A faster trend can increase recovery and lean-mass-retention concerns, especially for lean or highly active people.',
        nextStep: 'Avoid cutting calories further. Consider the upper end of your working range and seek qualified guidance if the trend continues.'
      };
    }
    if (weeklyChangePct <= -0.25) {
      return {
        ...shared,
        status: 'on-track',
        headline: 'The trend supports the current target',
        detail: 'Your weekly average is moving in the intended direction at a gradual rate.',
        nextStep: 'Keep calories steady and repeat the check-in in two weeks.'
      };
    }
    if (weeklyChangePct >= 0.25) {
      return {
        ...shared,
        status: 'opposite-direction',
        headline: 'The trend is moving opposite the goal',
        detail: 'With good reported adherence, the current intake estimate may be too high for this goal.',
        nextStep: 'Verify portions and activity first, then consider the lower end of your working calorie range for the next two weeks.'
      };
    }
    return {
      ...shared,
      status: 'slower-than-band',
      headline: 'The trend is nearly flat',
      detail: 'With good reported adherence, the current deficit may be smaller than estimated.',
      nextStep: 'Confirm tracking accuracy, then consider the lower end of your working calorie range and reassess in two weeks.'
    };
  }

  if (input.goal === 'gain') {
    if (weeklyChangePct > 0.5) {
      return {
        ...shared,
        status: 'faster-than-band',
        headline: 'Gain is faster than the planning band',
        detail: 'Faster scale gain does not reliably mean faster muscle gain.',
        nextStep: 'Avoid increasing calories further. Consider the lower end of your working range and repeat the check-in in two weeks.'
      };
    }
    if (weeklyChangePct >= 0.1) {
      return {
        ...shared,
        status: 'on-track',
        headline: 'The trend supports the current target',
        detail: 'Your weekly average is rising at a conservative rate.',
        nextStep: 'Keep calories steady and compare the next trend with training performance and body-composition changes.'
      };
    }
    if (weeklyChangePct <= -0.1) {
      return {
        ...shared,
        status: 'opposite-direction',
        headline: 'The trend is moving opposite the goal',
        detail: 'With good reported adherence, the current intake estimate may be too low for this goal.',
        nextStep: 'Verify portions and activity first, then consider the upper end of your working calorie range for the next two weeks.'
      };
    }
    return {
      ...shared,
      status: 'slower-than-band',
      headline: 'The trend is nearly flat',
      detail: 'With good reported adherence, the current surplus may be smaller than estimated.',
      nextStep: 'Confirm tracking accuracy, then consider the upper end of your working calorie range and reassess in two weeks.'
    };
  }

  if (Math.abs(weeklyChangePct) <= 0.25) {
    return {
      ...shared,
      status: 'on-track',
      headline: 'Weight is stable',
      detail: 'The change between weekly averages is within the maintenance planning band.',
      nextStep: 'Keep the current target and continue monitoring the longer-term trend.'
    };
  }

  return {
    ...shared,
    status: 'opposite-direction',
    headline: weeklyChangePct > 0 ? 'Weight is trending upward' : 'Weight is trending downward',
    detail: 'With good reported adherence, the current intake estimate may not be maintaining body weight.',
    nextStep: weeklyChangePct > 0
      ? 'Verify tracking first, then consider the lower end of your working calorie range.'
      : 'Verify tracking first, then consider the upper end of your working calorie range.'
  };
}

