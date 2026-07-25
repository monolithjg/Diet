/*
 * Custom error classes for validation in calculation utilities.
 *
 * These classes are deliberately simple—runtime consumers such as Zustand
 * actions or UI components should catch these specific types to surface
 * friendly messages to end-users. Keeping them distinct makes it easy to map
 * different validation failures to different toast messages or form error
 * states.
 */

/** Raised when a required field is missing from the input object. */
export class MissingFieldError extends Error {
  public readonly fieldName: string;

  constructor(fieldName: string, message?: string) {
    super(message ?? `Missing required field: ${fieldName}`);
    this.name = 'MissingFieldError';
    this.fieldName = fieldName;
  }
}

/** Raised when a numeric input falls outside the allowed range. */
export class InputRangeError extends Error {
  public readonly fieldName: string;
  public readonly received: number;
  public readonly min: number;
  public readonly max: number;

  constructor(fieldName: string, received: number, min: number, max: number) {
    super(
      `Value for ${fieldName} out of range: ${received}. Expected between ${min} and ${max}.`
    );
    this.name = 'InputRangeError';
    this.fieldName = fieldName;
    this.received = received;
    this.min = min;
    this.max = max;
  }
}

/** Raised when the final calorie target is unrealistically low. */
export class UnrealisticCalorieError extends Error {
  public readonly fieldName: string;
  public readonly received: number;
  public readonly minThreshold: number;

  constructor(fieldName: string, received: number, minThreshold: number) {
    super(
      `Final calorie target (${received} kcal) is too low for ${fieldName}. Minimum safe value is ${minThreshold} kcal.`
    );
    this.name = 'UnrealisticCalorieError';
    this.fieldName = fieldName;
    this.received = received;
    this.minThreshold = minThreshold;
  }
}

/**
 * Constant lookup table for validation boundaries. Keeping the numbers in a
 * single place guarantees consistency across functions and test cases.
 */
export const ValidationRanges = {
  weightKg: { min: 30, max: 300 },
  heightCm: { min: 100, max: 272 },
  age: { min: 18, max: 120 },
  bodyFatPct: { min: 3, max: 75 },
  manualRmr: { min: 800, max: 4000 },
  tefPct: { min: 0.05, max: 0.20 },
  goalPct: { min: -0.40, max: 0.20 }
} as const;
