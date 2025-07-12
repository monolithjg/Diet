import type { GuidanceMessage } from '../../macros';
import type { DietKey } from '../../tdee';

/**
 * Context for allergy swap recommendations
 */
export interface AllergySwapContext {
  allergies: string[];
  dietStyle: DietKey;
  proteinG: number;
  fatG: number;
  carbG: number;
}

/**
 * Mapping of common allergens to their alternatives
 */
const ALLERGEN_SWAPS: Record<string, { protein?: string[]; fat?: string[]; carb?: string[] }> = {
  peanut: {
    protein: ['sunflower seed butter', 'hemp seeds', 'pumpkin seeds'],
    fat: ['sunflower seed butter', 'tahini', 'coconut butter']
  },
  tree_nuts: {
    protein: ['seeds (sunflower, pumpkin, hemp)', 'legumes'],
    fat: ['seed oils', 'avocado', 'coconut']
  },
  dairy: {
    protein: ['plant protein powders', 'tofu', 'tempeh', 'legumes'],
    fat: ['plant-based milks', 'coconut cream', 'nutritional yeast']
  },
  gluten: {
    carb: ['rice', 'quinoa', 'sweet potatoes', 'certified gluten-free oats'],
    protein: ['legumes', 'quinoa', 'amaranth']
  },
  soy: {
    protein: ['pea protein', 'hemp protein', 'rice protein', 'legumes'],
    fat: ['coconut products', 'nut/seed butters (if tolerated)']
  },
  shellfish: {
    protein: ['fish (if tolerated)', 'poultry', 'plant proteins'],
    fat: ['algae-based omega-3', 'flax oil', 'chia seeds']
  },
  eggs: {
    protein: ['plant protein powders', 'tofu scramble', 'chia seeds as binder'],
    fat: ['ground flax as binder', 'applesauce for baking']
  }
};

/**
 * Generate allergy swap guidance based on user allergies and diet style
 * 
 * Rules:
 * - Provide at least 1 alternative per affected macronutrient
 * - Consider diet style compatibility (e.g., vegan swaps for vegan diet)
 * - Prioritize nutritionally equivalent alternatives
 */
export function generateAllergySwapGuidance(ctx: AllergySwapContext): GuidanceMessage[] {
  const guidance: GuidanceMessage[] = [];
  
  // Process each allergy
  for (const allergy of ctx.allergies) {
    const allergyKey = allergy.toLowerCase().replace(/\s+/g, '_');
    const swaps = ALLERGEN_SWAPS[allergyKey];
    
    if (!swaps) {
      // Generic guidance for unknown allergens
      guidance.push({
        key: 'guidance.allergySwap.genericAdvice',
        type: 'info',
        category: 'allergySwap',
        replacements: {
          allergen: allergy,
          advice: 'Consult with a registered dietitian for personalized alternatives'
        }
      });
      continue;
    }
    
    // Protein alternatives
    if (swaps.protein && ctx.proteinG > 0) {
      const alternatives = filterByDietCompatibility(swaps.protein, ctx.dietStyle);
      guidance.push({
        key: 'guidance.allergySwap.proteinAlternatives',
        type: 'info',
        category: 'allergySwap',
        replacements: {
          allergen: allergy,
          alternatives: alternatives.join(', ')
        }
      });
    }
    
    // Fat alternatives  
    if (swaps.fat && ctx.fatG > 0) {
      const alternatives = filterByDietCompatibility(swaps.fat, ctx.dietStyle);
      guidance.push({
        key: 'guidance.allergySwap.fatAlternatives',
        type: 'info',
        category: 'allergySwap',
        replacements: {
          allergen: allergy,
          alternatives: alternatives.join(', ')
        }
      });
    }
    
    // Carbohydrate alternatives
    if (swaps.carb && ctx.carbG > 0) {
      const alternatives = filterByDietCompatibility(swaps.carb, ctx.dietStyle);
      guidance.push({
        key: 'guidance.allergySwap.carbAlternatives',
        type: 'info',
        category: 'allergySwap',
        replacements: {
          allergen: allergy,
          alternatives: alternatives.join(', ')
        }
      });
    }
  }
  
  return guidance;
}

/**
 * Filter food alternatives based on diet style compatibility
 */
function filterByDietCompatibility(alternatives: string[], dietStyle: DietKey): string[] {
  // For now, return all alternatives
  // Future enhancement: filter based on diet restrictions
  // e.g., remove animal products for vegan diet, high-carb items for keto
  
  if (dietStyle === 'vegan') {
    // Filter out any animal-derived alternatives
    return alternatives.filter(alt => 
      !alt.toLowerCase().includes('dairy') && 
      !alt.toLowerCase().includes('whey') &&
      !alt.toLowerCase().includes('casein')
    );
  }
  
  if (dietStyle === 'keto') {
    // Filter out high-carb alternatives
    return alternatives.filter(alt => 
      !alt.toLowerCase().includes('rice') && 
      !alt.toLowerCase().includes('oats') &&
      !alt.toLowerCase().includes('quinoa') &&
      !alt.toLowerCase().includes('sweet potato')
    );
  }
  
  return alternatives;
} 