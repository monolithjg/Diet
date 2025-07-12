export interface ActivityLevel {
  level: number;
  name: string;
  description: string;
  category: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
}

export const activityLevels: ActivityLevel[] = [
  {
    level: 1.2,
    name: 'Sedentary',
    description: 'Little to no exercise, desk job',
    category: 'sedentary'
  },
  {
    level: 1.375,
    name: 'Lightly Active',
    description: 'Light exercise 1-3 days per week',
    category: 'light'
  },
  {
    level: 1.55,
    name: 'Moderately Active',
    description: 'Moderate exercise 3-5 days per week',
    category: 'moderate'
  },
  {
    level: 1.725,
    name: 'Very Active',
    description: 'Hard exercise 6-7 days per week',
    category: 'active'
  },
  {
    level: 1.9,
    name: 'Extremely Active',
    description: 'Very hard exercise, physical job, or training twice a day',
    category: 'veryActive'
  }
];

/**
 * Get activity level details by PAL factor
 */
export function getActivityLevelByPal(pal: number): ActivityLevel | undefined {
  // Find the closest match or exact match
  return activityLevels.find(level => Math.abs(level.level - pal) < 0.01) ||
         activityLevels.reduce((closest, current) => 
           Math.abs(current.level - pal) < Math.abs(closest.level - pal) ? current : closest
         );
}

/**
 * Get activity level details by category
 */
export function getActivityLevelByCategory(category: ActivityLevel['category']): ActivityLevel | undefined {
  return activityLevels.find(level => level.category === category);
} 