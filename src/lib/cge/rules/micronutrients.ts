import type { GuidanceMessage } from '../../macros';
import type { DietKey } from '../../tdee';
import type { Sex } from '../../../models/UserInput';

/**
 * Context for micronutrient recommendations
 */
export interface MicronutrientContext {
  dietStyle: DietKey;
  sex: Sex;
  age: number;
}

/**
 * Generate micronutrient guidance based on diet style and demographics
 * 
 * Rules:
 * - Plant-based diets: B12, iron, omega-3, and calcium considerations
 * - Keto/low-carb: Electrolyte guidance (sodium, potassium, magnesium)
 * - Age/sex specific needs (iron for women, B12 for elderly)
 * - Diet restriction impacts on nutrient absorption
 * - Evidence-based recommendations following content guidelines
 */
export function generateMicronutrientGuidance(ctx: MicronutrientContext): GuidanceMessage[] {
  const guidance: GuidanceMessage[] = [];
  
  // B12 guidance for plant-based diets with age stratification
  if (ctx.dietStyle === 'vegan') {
    if (ctx.age >= 65) {
      // Enhanced B12 guidance for elderly vegans
      guidance.push({
        key: 'guidance.micronutrient.b12SupplementElderly',
        type: 'warn',
        category: 'micronutrient',
        replacements: {
          supplement: 'B-12',
          dosage: '25-100 mcg daily or 1000 mcg weekly',
          reason: 'limited bioavailability in plant foods and decreased absorption with age'
        }
      });
    } else {
      guidance.push({
        key: 'guidance.micronutrient.b12Supplement',
        type: 'warn',
        category: 'micronutrient',
        replacements: {
          supplement: 'B-12',
          dosage: '10-25 mcg daily or 250 mcg weekly',
          reason: 'limited bioavailability in plant foods'
        }
      });
    }
  } else if (ctx.dietStyle === 'vegetarian') {
    // Lower risk B12 guidance for vegetarians
    guidance.push({
      key: 'guidance.micronutrient.b12Consider',
      type: 'info',
      category: 'micronutrient',
      replacements: {
        supplement: 'B-12',
        reason: 'reduced intake from limited animal products'
      }
    });
  }
  
  // Iron considerations with absorption optimization
  if (ctx.sex === 'female' && ctx.age >= 18 && ctx.age <= 50) {
    guidance.push({
      key: 'guidance.micronutrient.ironNeeds',
      type: 'info',
      category: 'micronutrient',
      replacements: {
        demographic: 'premenopausal women',
        amount: '18mg daily',
        reason: 'higher iron needs due to menstruation'
      }
    });
  }
  
  // Plant-based iron absorption optimization
  if (ctx.dietStyle === 'vegan' || ctx.dietStyle === 'vegetarian') {
    guidance.push({
      key: 'guidance.micronutrient.ironAbsorption',
      type: 'info',
      category: 'micronutrient',
      replacements: {
        enhancer: 'vitamin C-rich foods',
        inhibitor: 'tea, coffee, and calcium supplements',
        timing: 'separate iron-rich meals from coffee/tea by 1-2 hours'
      }
    });
  }
  
  // Keto/low-carb electrolyte guidance
  if (ctx.dietStyle === 'keto' || ctx.dietStyle === 'lowCarb') {
    guidance.push({
      key: 'guidance.micronutrient.electrolyteBalance',
      type: 'info',
      category: 'micronutrient',
      replacements: {
        electrolytes: 'sodium, potassium, and magnesium',
        reason: 'increased losses during carbohydrate restriction',
        sources: 'quality salt, avocados, leafy greens, nuts, and seeds'
      }
    });
  }
  
  // Vitamin D guidance with enhanced targeting
  if (ctx.age >= 50 || (ctx.age >= 19 && ctx.sex === 'female')) {
    guidance.push({
      key: 'guidance.micronutrient.vitaminDSupport',
      type: 'info',
      category: 'micronutrient',
      replacements: {
        demographic: ctx.age >= 50 ? 'adults over 50' : 'adult women',
        amount: ctx.age >= 70 ? '800 IU daily' : '600 IU daily',
        reason: ctx.age >= 50 ? 'decreased synthesis with age' : 'bone health support'
      }
    });
  }
  
  // Omega-3 for plant-based diets with food-first approach
  if (ctx.dietStyle === 'vegan') {
    guidance.push({
      key: 'guidance.micronutrient.omega3Sources',
      type: 'info',
      category: 'micronutrient',
      replacements: {
        foodSources: 'flax seeds, chia seeds, walnuts, hemp seeds',
        supplement: 'algae-based EPA/DHA supplements',
        reason: 'limited long-chain omega-3s in plant foods'
      }
    });
  }
  
  // Calcium guidance for dairy-free diets
  if (ctx.dietStyle === 'vegan') {
    guidance.push({
      key: 'guidance.micronutrient.calciumSources',
      type: 'info',
      category: 'micronutrient',
      replacements: {
        sources: 'fortified plant milks, tahini, leafy greens, tofu',
        amount: '1000-1200mg daily',
        reason: 'absence of dairy products'
      }
    });
  }
  
  // High-protein diet considerations
  if (ctx.dietStyle === 'highProtein') {
    guidance.push({
      key: 'guidance.micronutrient.hydrationProtein',
      type: 'info',
      category: 'micronutrient',
      replacements: {
        recommendation: 'adequate hydration and kidney function monitoring',
        reason: 'increased protein metabolism'
      }
    });
  }
  
  // Creatine consideration for vegetarians/vegans (especially if active)
  if ((ctx.dietStyle === 'vegan' || ctx.dietStyle === 'vegetarian') && ctx.age >= 18 && ctx.age <= 65) {
    guidance.push({
      key: 'guidance.micronutrient.creatineConsider',
      type: 'info',
      category: 'micronutrient',
      replacements: {
        supplement: 'creatine monohydrate',
        amount: '3-5g daily',
        reason: 'limited dietary creatine from plant foods',
        benefit: 'exercise performance and cognitive function'
      }
    });
  }
  
  return guidance;
} 