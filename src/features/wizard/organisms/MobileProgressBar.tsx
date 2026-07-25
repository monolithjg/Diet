import React from 'react';

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
  return (
    <div
      className="w-full"
      role="progressbar"
      aria-label={`Step ${currentStep} of ${totalSteps}: ${stepTitles[currentStep - 1] || ''}`}
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
    >
      <p className="mb-3 text-sm font-semibold text-foreground">
        Step {currentStep} of {totalSteps}
      </p>
      <div className="grid grid-cols-4 gap-2" aria-hidden="true">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <span
              key={stepNumber}
              className={`h-2 rounded-full transition-[background-color,box-shadow] duration-200 ${
                isCompleted
                  ? 'bg-primary'
                  : isCurrent
                    ? 'bg-primary-soft ring-1 ring-inset ring-primary'
                    : 'bg-border'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
});
