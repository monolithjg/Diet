import { ValidationRanges, InputRangeError, MissingFieldError } from './errors';

/**
 * Base input required by one or more RMR formulas. All values are expected in
 * metric units. Optional fields are only required by the specific formula that
 * consumes them.
 */
export interface BaseInput {
  weightKg: number;
  heightCm?: number;
  age?: number;
  sex?: 'male' | 'female';
  bodyFatPct?: number;
}

export type RmrResult = { rmr: number };

/* -------------------------------------------------------------------------- */
/*                             Helper Functions                                */
/* -------------------------------------------------------------------------- */

function assertRange(
  field: keyof typeof ValidationRanges,
  value: number
): void {
  const { min, max } = ValidationRanges[field];
  if (value < min || value > max) {
    throw new InputRangeError(field, value, min, max);
  }
}

function assertDefined<T>(field: string, value: T | undefined): asserts value is T {
  if (value === undefined || value === null) {
    throw new MissingFieldError(field);
  }
}

/* -------------------------------------------------------------------------- */
/*                               Calculators                                   */
/* -------------------------------------------------------------------------- */

/**
 * Mifflin–St Jeor equation (1990).
 * RMR = (10 × W) + (6.25 × H) – (5 × A) + S
 * where S = +5 for males and –161 for females.
 */
export function mifflinStJeor(
  params: Required<Pick<BaseInput, 'weightKg' | 'heightCm' | 'age' | 'sex'>>
): RmrResult {
  const { weightKg, heightCm, age, sex } = params;

  // Validation
  assertRange('weightKg', weightKg);
  assertRange('heightCm', heightCm);
  assertRange('age', age);

  if (sex !== 'male' && sex !== 'female') {
    throw new InputRangeError('sex', NaN, NaN, NaN); // custom message maybe but fine
  }

  const sexConstant = sex === 'male' ? 5 : -161;
  const rmr = 10 * weightKg + 6.25 * heightCm - 5 * age + sexConstant;

  return { rmr };
}

/**
 * Katch–McArdle equation (1996).
 * LBM = W × (1 – BF%)
 * RMR = 370 + (21.6 × LBM)
 */
export function katchMcArdle(
  params: Required<Pick<BaseInput, 'weightKg' | 'bodyFatPct'>>
): RmrResult {
  const { weightKg, bodyFatPct } = params;

  // Validation
  assertRange('weightKg', weightKg);
  assertDefined('bodyFatPct', bodyFatPct);
  assertRange('bodyFatPct', bodyFatPct);

  const lbm = weightKg * (1 - bodyFatPct / 100);
  const rmr = 370 + 21.6 * lbm;
  return { rmr };
}

/**
 * Cunningham equation (1980).
 * LBM = W × (1 – BF%)
 * RMR = 500 + (22 × LBM)
 */
export function cunningham(
  params: Required<Pick<BaseInput, 'weightKg' | 'bodyFatPct'>>
): RmrResult {
  const { weightKg, bodyFatPct } = params;

  // Validation
  assertRange('weightKg', weightKg);
  assertDefined('bodyFatPct', bodyFatPct);
  assertRange('bodyFatPct', bodyFatPct);

  const lbm = weightKg * (1 - bodyFatPct / 100);
  const rmr = 500 + 22 * lbm;
  return { rmr };
}

/** Manual RMR override (already validated elsewhere, but range‐check here too). */
export function manualRmr(rmrValue: number): RmrResult {
  assertRange('manualRmr', rmrValue);
  return { rmr: rmrValue };
}

// Check if calculateRMR is actually exported 