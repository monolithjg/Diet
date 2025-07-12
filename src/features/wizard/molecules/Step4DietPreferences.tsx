import { useStore } from '../../../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Label } from '../../../components/ui/Label';
import { SleepHoursInput } from '../atoms/SleepHoursInput';
import { StressLevelScale } from '../atoms/StressLevelScale';
import { StepContainer } from './StepContainer';
import { cn } from '../../../lib/utils';

const dietStyles = [
  {
    value: 'balanced',
    title: 'Balanced',
    description: 'Moderate protein, carbs, and fats',
    icon: '⚖️',
    macros: '25% protein, 45% carbs, 30% fat'
  },
  {
    value: 'highProtein',
    title: 'High Protein',
    description: 'Emphasizes protein for muscle building',
    icon: '💪',
    macros: '35% protein, 35% carbs, 30% fat'
  },
  {
    value: 'lowCarb',
    title: 'Low Carb',
    description: 'Reduces carbohydrates',
    icon: '🥩',
    macros: '30% protein, 20% carbs, 50% fat'
  },
  {
    value: 'keto',
    title: 'Ketogenic',
    description: 'Very low carb, high fat',
    icon: '🥑',
    macros: '25% protein, 5% carbs, 70% fat'
  },
  {
    value: 'vegan',
    title: 'Vegan',
    description: 'Plant-based nutrition',
    icon: '🌱',
    macros: '18% protein, 55% carbs, 27% fat'
  },
  {
    value: 'vegetarian',
    title: 'Vegetarian',
    description: 'Plant-based with dairy/eggs',
    icon: '🥬',
    macros: '22% protein, 50% carbs, 28% fat'
  }
];

const commonAllergies = [
  'peanuts', 'tree nuts', 'shellfish', 'fish', 'eggs', 'dairy', 'soy', 'wheat'
];

function Step4DietPreferences() {
  // Use primitive selectors to avoid infinite loop
  const dietStyle = useStore(state => state.user.dietStyle);
  const allergies = useStore(state => state.user.allergies);
  const sleepHours = useStore(state => state.user.sleepHours);
  const stressLevel = useStore(state => state.user.stressLevel);
  const updateUserWithGuidance = useStore(state => state.updateUserWithGuidance);
  // Combine into user object for convenience
  const user = { dietStyle, allergies, sleepHours, stressLevel };

  const handleDietStyleChange = (dietStyle: string) => {
    updateUserWithGuidance({ dietStyle: dietStyle as any });
  };

  const handleAllergyToggle = (allergy: string) => {
    const currentAllergies = user.allergies || [];
    const newAllergies = currentAllergies.includes(allergy)
      ? currentAllergies.filter(a => a !== allergy)
      : [...currentAllergies, allergy];
    
    updateUserWithGuidance({ allergies: newAllergies });
  };

  const handleSleepHoursChange = (sleepHours: number | undefined) => {
    updateUserWithGuidance({ sleepHours });
  };

  const handleStressLevelChange = (stressLevel: 1 | 2 | 3 | undefined) => {
    updateUserWithGuidance({ stressLevel });
  };

  return (
    <StepContainer>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Diet & Lifestyle Preferences
          </h2>
          <p className="text-sm text-gray-600">
            Choose your diet style and share lifestyle factors that affect your nutrition.
          </p>
        </div>

        {/* Diet Style Selection - Mobile-First Enhancement */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 shadow-sm">
          <Label className="block text-sm font-medium text-gray-700 mb-3">
            What diet style do you prefer?
          </Label>
          
          {/* Mobile-First Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dietStyles.map((diet) => (
              <Card
                key={diet.value}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md touch-manipulation min-h-[120px]",
                  user.dietStyle === diet.value 
                    ? "ring-2 ring-primary bg-primary/5 border-primary" 
                    : "hover:bg-accent/5 border-gray-200"
                )}
                onClick={() => handleDietStyleChange(diet.value)}
                role="button"
                tabIndex={0}
                aria-pressed={user.dietStyle === diet.value}
                aria-label={`Select ${diet.title} diet style`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDietStyleChange(diet.value);
                  }
                }}
              >
                <CardContent className="flex flex-col items-center justify-center p-4 text-center h-full">
                  <div className="text-3xl mb-3">{diet.icon}</div>
                  <div className="font-semibold mb-2 text-sm">{diet.title}</div>
                  <div className="text-xs text-muted-foreground mb-2 leading-relaxed">
                    {diet.description}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono bg-gray-100 px-2 py-1 rounded">
                    {diet.macros}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Selection Feedback */}
          {user.dietStyle && (
            <div className="mt-4 p-3 bg-white rounded border border-gray-200">
              <p className="text-sm text-primary font-medium text-center">
                ✓ Selected: {dietStyles.find(d => d.value === user.dietStyle)?.title}
              </p>
            </div>
          )}
        </div>

        {/* Allergies Selection - Enhanced Mobile Touch Targets */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 shadow-sm">
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Do you have any food allergies? (Optional)
          </Label>
          <p className="text-sm text-muted-foreground mb-4">
            Select any allergies to receive alternative food recommendations
          </p>
          
          {/* Enhanced Mobile Touch Targets */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {commonAllergies.map((allergy) => {
              const isSelected = (user.allergies || []).includes(allergy);
              
              return (
                <button
                  key={allergy}
                  onClick={() => handleAllergyToggle(allergy)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-colors touch-manipulation min-h-[48px] flex items-center justify-center text-center",
                    isSelected 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  )}
                  aria-pressed={isSelected}
                  aria-label={`${isSelected ? 'Remove' : 'Add'} ${allergy} allergy`}
                >
                  <span className="flex items-center">
                    {isSelected && (
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {allergy.charAt(0).toUpperCase() + allergy.slice(1)}
                  </span>
                </button>
              );
            })}
          </div>
          
          {/* Selection Summary */}
          {user.allergies && user.allergies.length > 0 && (
            <div className="mt-4 p-3 bg-white rounded border border-gray-200">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Selected allergies:</span> {user.allergies.join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Sleep Hours Input - Enhanced Mobile Container */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 shadow-sm">
          <SleepHoursInput
            value={user.sleepHours}
            onChange={handleSleepHoursChange}
          />
        </div>

        {/* Stress Level Scale - Enhanced Mobile Container */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 shadow-sm">
          <StressLevelScale
            value={user.stressLevel}
            onChange={handleStressLevelChange}
          />
        </div>

        {/* Lifestyle Tips Card - Mobile Optimized */}
        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-800 text-base flex items-center">
              <span className="text-lg mr-2">💡</span>
              Why We Ask About Lifestyle
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm text-blue-700 space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-base flex-shrink-0">😴</span>
                <div>
                  <strong className="block">Sleep:</strong>
                  <span className="text-xs leading-relaxed">
                    Affects hunger hormones (ghrelin & leptin), metabolism, and recovery.
                    Poor sleep can make weight management more challenging.
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-base flex-shrink-0">😰</span>
                <div>
                  <strong className="block">Stress:</strong>
                  <span className="text-xs leading-relaxed">
                    Elevates cortisol, which can increase appetite and promote fat storage,
                    especially around the midsection.
                  </span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg mt-3">
                <p className="text-xs font-medium">
                  We use this information to provide personalized recommendations for optimizing your results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Development Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-3 bg-gray-100 rounded text-xs text-gray-600">
            <strong>Debug Info:</strong><br />
            Diet Style: {user.dietStyle} <br />
            Allergies: [{(user.allergies || []).join(', ')}] ({(user.allergies || []).length} selected)<br />
            Sleep Hours: {user.sleepHours ?? 'N/A'} <br />
            Stress Level: {user.stressLevel ?? 'N/A'}
          </div>
        )}
      </div>
    </StepContainer>
  );
}

export default Step4DietPreferences; 