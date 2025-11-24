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
  "Diet & Lifestyle Preferences"
] as const;

type UserValidationData = {
  age: number;
  sex: string;
  weightKg: number;
  heightCm: number;
  activityLevel: number;
  goal: string;
};

export default function Wizard() {
  console.count('Wizard render');
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

  const userValidationData = { age, sex, weightKg, heightCm, activityLevel, goal };

  const navigateTo = (path: string) => {
    navigate(path);
  };
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
      case 1:
        const ageValid = userData.age >= 13 && userData.age <= 120;
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
      case 2:
        return { isComplete: true, message: 'Body composition information is optional', helpText: undefined };
      case 3:
        const activityValid = userData.activityLevel > 1.2;
        const goalValid = ['loss', 'maintain', 'gain'].includes(userData.goal);
        const missingStep3 = [];
        if (!activityValid) missingStep3.push('activity level');
        if (!goalValid) missingStep3.push('fitness goal');
        return {
          isComplete: activityValid && goalValid,
          message: missingStep3.length > 0 ? `Please select your ${missingStep3.join(' and ')}` : 'Activity and goals complete',
          helpText: missingStep3.length > 0 ? 'We need this information to calculate your daily calorie needs.' : undefined
        };
      case 4:
        return { isComplete: true, message: 'Diet preferences complete', helpText: undefined };
      default:
        return { isComplete: false, message: 'Unknown step', helpText: undefined };
    }
  }, []);

  const stepValidation = useMemo(() => getStepValidationInfo(step, userValidationData), [step, userValidationData, getStepValidationInfo]);
  const canProceed = stepValidation.isComplete;

  // Add calculation triggers before navigating to results
  const recalcRmr = useStore(state => state.recalcRmr);
  const setTdee = useStore(state => state.setTdee);
  const setMacros = useStore(state => state.setMacros);
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
    console.log('[Wizard] handleNext called, current step:', step);
    updateUi((prev: any) => {
      console.log('[Wizard] updateUi called in handleNext, prev.step:', prev.step);
      if (prev.step >= WIZARD_STEP_TITLES.length) {
        console.log('[Wizard] updateUi: already at last step, returning prev');
        return prev;
      }
      console.log('[Wizard] updateUi: advancing to step', prev.step + 1);
      return { ...prev, step: prev.step + 1 };
    });
    if (step >= WIZARD_STEP_TITLES.length) {
      console.log('[Wizard] handleNext: triggering calculations before navigating to /results');
      const userData = useStore.getState().user;
      console.log('[Wizard] User data at calculation:', userData);
      recalcRmr();
      // Use user's actual PAL key and goal for setTdee
      setTdee(palKey, userGoal === 'loss' ? -0.2 : userGoal === 'gain' ? 0.15 : 0);
      setMacros();
      setTimeout(() => {
        navigateTo('/results');
      }, 100); // Delay navigation to allow state to update
    }
  }, [step, updateUi, navigateTo, recalcRmr, setTdee, setMacros, palKey, userGoal]);

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
        <>
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
            <ChunkErrorBoundary stepName="Diet & Lifestyle Preferences">
              <Suspense fallback={<StepLoadingFallback stepName="Diet & Lifestyle Preferences" />}>
                <Step4DietPreferences />
              </Suspense>
            </ChunkErrorBoundary>
          )}
        </>
      }
      navigationControls={
        <div className="flex gap-4 justify-between">
          <Button onClick={handleBack} disabled={step === 1} variant="secondary">Back</Button>
          <Button onClick={handleNext} disabled={!canProceed} variant="primary">
            {step < WIZARD_STEP_TITLES.length ? 'Continue' : 'See Results'}
          </Button>
        </div>
      }
      guidancePanel={<GuidanceList guidance={guidance} />}
      progressBar={<MobileProgressBar currentStep={step} totalSteps={WIZARD_STEP_TITLES.length} stepTitles={WIZARD_STEP_TITLES} />}
    />
  );
}
