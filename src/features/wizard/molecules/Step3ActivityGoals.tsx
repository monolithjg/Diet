import React, { useState } from 'react';
void React;
import { useStore } from '../../../lib/store';
import { Label } from '../../../components/ui/Label';
import { WorkoutTimingSelector } from '../atoms/WorkoutTimingSelector';
import { ToggleGroup, ToggleGroupItem } from '../../../components/ui/ToggleGroup';
import { Input } from '../../../components/ui/Input';
import type { Goal } from '../../../models/UserInput';
import { activityLevels } from '../../../constants/activityLevels';
import { StepContainer } from './StepContainer';
import { Icon, type IconName } from '../../../components/ui/Icon';

const goalDetails: Record<Goal, { name: string; icon: IconName; description: string }> = {
  loss: { name: 'Weight Loss', icon: 'trend-down', description: 'Create a caloric deficit' },
  maintain: { name: 'Maintain Weight', icon: 'balance', description: 'Maintain current weight' },
  gain: { name: 'Weight Gain', icon: 'trend-up', description: 'Create a caloric surplus' },
};

function Step3ActivityGoals() {
  // Use primitive selectors to avoid infinite loop
  const activityLevel = useStore(state => state.user.activityLevel);
  const goal = useStore(state => state.user.goal);
  const workoutTime = useStore(state => state.user.workoutTime);
  const deficitSurplusKcal = useStore(state => state.user.deficitSurplusKcal);
  const updateUserWithGuidance = useStore(state => state.updateUserWithGuidance);
  // Combine into user object for convenience
  const user = { activityLevel, goal, workoutTime, deficitSurplusKcal };

  const [localDeficitSurplusInput, setLocalDeficitSurplusInput] = useState(user.deficitSurplusKcal?.toString() ?? '');
  const [deficitSurplusError, setDeficitSurplusError] = useState<string | undefined>(undefined);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const handleActivityLevelChange = (value?: string) => {
    if (value) {
      updateUserWithGuidance({ activityLevel: Number(value) });
    }
  };

  const handleGoalChange = (goal?: Goal) => {
    if (goal) {
      updateUserWithGuidance({ goal });
    }
  };

  const handleWorkoutTimeChange = (workoutTime?: 'am' | 'pm') => {
    updateUserWithGuidance({ workoutTime });
  };

  const validateDeficitSurplus = (inputValue: string): string | undefined => {
    if (inputValue.trim() === '') return undefined;

    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue)) return "Must be a number.";

    if (numValue < -1500 || numValue > 1500) {
      return "Value must be between -1500 and 1500 kcal.";
    }
    return undefined;
  };

  const handleDeficitSurplusInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalDeficitSurplusInput(val);
    const error = validateDeficitSurplus(val);
    setDeficitSurplusError(error);
    if (!error && val.trim() !== '') {
      updateUserWithGuidance({ deficitSurplusKcal: parseInt(val, 10) });
    } else if (val.trim() === '') {
      updateUserWithGuidance({ deficitSurplusKcal: undefined });
    }
  };

  const handleDeficitSurplusBlur = () => {
    const error = validateDeficitSurplus(localDeficitSurplusInput);
    setDeficitSurplusError(error);
    if (!error && localDeficitSurplusInput.trim() !== '') {
      updateUserWithGuidance({ deficitSurplusKcal: parseInt(localDeficitSurplusInput, 10) });
    } else if (localDeficitSurplusInput.trim() === '') {
      updateUserWithGuidance({ deficitSurplusKcal: undefined });
    }
  };

  const currentActivityLevelDetails = activityLevels.find(level => level.level === user.activityLevel);

  return (
    <StepContainer>
      <div className="space-y-8">
        {/* Activity Level */}
        <section className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold text-foreground">
              Physical Activity Level
            </Label>
            {currentActivityLevelDetails && (
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                {currentActivityLevelDetails.name}
              </span>
            )}
          </div>

          <p className="text-sm leading-relaxed text-muted">
            Include your job, daily movement, and training—not only formal workouts. Choose the closest typical week.
          </p>
          <ToggleGroup
            type="single"
            value={user.activityLevel > 0 ? user.activityLevel.toString() : undefined}
            onValueChange={handleActivityLevelChange}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            aria-label="Physical Activity Level"
          >
            {activityLevels.map(level => (
              <ToggleGroupItem
                key={level.category}
                value={level.level.toString()}
                className="h-auto min-h-24 items-start justify-start rounded-2xl border-2 border-border bg-surface p-4 text-left data-[state=on]:border-primary data-[state=on]:bg-primary/5"
                aria-label={`${level.name}: ${level.description}`}
              >
                <span>
                  <span className="block font-semibold text-foreground">{level.name}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">{level.description}</span>
                </span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </section>

        {/* Goal Selection */}
        <section className="space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <Label className="text-lg font-semibold text-foreground">
            Primary Goal
          </Label>

          <ToggleGroup
            type="single"
            value={user.goal}
            onValueChange={handleGoalChange}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            aria-label="Primary Goal"
          >
            {(Object.keys(goalDetails) as Goal[]).map((goalKey) => (
              <ToggleGroupItem
                key={goalKey}
                value={goalKey}
                className="flex flex-col items-center justify-center h-auto py-6 px-4 gap-3 bg-surface border-2 border-border hover:border-primary/50 hover:bg-secondary/50 data-[state=on]:border-primary data-[state=on]:bg-primary/5 data-[state=on]:text-foreground transition-all duration-200 rounded-2xl shadow-sm"
                aria-label={goalDetails[goalKey].name}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary"><Icon name={goalDetails[goalKey].icon} className="h-6 w-6" /></span>
                <div className="text-center space-y-1">
                  <span className="block font-semibold text-base">{goalDetails[goalKey].name}</span>
                  <span className="block text-xs text-muted">{goalDetails[goalKey].description}</span>
                </div>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </section>

        {/* Workout Timing */}
        <section className="space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <WorkoutTimingSelector
              value={user.workoutTime}
              onChange={handleWorkoutTimeChange}
              helperText="This helps optimize your meal timing recommendations."
            />
          </div>
        </section>

        {/* Advanced Settings */}
        {(user.goal === 'loss' || user.goal === 'gain') && (
          <section className="animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="bg-secondary/30 border border-border rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="flex items-center justify-between w-full p-4 sm:p-6 text-left hover:bg-secondary/50 transition-colors"
                aria-expanded={showAdvancedSettings}
                aria-controls="advanced-settings-content"
              >
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Advanced Settings</h3>
                  <p className="text-xs text-muted mt-1">
                    Customize your calorie target (optional)
                  </p>
                </div>
                <svg
                  className={`w-5 h-5 text-muted transition-transform duration-200 ${showAdvancedSettings ? 'rotate-180' : ''
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                id="advanced-settings-content"
                hidden={!showAdvancedSettings}
                className={`transition-all duration-300 ease-in-out ${showAdvancedSettings ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                  }`}
              >
                <div className="p-4 sm:p-6 pt-0 border-t border-border/50">
                  <Label htmlFor="deficit-surplus" className="text-sm font-medium text-foreground block mb-2">
                    Daily Calorie Adjustment
                  </Label>
                  <p className="text-xs text-muted mb-4">
                    Optional change from your estimated maintenance calories. Use a negative number for a deficit or a positive number for a surplus; safety limits are applied automatically.
                  </p>

                  <div className="relative max-w-xs">
                    <Input
                      id="deficit-surplus"
                      type="number"
                      inputMode="numeric"
                      value={localDeficitSurplusInput}
                      onChange={handleDeficitSurplusInputChange}
                      onBlur={handleDeficitSurplusBlur}
                      placeholder={`e.g., ${user.goal === 'loss' ? '-500' : '+300'}`}
                      className={`w-full pr-20 bg-surface ${deficitSurplusError ? 'border-error' : ''}`}
                    />
                    <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-sm text-muted pointer-events-none">
                      kcal / day
                    </span>
                  </div>

                  {deficitSurplusError && (
                    <p className="text-sm text-error mt-2 flex items-center animate-fade-in">
                      <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {deficitSurplusError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </StepContainer>
  );
}

export default Step3ActivityGoals;
