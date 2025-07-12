import type { DerivedMetrics } from "../models/DerivedMetrics";
import type { MacroPlan } from "../models/MacroPlan";

/**
 * Shareable results data structure (excludes PII)
 */
export type ShareableResults = {
  derivedMetrics: DerivedMetrics;
  macroPlan: MacroPlan;
  timestamp: number;
};

/**
 * Compresses the calculation results into a URL-safe base64 string
 */
export function serializeResults(
  derivedMetrics: DerivedMetrics,
  macroPlan: MacroPlan
): string {
  const shareableData: ShareableResults = {
    derivedMetrics,
    macroPlan,
    timestamp: Date.now(),
  };

  // Convert to JSON, then to base64, ensuring URL safety
  const jsonString = JSON.stringify(shareableData);
  const base64 = btoa(jsonString);
  
  // Make base64 URL-safe by replacing characters that have special meaning in URLs
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Deserializes a base64 string from a URL into calculation results
 * @returns The deserialized results or null if invalid
 */
export function deserializeResults(base64Str: string): ShareableResults | null {
  try {
    // Restore base64 standard characters
    const standardBase64 = base64Str
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Pad with '=' if needed
    const padding = standardBase64.length % 4;
    const paddedBase64 = padding 
      ? standardBase64 + '='.repeat(4 - padding) 
      : standardBase64;
    
    // Decode and parse
    const jsonString = atob(paddedBase64);
    const results = JSON.parse(jsonString) as ShareableResults;
    
    // Validate the structure (basic check)
    if (!results.derivedMetrics || !results.macroPlan) {
      return null;
    }
    
    return results;
  } catch (error) {
    console.error('Failed to deserialize results:', error);
    return null;
  }
} 