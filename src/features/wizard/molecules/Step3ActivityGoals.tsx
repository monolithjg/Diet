import React, { useState } from 'react';
void React;
import { useStore } from '../../../lib/store';
import { Label } from '../../../components/ui/Label';
import { WorkoutTimingSelector } from '../atoms/WorkoutTimingSelector';
import { Slider } from '../../../components/ui/Slider';
import { ToggleGroup, ToggleGroupItem } from '../../../components/ui/ToggleGroup';
import { Input } from '../../../components/ui/Input';
import type { Goal } from '../../../models/UserInput';
import { activityLevels } from '../../../constants/activityLevels';
import { StepContainer } from './StepContainer';

const goalDetails: Record<Goal, { name: string; icon: string; description: string }> = {
  loss: { name: 'Weight Loss', icon: '📉', description: 'Create a caloric deficit' },
  maintain: { name: 'Maintain Weight', icon: '⚖️', description: 'Maintain current weight' },
  gain: { name: 'Weight Gain', icon: '📈', description: 'Create a caloric surplus' },
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

  const handleActivityLevelChange = (value: number[]) => {
    updateUserWithGuidance({ activityLevel: value[0] });
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
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Activity & Goals</h2>
          <p className="text-sm text-gray-600">
            Help us understand your physical activity and what you aim to achieve.
          </p>
        </div>

        {/* Activity Level - Enhanced for Mobile */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 shadow-sm">
          <Label htmlFor="activity-level-slider" className="block text-sm font-medium text-gray-700 mb-1">
            Physical Activity Level
          </Label>
          <p className="text-xs text-gray-500 mb-4 sm:mb-3">
            {currentActivityLevelDetails?.description || 'Select your typical activity level'}
          </p>
          
          {/* Enhanced Slider for Mobile */}
          <div className="px-2 py-1">
            <Slider
              id="activity-level-slider"
              min={1.2}
              max={2.5}
              step={0.01}
              value={[user.activityLevel || 1.2]}
              onValueChange={handleActivityLevelChange}
              className="w-full"
              aria-label={`Activity Level: ${currentActivityLevelDetails?.name}`}
            />
          </div>
          
          {/* Mobile-optimized labels */}
          <div className="flex justify-between text-xs text-gray-500 mt-3 px-1">
            <span className="text-center w-16">Sedentary</span>
            <span className="text-center w-16 hidden sm:block">Light</span>
            <span className="text-center w-16">Moderate</span>
            <span className="text-center w-16 hidden sm:block">Active</span>
            <span className="text-center w-16">Very Active</span>
          </div>
          
          <div className="mt-3 p-2 bg-white rounded border border-gray-200">
            <p className="text-sm font-semibold text-primary text-center">
              {currentActivityLevelDetails?.name} (PAL: {user.activityLevel.toFixed(2)})
            </p>
          </div>
        </div>

        {/* Goal Selection - Mobile-First Responsive Layout */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 shadow-sm">
          <Label className="block text-sm font-medium text-gray-700 mb-3">
            Primary Goal
          </Label>
          <ToggleGroup
            type="single"
            value={user.goal}
            onValueChange={handleGoalChange}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            aria-label="Primary Goal"
          >
            {(Object.keys(goalDetails) as Goal[]).map((goalKey) => (
              <ToggleGroupItem 
                key={goalKey} 
                value={goalKey} 
                className="flex flex-col items-center justify-center h-auto py-4 px-4 min-h-[60px] data-[state=on]:bg-primary data-[state=on]:text-white hover:bg-primary/10 transition-colors rounded-lg border-2"
                aria-label={goalDetails[goalKey].name}
              >
                <span className="text-3xl mb-2">{goalDetails[goalKey].icon}</span>
                <span className="text-sm font-medium text-center">{goalDetails[goalKey].name}</span>
                <span className="text-xs text-center mt-1 opacity-75">{goalDetails[goalKey].description}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Workout Timing Selector */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 shadow-sm">
          <WorkoutTimingSelector
            value={user.workoutTime}
            onChange={handleWorkoutTimeChange}
            helperText="This helps optimize your meal timing recommendations."
          />
        </div>

        {/* Advanced Settings - Progressive Disclosure */}
        {(user.goal === 'loss' || user.goal === 'gain') && (
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 shadow-sm">
            {/* Advanced Settings Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="flex items-center justify-between w-full py-2 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              aria-expanded={showAdvancedSettings}
              aria-controls="advanced-settings-content"
            >
              <div>
                <h3 className="text-sm font-medium text-gray-700">Advanced Settings</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Customize your calorie target (optional)
                </p>
              </div>
              <div className="flex items-center ml-4">
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    showAdvancedSettings ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Collapsible Advanced Content */}
            <div
              id="advanced-settings-content"
              className={`overflow-hidden transition-all duration-300 ${
                showAdvancedSettings ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="border-t border-gray-200 pt-4">
                <Label htmlFor="deficit-surplus" className="text-sm font-medium text-gray-700 block mb-2">
                  Custom Calorie Target (Optional)
                </Label>
                <p className="text-xs text-gray-500 mb-3">
                  Adjust the default calorie target. Max ±40% of TDEE (approx).
                </p>
                
                <div className="relative">
                  <Input
                    id="deficit-surplus"
                    type="number"
                    inputMode="numeric"
                    value={localDeficitSurplusInput}
                    onChange={handleDeficitSurplusInputChange}
                    onBlur={handleDeficitSurplusBlur}
                    placeholder={`e.g., ${user.goal === 'loss' ? '-500' : '+300'}`}
                    className={`w-full pr-20 h-12 text-base ${deficitSurplusError ? 'border-red-500' : ''}`}
                  />
                  <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-sm text-gray-500 pointer-events-none">
                    kcal / day
                  </span>
                </div>
                
                {deficitSurplusError && (
                  <p className="text-sm text-red-500 mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {deficitSurplusError}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Development Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-3 bg-gray-100 rounded text-xs text-gray-600">
            <strong>Debug Info:</strong><br />
            Activity Level: {user.activityLevel.toFixed(2)} | Goal: {user.goal} <br />
            Workout Time: {user.workoutTime ?? 'N/A'} <br />
            Deficit/Surplus: {user.deficitSurplusKcal ?? 'Using default'} (Input: {localDeficitSurplusInput}) <br />
            Advanced Settings: {showAdvancedSettings ? 'Open' : 'Closed'}
          </div>
        )}
      </div>
    </StepContainer>
  );
}

export default Step3ActivityGoals; 