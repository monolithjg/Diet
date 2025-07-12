/**
 * Simple unit conversion helpers. All calculations are carried out in metric
 * units internally. These helpers exist solely for the UI layer to transform
 * user-supplied imperial values into the metric values expected by the
 * calculation engine—and to format metric numbers for display in imperial
 * where preferred.
 */

export const lbToKg = (lb: number): number => lb / 2.20462;

export const inToCm = (inch: number): number => inch * 2.54;

export const stToKg = (st: number): number => st * 6.35029;

/**
 * Reverse conversions useful for display formatting.
 */
export const kgToLb = (kg: number): number => kg * 2.20462;
export const cmToIn = (cm: number): number => cm / 2.54;
export const kgToSt = (kg: number): number => kg / 6.35029;

// Alias functions for consistency with common naming conventions
export const kgToLbs = kgToLb;
export const lbsToKg = lbToKg;

/**
 * Height conversion helpers for feet and inches
 */
export interface FeetInches {
  feet: number;
  inches: number;
}

/**
 * Convert centimeters to feet and inches
 */
export const cmToFeetInches = (cm: number): FeetInches => {
  const totalInches = cmToIn(cm);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  
  return { feet, inches };
};

/**
 * Convert feet and inches to centimeters
 */
export const feetInchesToCm = (feet: number, inches: number): number => {
  const totalInches = feet * 12 + inches;
  return inToCm(totalInches);
}; 