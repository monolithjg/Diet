import { useStore } from '../../../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Label } from '../../../components/ui/Label';
import { SleepHoursInput } from '../atoms/SleepHoursInput';
import { StressLevelScale } from '../atoms/StressLevelScale';
import { StepContainer } from './StepContainer';
import { cn } from '../../../lib/utils';
import type { DietStyle, Goal } from '../../../models/UserInput';

interface DietOption {
  value: DietStyle;
  title: string;
  description: string;
  icon: string;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

const dietStyles: DietOption[] = [
  {
    value: 'balanced',
    title: 'Balanced',
    description: 'A flexible everyday approach with a steady mix of protein, carbohydrates, and fat.',
    icon: '⚖️',
    macros: { protein: 20, carbs: 50, fat: 30 }
  },
  {
    value: 'highProtein',
    title: 'High Protein',
    description: 'More protein to support fullness, workout recovery, and lean muscle.',
    icon: '💪',
    macros: { protein: 30, carbs: 45, fat: 25 }
  },
  {
    value: 'lowCarb',
    title: 'Low Carb',
    description: 'Fewer carbohydrates with more protein and fat for steadier energy.',
    icon: '🥩',
    macros: { protein: 25, carbs: 35, fat: 40 }
  },
  {
    value: 'keto',
    title: 'Ketogenic',
    description: 'A very low-carbohydrate, high-fat approach designed to support ketosis.',
    icon: '🥑',
    macros: { protein: 20, carbs: 10, fat: 70 }
  },
  {
    value: 'vegan',
    title: 'Vegan',
    description: 'A fully plant-based pattern that excludes all animal-derived foods.',
    icon: '🌱',
    macros: { protein: 25, carbs: 45, fat: 30 }
  },
  {
    value: 'vegetarian',
    title: 'Vegetarian',
    description: 'A plant-forward pattern that can include eggs and dairy products.',
    icon: '🥬',
    macros: { protein: 22, carbs: 50, fat: 28 }
  }
];

const recommendedDietByGoal: Record<Goal, DietStyle> = {
  loss: 'highProtein',
  maintain: 'balanced',
  gain: 'highProtein'
};

const commonAllergies = [
  'peanuts', 'tree nuts', 'shellfish', 'fish', 'eggs', 'dairy', 'soy', 'wheat'
];

function Step4DietPreferences() {
  const dietStyle = useStore(state => state.user.dietStyle);
  const allergies = useStore(state => state.user.allergies);
  const sleepHours = useStore(state => state.user.sleepHours);
  const stressLevel = useStore(state => state.user.stressLevel);
  const goal = useStore(state => state.user.goal);
  const updateUserWithGuidance = useStore(state => state.updateUserWithGuidance);
  const user = { dietStyle, allergies, sleepHours, stressLevel };
  const recommendedDiet = recommendedDietByGoal[goal];

  const handleDietStyleChange = (nextDietStyle: DietStyle) => {
    updateUserWithGuidance({ dietStyle: nextDietStyle });
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
        <fieldset className="space-y-4 animate-fade-in" aria-describedby="diet-style-help">
          <legend className="sr-only">Eating style</legend>
          <div className="flex items-start justify-between gap-4">
            <p id="diet-style-help" className="max-w-xl text-sm leading-relaxed text-muted">
              Choose the pattern that feels most sustainable. You can adjust your macros later.
            </p>
            <span className="shrink-0 rounded-full bg-error-soft px-2.5 py-1 text-xs font-semibold text-error-foreground">
              Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dietStyles.map((diet) => {
              const inputId = `diet-style-${diet.value}`;
              const isSelected = user.dietStyle === diet.value;
              const isRecommended = recommendedDiet === diet.value;
              const macroLabel = `${diet.macros.protein}% protein, ${diet.macros.carbs}% carbohydrates, and ${diet.macros.fat}% fat`;

              return (
                <label
                  key={diet.value}
                  htmlFor={inputId}
                  className={cn(
                    "relative block min-h-[238px] cursor-pointer rounded-2xl border-2 p-5 shadow-sm transition-all duration-200 touch-manipulation",
                    "focus-within:outline-none focus-within:ring-[length:var(--focus-ring-width)] focus-within:ring-ring focus-within:ring-offset-[length:var(--focus-ring-offset)] ring-offset-background",
                    isSelected
                      ? "border-primary bg-primary-soft shadow-md"
                      : "border-border bg-surface hover:border-primary/50 hover:bg-secondary/40"
                  )}
                >
                  <input
                    id={inputId}
                    className="peer sr-only"
                    type="radio"
                    name="diet-style"
                    value={diet.value}
                    checked={isSelected}
                    onChange={() => handleDietStyleChange(diet.value)}
                    aria-describedby={`${inputId}-description ${inputId}-macros`}
                    required
                  />

                  <span
                    className={cn(
                      "absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border-strong bg-control"
                    )}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.296-7.293a1 1 0 011.408 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>

                  <div className="flex h-full flex-col">
                    <div className="mb-4 flex items-start gap-3 pr-8">
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-surface text-2xl shadow-sm"
                        aria-hidden="true"
                      >
                        {diet.icon}
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <span className="block text-lg font-bold text-foreground">{diet.title}</span>
                        {isRecommended && (
                          <span className="mt-1 inline-flex rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success-foreground">
                            Recommended for your goal
                          </span>
                        )}
                      </div>
                    </div>

                    <p id={`${inputId}-description`} className="min-h-12 text-sm leading-relaxed text-muted">
                      {diet.description}
                    </p>

                    <div id={`${inputId}-macros`} className="mt-auto pt-5" role="img" aria-label={macroLabel}>
                      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-border-subtle" aria-hidden="true">
                        <span className="bg-primary" style={{ width: `${diet.macros.protein}%` }} />
                        <span className="bg-success" style={{ width: `${diet.macros.carbs}%` }} />
                        <span className="bg-warning" style={{ width: `${diet.macros.fat}%` }} />
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-1 text-[11px] font-medium text-muted" aria-hidden="true">
                        <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-primary" />P {diet.macros.protein}%</span>
                        <span className="text-center"><i className="mr-1 inline-block h-2 w-2 rounded-full bg-success" />C {diet.macros.carbs}%</span>
                        <span className="text-right"><i className="mr-1 inline-block h-2 w-2 rounded-full bg-warning" />F {diet.macros.fat}%</span>
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="border-t border-border-subtle pt-7 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Optional refinements</p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">Fine-tune your suggestions</h3>
          <p className="mt-1 text-sm text-muted">These details improve meal guidance but are not required to calculate your plan.</p>
        </div>

        {/* Allergies Selection */}
        <section className="space-y-4 animate-fade-in" style={{ animationDelay: '150ms' }}>
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
