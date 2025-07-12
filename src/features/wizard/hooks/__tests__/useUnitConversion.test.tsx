import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUnitConversion } from '../useUnitConversion';

describe('useUnitConversion', () => {
  const { result } = renderHook(() => useUnitConversion());
  const {
    convertWeight,
    convertHeight,
    parseWeightInput,
    parseHeightInput,
    formatWeightPlaceholder,
    formatHeightPlaceholder,
    getWeightRange,
    getHeightRange
  } = result.current;

  describe('Weight Conversion', () => {
    it('should convert weight correctly between units', () => {
      const metricResult = convertWeight(70, 'metric');
      expect(metricResult.kg).toBe(70);
      expect(metricResult.displayValue).toBe('70.0');
      expect(metricResult.unit).toBe('kg');

      const imperialResult = convertWeight(70, 'imperial');
      expect(imperialResult.lbs).toBeCloseTo(154.32, 1);
      expect(imperialResult.displayValue).toBe('154.3');
      expect(imperialResult.unit).toBe('lbs');
    });

    it('should parse weight input correctly', () => {
      expect(parseWeightInput('70', 'metric')).toBe(70);
      expect(parseWeightInput('154.3', 'imperial')).toBeCloseTo(70, 0.1);
      expect(parseWeightInput('invalid', 'metric')).toBe(0);
      expect(parseWeightInput('', 'metric')).toBe(0);
    });

    it('should provide correct weight ranges', () => {
      const metricRange = getWeightRange('metric');
      expect(metricRange).toEqual({ min: 30, max: 300, unit: 'kg' });

      const imperialRange = getWeightRange('imperial');
      expect(imperialRange.min).toBe(66); // Math.round(30 * 2.20462)
      expect(imperialRange.max).toBe(661); // Math.round(300 * 2.20462)
      expect(imperialRange.unit).toBe('lbs');
    });
  });

  describe('Height Conversion', () => {
    it('should convert height correctly between units', () => {
      const metricResult = convertHeight(175, 'metric');
      expect(metricResult.cm).toBe(175);
      expect(metricResult.displayValue).toBe('175');
      expect(metricResult.unit).toBe('cm');

      const imperialResult = convertHeight(175, 'imperial');
      expect(imperialResult.feet).toBe(5);
      expect(imperialResult.inches).toBeCloseTo(8.9, 1);
      expect(imperialResult.displayValue).toBe("5'9\"");
      expect(imperialResult.unit).toBe('ft/in');
    });

    it('should parse imperial height inputs correctly - standard formats', () => {
      // Standard formats
      expect(parseHeightInput("5'9", 'imperial')).toBeCloseTo(175.26, 0.1);
      expect(parseHeightInput('5 9', 'imperial')).toBeCloseTo(175.26, 0.1);
      expect(parseHeightInput('5-9', 'imperial')).toBeCloseTo(175.26, 0.1);
      expect(parseHeightInput("5'9\"", 'imperial')).toBeCloseTo(175.26, 0.1);
    });

    it('should parse imperial height inputs correctly - edge cases', () => {
      // Edge cases
      expect(parseHeightInput('6', 'imperial')).toBeCloseTo(182.88, 0.1); // Just feet
      expect(parseHeightInput('5.5', 'imperial')).toBeCloseTo(167.64, 0.1); // Decimal feet
      expect(parseHeightInput('6.0', 'imperial')).toBeCloseTo(182.88, 0.1); // Decimal with .0
      expect(parseHeightInput("6'0", 'imperial')).toBeCloseTo(182.88, 0.1); // 6 feet 0 inches
      expect(parseHeightInput('6 0', 'imperial')).toBeCloseTo(182.88, 0.1); // 6 feet 0 inches
    });

    it('should handle invalid imperial height inputs gracefully', () => {
      expect(parseHeightInput('', 'imperial')).toBe(0);
      expect(parseHeightInput('invalid', 'imperial')).toBe(0);
      expect(parseHeightInput('abc def', 'imperial')).toBe(0);
      expect(parseHeightInput("5'15", 'imperial')).toBeCloseTo(190.5, 0.1); // 5'15" = 6'3" = 190.5 cm
      expect(parseHeightInput('5 13', 'imperial')).toBeCloseTo(185.42, 0.1); // 5'13" = 6'1" = 185.42 cm
    });

    it('should parse metric height inputs correctly', () => {
      expect(parseHeightInput('175', 'metric')).toBe(175);
      expect(parseHeightInput('175.5', 'metric')).toBe(175.5);
      expect(parseHeightInput('invalid', 'metric')).toBe(0);
      expect(parseHeightInput('', 'metric')).toBe(0);
    });

    it('should provide correct height ranges', () => {
      const metricRange = getHeightRange('metric');
      expect(metricRange).toEqual({ min: 100, max: 272, unit: 'cm' });

      const imperialRange = getHeightRange('imperial');
      expect(imperialRange.min).toBe("3'3\""); // 100cm
      expect(imperialRange.max).toBe("8'11\""); // 272cm
      expect(imperialRange.unit).toBe('ft/in');
    });
  });

  describe('Placeholders and Formatting', () => {
    it('should provide correct placeholders', () => {
      expect(formatWeightPlaceholder('metric')).toBe('e.g., 70.5');
      expect(formatWeightPlaceholder('imperial')).toBe('e.g., 155.3');
      
      expect(formatHeightPlaceholder('metric')).toBe('e.g., 175');
      expect(formatHeightPlaceholder('imperial')).toBe("e.g., 5'9\" or 5 9");
    });
  });

  describe('Boundary Value Testing', () => {
    it('should handle minimum and maximum weight values', () => {
      // Minimum values
      expect(parseWeightInput('30', 'metric')).toBe(30);
      expect(parseWeightInput('66', 'imperial')).toBeCloseTo(29.94, 0.1);
      
      // Maximum values
      expect(parseWeightInput('300', 'metric')).toBe(300);
      expect(parseWeightInput('661', 'imperial')).toBeCloseTo(299.82, 0.1);
    });

    it('should handle minimum and maximum height values', () => {
      // Minimum values
      expect(parseHeightInput('100', 'metric')).toBe(100);
      expect(parseHeightInput("3'3", 'imperial')).toBeCloseTo(99.06, 0.1);
      
      // Maximum values  
      expect(parseHeightInput('272', 'metric')).toBe(272);
      expect(parseHeightInput("8'11", 'imperial')).toBeCloseTo(271.78, 0.1);
    });
  });

  describe('Precision and Rounding', () => {
    it('should maintain precision in conversions', () => {
      const weight = 70.5;
      const metricResult = convertWeight(weight, 'metric');
      expect(metricResult.displayValue).toBe('70.5');
      
      const imperialResult = convertWeight(weight, 'imperial');
      expect(parseFloat(imperialResult.displayValue)).toBeCloseTo(155.4, 0.1);
    });

    it('should handle fractional imperial heights correctly', () => {
      expect(parseHeightInput('5.75', 'imperial')).toBeCloseTo(175.26, 0.1); // 5'9"
      expect(parseHeightInput('6.25', 'imperial')).toBeCloseTo(190.5, 0.1); // 6'3"
    });
  });
}); 