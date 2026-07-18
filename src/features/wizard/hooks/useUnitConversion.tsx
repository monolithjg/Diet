import React, { useCallback } from 'react';
void React;
import { kgToLbs, lbsToKg, cmToFeetInches, feetInchesToCm } from '../../../lib/units';

export type UnitSystem = 'metric' | 'imperial';

export interface WeightConversion {
  kg: number;
  lbs: number;
  displayValue: string;
  unit: string;
}

export interface HeightConversion {
  cm: number;
  feet: number;
  inches: number;
  displayValue: string;
  unit: string;
}

export function useUnitConversion() {
  const convertWeight = useCallback((kg: number, targetUnit: UnitSystem): WeightConversion => {
    const lbs = kgToLbs(kg);
    
    return {
      kg,
      lbs,
      displayValue: targetUnit === 'metric' ? kg.toFixed(1) : lbs.toFixed(1),
      unit: targetUnit === 'metric' ? 'kg' : 'lbs'
    };
  }, []);

  const convertHeight = useCallback((cm: number, targetUnit: UnitSystem): HeightConversion => {
    const { feet, inches } = cmToFeetInches(cm);
    
    return {
      cm,
      feet,
      inches,
      displayValue: targetUnit === 'metric' 
        ? `${cm.toFixed(0)}` 
        : `${feet}'${inches.toFixed(0)}"`,
      unit: targetUnit === 'metric' ? 'cm' : 'ft/in'
    };
  }, []);

  const parseWeightInput = useCallback((input: string, unit: UnitSystem): number => {
    const value = parseFloat(input);
    if (isNaN(value)) return 0;
    
    return unit === 'metric' ? value : lbsToKg(value);
  }, []);

  const parseHeightInput = useCallback((input: string, unit: UnitSystem): number => {
    if (unit === 'metric') {
      const cm = parseFloat(input);
      return isNaN(cm) ? 0 : cm;
    } else {
      // Parse imperial input like "5'8" or "5'8"" or "5 8" or separate feet/inches
      const cleaned = input.replace(/'/g, ' ').replace(/"/g, '').trim();
      
      // Try to match patterns like "5 8" or "5-8" first (feet and inches separated)
      const separatedMatch = cleaned.match(/^(\d+)[\s-](\d+)$/);
      if (separatedMatch) {
        const feet = parseInt(separatedMatch[1]);
        const inches = parseInt(separatedMatch[2]);
        return feetInchesToCm(feet, inches);
      }
      
      // Try to match pure decimal like "5.8" (feet with decimal)
      const decimalMatch = cleaned.match(/^(\d+\.\d+)$/);
      if (decimalMatch) {
        const totalFeet = parseFloat(decimalMatch[1]);
        const feet = Math.floor(totalFeet);
        const inches = (totalFeet - feet) * 12;
        return feetInchesToCm(feet, inches);
      }
      
      // Try to match just a whole number (just feet)
      const wholeNumberMatch = cleaned.match(/^(\d+)$/);
      if (wholeNumberMatch) {
        const feet = parseInt(wholeNumberMatch[1]);
        return feetInchesToCm(feet, 0);
      }
      
      // If no match, return 0
      return 0;
    }
  }, []);

  const formatWeightPlaceholder = useCallback((unit: UnitSystem): string => {
    return unit === 'metric' ? 'e.g., 70.5' : 'e.g., 155.3';
  }, []);

  const formatHeightPlaceholder = useCallback((unit: UnitSystem): string => {
    return unit === 'metric' ? 'e.g., 175' : "e.g., 5'9\" or 5 9";
  }, []);

  const getWeightRange = useCallback((unit: UnitSystem) => {
    // Based on ValidationRanges.weightKg (30-300 kg)
    if (unit === 'metric') {
      return { min: 30, max: 300, unit: 'kg' };
    } else {
      return { 
        min: Math.round(kgToLbs(30)), 
        max: Math.round(kgToLbs(300)), 
        unit: 'lbs' 
      };
    }
  }, []);

  const getHeightRange = useCallback((unit: UnitSystem) => {
    // Based on ValidationRanges.heightCm (100-272 cm)
    if (unit === 'metric') {
      return { min: 100, max: 272, unit: 'cm' };
    } else {
      const minFeet = cmToFeetInches(100);
      const maxFeet = cmToFeetInches(272);
      return { 
        min: `${minFeet.feet}'${Math.round(minFeet.inches)}"`, 
        max: `${maxFeet.feet}'${Math.round(maxFeet.inches)}"`, 
        unit: 'ft/in' 
      };
    }
  }, []);

  return {
    convertWeight,
    convertHeight,
    parseWeightInput,
    parseHeightInput,
    formatWeightPlaceholder,
    formatHeightPlaceholder,
    getWeightRange,
    getHeightRange
  };
} 