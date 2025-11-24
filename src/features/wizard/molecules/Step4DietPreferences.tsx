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
      <div className="space-y-8">
        {/* Diet Style Selection */}
        <section className="space-y-4 animate-fade-in">
          <Label className="text-lg font-semibold text-foreground">
            Diet Style
          </Label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dietStyles.map((diet) => (
              <Card
                key={diet.value}
                className={cn(
                  "cursor-pointer transition-all duration-200 touch-manipulation min-h-[140px] border-2",
                  user.dietStyle === diet.value
                    ? "ring-2 ring-primary ring-offset-2 border-primary bg-primary/5 shadow-md"
                    : "hover:border-primary/50 hover:bg-secondary/50 border-border shadow-sm"
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
                <CardContent className="flex flex-col items-center justify-center p-5 text-center h-full gap-2">
                  <div className="text-4xl mb-1 filter drop-shadow-sm">{diet.icon}</div>
                  <div className="font-bold text-foreground">{diet.title}</div>
                  <div className="text-xs text-muted leading-relaxed line-clamp-2">
                    {diet.description}
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {diet.macros}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Allergies Selection */}
        <section className="space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold text-foreground">
              Food Allergies
            </Label>
            <span className="text-xs text-muted uppercase tracking-wider font-medium">Optional</span>
          </div>

          <div className="flex flex-wrap gap-3">
            {commonAllergies.map((allergy) => {
              const isSelected = (user.allergies || []).includes(allergy);

              return (
                <button
                  key={allergy}
                  onClick={() => handleAllergyToggle(allergy)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 touch-manipulation flex items-center gap-2 border",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-surface text-foreground border-border hover:border-primary/50 hover:bg-secondary"
                  )}
                  aria-pressed={isSelected}
                  aria-label={`${isSelected ? 'Remove' : 'Add'} ${allergy} allergy`}
                >
                  {isSelected && (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {allergy.charAt(0).toUpperCase() + allergy.slice(1)}
                </button>
              );
            })}
          </div>
        </section>

        {/* Sleep & Stress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <section className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <SleepHoursInput
              value={user.sleepHours}
              onChange={handleSleepHoursChange}
            />
          </section>

          <section className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <StressLevelScale
              value={user.stressLevel}
              onChange={handleStressLevelChange}
            />
          </section>
        </div>

        {/* Lifestyle Tips */}
        <section className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <Card className="bg-secondary/30 border-none shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                <span className="text-xl">💡</span>
                Why We Ask About Lifestyle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted">
                <div className="flex gap-3">
                  <span className="text-lg flex-shrink-0">😴</span>
                  <div>
                    <strong className="block text-foreground mb-1">Sleep</strong>
                    <span className="text-xs leading-relaxed">
                      Affects hunger hormones and recovery. Poor sleep can hinder weight management.
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg flex-shrink-0">😰</span>
                  <div>
                    <strong className="block text-foreground mb-1">Stress</strong>
                    <span className="text-xs leading-relaxed">
                      Elevates cortisol, which can increase appetite and promote fat storage.
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </StepContainer>
  );
}

export default Step4DietPreferences; 