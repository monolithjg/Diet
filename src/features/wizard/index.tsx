import React, { Suspense, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store';
import { Button } from '../../components/ui/Button';
import { GuidanceList } from '../../components/ui/GuidanceList';
import { Step1PersonalInfo } from './molecules/Step1PersonalInfo';
import { Step2BodyComposition } from './molecules/Step2BodyComposition';
import { MobileWizardLayout } from './organisms/MobileWizardLayout';
import { MobileProgressBar } from './organisms/MobileProgressBar';
import { StepLoadingFallback } from './atoms/StepLoadingFallback';
import { ChunkErrorBoundary } from './atoms/ChunkErrorBoundary';
import { useChunkPreloader, useConnectionAware } from '../../hooks/useConnectionAware';

const Step3ActivityGoals = React.lazy(() => import('./molecules/Step3ActivityGoals'));
const Step4DietPreferences = React.lazy(() => import('./molecules/Step4DietPreferences'));

const WIZARD_STEP_TITLES = [
  "Personal Information",
  "Body Composition",
  "Activity & Goals",
  "Choose your eating style"
] as const;

type UserValidationData = {
  age: number;
  sex: string;
  weightKg: number;
  heightCm: number;
  activityLevel: number;
  goal: string;
  dietStyle?: string;
};

export default function Wizard() {
  const navigate = useNavigate();

  const step = useStore(state => state.ui.step);
  const guidance = useStore(state => state.ui.guidance);
  const updateUi = useStore(state => state.updateUi);

  // Replace the object selector with individual primitive selectors
  const age = useStore(state => state.user.age);
  const sex = useStore(state => state.user.sex);
  const weightKg = useStore(state => state.user.weightKg);
  const heightCm = useStore(state => state.user.heightCm);
  const activityLevel = useStore(state => state.user.activityLevel);
  const goal = useStore(state => state.user.goal);
  const dietStyle = useStore(state => state.user.dietStyle);

  useChunkPreloader();
  useConnectionAware();

  // useEffect(() => {
  //   console.log('Wizard useEffect triggered for step change:', step);
  //   if (step === 1 || step === 2) preloadNextStep(step);
  //   if (step === 1) preloadHelpSystem();
  //   if (step === 2) preloadAdvancedSettings();
  // }, [step]);

  const getStepValidationInfo = useCallback((stepNumber: number, userData: UserValidationData) => {
    switch (stepNumber) {
      case 1: {
        const ageValid = userData.age >= 18 && userData.age <= 120;
        const sexValid = ['male', 'female', 'other'].includes(userData.sex);
        const weightValid = userData.weightKg >= 30 && userData.weightKg <= 300;
        const heightValid = userData.heightCm >= 100 && userData.heightCm <= 272;
        const missing = [];
        if (!ageValid) missing.push('age');
        if (!sexValid) missing.push('biological sex');
        if (!weightValid) missing.push('weight');
        if (!heightValid) missing.push('height');
        return {
          isComplete: ageValid && sexValid && weightValid && heightValid,
          message: missing.length > 0 ? `Please provide your ${missing.join(', ')}` : 'All personal information complete',
          helpText: missing.length > 0 ? 'This information is required to calculate your baseline metabolic needs accurately.' : undefined
        };
      }
      case 2:
        return { isComplete: true, message: 'Body composition information is optional', helpText: undefined };
      case 3: {
        const activityValid = userData.activityLevel >= 1.2;
        const goalValid = ['loss', 'maintain', 'gain'].includes(userData.goal);
        const missingStep3 = [];
        if (!activityValid) missingStep3.push('activity level');
        if (!goalValid) missingStep3.push('fitness goal');
        return {
          isComplete: activityValid && goalValid,
          message: missingStep3.length > 0 ? `Please select your ${missingStep3.join(' and ')}` : 'Activity and goals complete',
          helpText: missingStep3.length > 0 ? 'We need this information to calculate your daily calorie needs.' : undefined
        };
      }
      case 4:
        return {
          isComplete: Boolean(userData.dietStyle),
          message: "We'll use this to shape your macro targets and meal suggestions.",
          helpText: userData.dietStyle ? undefined : 'Choose one eating style to calculate your plan.'
        };
      default:
        return { isComplete: false, message: 'Unknown step', helpText: undefined };
    }
  }, []);

  const stepValidation = useMemo(
    () => getStepValidationInfo(step, { age, sex, weightKg, heightCm, activityLevel, goal, dietStyle }),
    [step, age, sex, weightKg, heightCm, activityLevel, goal, dietStyle, getStepValidationInfo]
  );
  const canProceed = stepValidation.isComplete;

  // Add calculation triggers before navigating to results
  const recalcRmr = useStore(state => state.recalcRmr);
  const setTdee = useStore(state => state.setTdee);
  const palKey = useStore(state => {
    // Map activityLevel to PAL key string
    const al = state.user.activityLevel;
    if (al <= 1.2) return 'sedentary';
    if (al <= 1.375) return 'light';
    if (al <= 1.55) return 'moderate';
    if (al <= 1.725) return 'active';
    return 'veryActive';
  });
  const userGoal = useStore(state => state.user.goal);

  const handleNext = useCallback(() => {
    updateUi((prev) => {
      if (prev.step >= WIZARD_STEP_TITLES.length) {
        return prev;
      }
      return { ...prev, step: prev.step + 1 };
    });
    if (step >= WIZARD_STEP_TITLES.length) {
      recalcRmr();
      // Use user's actual PAL key and goal for setTdee
      setTdee(palKey, userGoal === 'loss' ? -0.2 : userGoal === 'gain' ? 0.15 : 0);
      setTimeout(() => {
        navigate('/results');
      }, 100); // Delay navigation to allow state to update
    }
  }, [step, updateUi, navigate, recalcRmr, setTdee, palKey, userGoal]);

  const handleBack = useCallback(() => {
    if (step > 1) updateUi({ step: step - 1 });
  }, [step, updateUi]);

  // Full wizard UI render
  return (
    <MobileWizardLayout
      step={step}
      stepTitle={WIZARD_STEP_TITLES[step - 1]}
      stepDescription={stepValidation.message}
      stepContent={
        <div key={step} className="step-enter">
          {step === 1 && <Step1PersonalInfo />}
          {step === 2 && <Step2BodyComposition />}
          {step === 3 && (
            <ChunkErrorBoundary stepName="Activity & Goals">
              <Suspense fallback={<StepLoadingFallback stepName="Activity & Goals" />}>
                <Step3ActivityGoals />
              </Suspense>
            </ChunkErrorBoundary>
          )}
          {step === 4 && (
            <ChunkErrorBoundary stepName="Eating Style">
              <Suspense fallback={<StepLoadingFallback stepName="Eating Style" />}>
                <Step4DietPreferences />
              </Suspense>
            </ChunkErrorBoundary>
          )}
        </div>
      }
      navigationControls={
        <div className="flex items-center justify-between gap-3">
          <Button onClick={handleBack} disabled={step === 1} variant="secondary" className="min-w-24 sm:min-w-28">
            Back
          </Button>
          <div className="flex flex-1 items-center gap-3 justify-end">
            {step === WIZARD_STEP_TITLES.length && (
              <p
                id="diet-style-validation"
                className={`hidden text-sm sm:block sm:max-w-56 sm:text-right ${canProceed ? 'text-success' : 'text-muted'}`}
                aria-live="polite"
              >
                {canProceed
                  ? 'Eating style selected. Ready to calculate.'
                  : 'Choose an eating style to calculate your plan.'}
              </p>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              variant="primary"
              className="flex-1 sm:flex-none sm:min-w-44"
              aria-describedby={step === WIZARD_STEP_TITLES.length ? 'diet-style-validation' : undefined}
            >
              {step < WIZARD_STEP_TITLES.length ? 'Continue' : 'Calculate my plan'}
            </Button>
          </div>
        </div>
      }
      guidancePanel={<GuidanceList guidance={guidance} />}
      progressBar={<MobileProgressBar currentStep={step} totalSteps={WIZARD_STEP_TITLES.length} stepTitles={WIZARD_STEP_TITLES} />}
    />
  );
}
