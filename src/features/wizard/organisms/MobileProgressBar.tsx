import React, { useMemo } from 'react';

interface MobileProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: readonly string[]; // Array of titles for each step
}

export const MobileProgressBar = React.memo(function MobileProgressBar({
  currentStep,
  totalSteps,
  stepTitles,
}: MobileProgressBarProps) {
  // Memoize expensive calculations
  const progressPercentage = useMemo(() =>
    (currentStep / totalSteps) * 100,
    [currentStep, totalSteps]
  );

  const currentStepTitle = useMemo(() =>
    stepTitles[currentStep - 1] || '',
    [stepTitles, currentStep]
  );

  // Memoize step indicators to avoid recreating on every render
  const stepIndicators = useMemo(() => {
    return stepTitles.map((title, index) => {
      const stepNumber = index + 1;
      const isActive = stepNumber === currentStep;
      const isCompleted = stepNumber < currentStep;

      return (
        <div key={stepNumber} className="flex-1 flex items-center">
          <div
            className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold
              mr-2 shrink-0
              ${isCompleted ? 'bg-primary text-primary-foreground' : isActive ? 'bg-primary-soft border-2 border-primary text-primary' : 'bg-border text-muted'}
            `}
          >
            {isCompleted ? (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
              </svg>
            ) : stepNumber}
          </div>
          <span
            className={`text-xs truncate ${isActive ? 'text-primary font-semibold' : isCompleted ? 'text-foreground' : 'text-muted'}`}
          >
            {title}
          </span>
          {stepNumber < totalSteps && (
            <div className={`flex-grow h-0.5 ml-2 ${isCompleted ? 'bg-primary' : 'bg-border'}`}></div>
          )}
        </div>
      );
    });
  }, [stepTitles, currentStep, totalSteps]);

  // Memoize mobile dot indicators
  const mobileStepDots = useMemo(() => {
    return Array.from({ length: totalSteps }).map((_, index) => (
      <div
        key={`dot-${index}`}
        className={`
          w-2.5 h-2.5 rounded-full
          ${index + 1 === currentStep ? 'bg-primary' : index + 1 < currentStep ? 'bg-primary-soft' : 'bg-border-strong'}
        `}
        title={stepTitles[index]}
      ></div>
    ));
  }, [totalSteps, currentStep, stepTitles]);

  return (
    <div className="w-full px-2 sm:px-0">
      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs sm:text-sm font-medium text-muted">
            Step {currentStep} of {totalSteps}: {currentStepTitle}
          </span>
          <span className="text-xs sm:text-sm font-medium text-primary">
            {Math.round(progressPercentage)}% complete
          </span>
        </div>
        <div className="w-full bg-border h-2.5 rounded-full">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
            aria-label={`Progress: ${Math.round(progressPercentage)}% complete`}
          ></div>
        </div>
      </div>

      {/* Step Indicators (Dots for mobile, Text for larger screens) */}
      <div className="hidden sm:flex items-center justify-between mt-4 space-x-2">
        {stepIndicators}
      </div>

      {/* Dot Indicators for very small screens */}
      <div className="flex sm:hidden items-center justify-center space-x-2 mt-2">
        {mobileStepDots}
      </div>
    </div>
  );
});
