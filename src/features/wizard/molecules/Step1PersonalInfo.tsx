import React, { useCallback } from 'react';
void React;
import { useStore } from '../../../lib/store';
import { AgeInput } from '../atoms/AgeInput';
import { SexSelector } from '../atoms/SexSelector';
import { WeightInput } from '../atoms/WeightInput';
import { HeightInput } from '../atoms/HeightInput';
import { UnitSelector } from '../atoms/UnitToggle';
import { MobileStepCompletion } from '../atoms/MobileStepCompletion';
import type { Sex } from '../../../models/UserInput';
import type { UnitSystem } from '../hooks/useUnitConversion';
import { StepContainer } from './StepContainer';

export function Step1PersonalInfo() {
  const { user } = useStore(state => state);
  const { updateUserWithGuidance } = useStore(state => state);
  const reset = useStore(state => state.reset);

  // Map store unit preference to UnitSystem
  const currentUnit: UnitSystem = user.unitPreference;

  const handleAgeChange = useCallback((age: number) => {
    updateUserWithGuidance({ age });
  }, [updateUserWithGuidance]);

  const handleSexChange = useCallback((sex: Sex) => {
    updateUserWithGuidance({ sex });
  }, [updateUserWithGuidance]);

  const handleWeightChange = useCallback((weightKg: number) => {
    updateUserWithGuidance({ weightKg });
  }, [updateUserWithGuidance]);

  const handleHeightChange = useCallback((heightCm: number) => {
    updateUserWithGuidance({ heightCm });
  }, [updateUserWithGuidance]);

  const handleUnitChange = useCallback((unit: UnitSystem) => {
    updateUserWithGuidance({ unitPreference: unit });
  }, [updateUserWithGuidance]);

  const handleScrollToFirstError = useCallback(() => {
    // Find the first invalid field and scroll to it
    const inputs = ['age-input', 'sex-selector', 'weight-input', 'height-input'];
    const validationStates = [
      user.age >= 18 && user.age <= 120,
      user.sex === 'male' || user.sex === 'female' || user.sex === 'other',
      user.weightKg >= 30 && user.weightKg <= 300,
      user.heightCm >= 100 && user.heightCm <= 272
    ];

    for (let i = 0; i < validationStates.length; i++) {
      if (!validationStates[i]) {
        const element = document.getElementById(inputs[i]);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
          break;
        }
      }
    }
  }, [user.age, user.sex, user.weightKg, user.heightCm]);

  // Validation helpers
  const isAgeValid = user.age >= 18 && user.age <= 120;
  const isSexValid = user.sex === 'male' || user.sex === 'female' || user.sex === 'other';
  const isWeightValid = user.weightKg >= 30 && user.weightKg <= 300;
  const isHeightValid = user.heightCm >= 100 && user.heightCm <= 272;

  const isStepComplete = isAgeValid && isSexValid && isWeightValid && isHeightValid;

  // Prepare validation items for MobileStepCompletion
  const validationItems = [
    {
      label: 'Age',
      isValid: isAgeValid,
      errorMessage: !isAgeValid ? 'Age must be between 18 and 120 years' : undefined,
      helpText: 'Used to calculate age-adjusted metabolic formulas'
    },
    {
      label: 'Biological Sex',
      isValid: isSexValid,
      errorMessage: !isSexValid ? 'Please select your biological sex' : undefined,
      helpText: 'Affects metabolic rate calculations'
    },
    {
      label: 'Weight',
      isValid: isWeightValid,
      errorMessage: !isWeightValid ? `Weight must be between 30-300 kg` : undefined,
      helpText: 'Required for calorie and macro calculations'
    },
    {
      label: 'Height',
      isValid: isHeightValid,
      errorMessage: !isHeightValid ? `Height must be between 100-272 cm` : undefined,
      helpText: 'Used to calculate your baseline metabolic rate'
    }
  ];

  return (
    <StepContainer>
      <div className="space-y-6 sm:space-y-8 sm:flex sm:flex-col sm:justify-center sm:min-h-[70vh]">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Personal Information
          </h2>
          <p className="text-sm text-muted">
            This information helps us calculate your baseline metabolic needs accurately
          </p>
          {(user.age > 0 || user.weightKg > 0 || user.heightCm > 0) && (
            <button
              type="button"
              onClick={reset}
              className="mt-3 text-sm font-medium text-primary hover:text-primary-hover"
            >
              Clear saved profile and start fresh
            </button>
          )}
        </div>

        {/* Unit Selector - Prominent placement at top */}
        <div className="bg-surface-subtle rounded-lg p-4 shadow-sm">
          <UnitSelector
            value={currentUnit}
            onChange={handleUnitChange}
          />
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Age */}
          <AgeInput
            value={user.age}
            onChange={handleAgeChange}
            required
          />

          {/* Biological Sex */}
          <SexSelector
            value={user.sex}
            onChange={handleSexChange}
            required
          />

          {/* Weight and Height - Side by side on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <WeightInput
              value={user.weightKg}
              onChange={handleWeightChange}
              unit={currentUnit}
              required
            />

            <HeightInput
              value={user.heightCm}
              onChange={handleHeightChange}
              unit={currentUnit}
              required
            />
          </div>
        </div>

        <div className="rounded-xl border border-warning/30 bg-warning-soft p-4 text-sm leading-relaxed text-warning-foreground">
          <strong className="block">General adult fitness planning only</strong>
          This calculator is not designed for pregnancy, breastfeeding, eating-disorder treatment, or medical nutrition therapy. Work with a qualified clinician for those situations.
        </div>

        {/* Mobile-Enhanced Step Completion */}
        <MobileStepCompletion
          stepName="Personal Information"
          validationItems={validationItems}
          isComplete={isStepComplete}
          showProgress={true}
          onRetry={handleScrollToFirstError}
        />

      </div>
    </StepContainer>
  );
}
