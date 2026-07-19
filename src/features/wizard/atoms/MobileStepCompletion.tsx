import { cn } from '../../../lib/utils';
import { MobileValidationFeedback } from './MobileValidationFeedback';

interface ValidationItem {
  label: string;
  isValid: boolean;
  errorMessage?: string;
  helpText?: string;
}

interface MobileStepCompletionProps {
  stepName: string;
  validationItems: ValidationItem[];
  isComplete: boolean;
  showProgress?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function MobileStepCompletion({
  stepName,
  validationItems,
  isComplete,
  showProgress = true,
  onRetry,
  className
}: MobileStepCompletionProps) {
  const validItems = validationItems.filter(item => item.isValid);
  const invalidItems = validationItems.filter(item => !item.isValid);
  const progressPercentage = (validItems.length / validationItems.length) * 100;

  if (isComplete) {
    return (
      <MobileValidationFeedback
        type="success"
        message={`${stepName} Complete!`}
        details="All required information has been provided. You can continue to the next step."
        compact={true}
        className={className}
      />
    );
  }

  if (invalidItems.length === 0) {
    return null; // No validation issues
  }

  // If only one validation error, show it compactly
  if (invalidItems.length === 1) {
    const item = invalidItems[0];
    return (
      <MobileValidationFeedback
        type="error"
        message={item.errorMessage || `${item.label} is required`}
        details={item.helpText}
        actionLabel={onRetry ? "Fix This" : undefined}
        onAction={onRetry}
        compact={true}
        className={className}
      />
    );
  }

  // Multiple validation errors - show expanded view
  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress Indicator */}
      {showProgress && (
        <div className="bg-surface border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">{stepName} Progress</span>
            <span className="text-sm text-muted">
              {validItems.length} of {validationItems.length} complete
            </span>
          </div>

          <div className="w-full bg-border h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-primary-light h-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="mt-3 text-xs text-muted">
            {Math.round(progressPercentage)}% complete
          </div>
        </div>
      )}

      {/* Validation Checklist */}
      <div className="bg-surface border border-border rounded-lg p-4 shadow-sm">
        <h4 className="text-sm font-medium text-foreground mb-3">Required Information</h4>

        <div className="space-y-3">
          {validationItems.map((item, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className={cn(
                "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5",
                item.isValid
                  ? "bg-success-soft text-success"
                  : "bg-error-soft text-error"
              )}>
                {item.isValid ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>

              <div className="flex-1">
                <div className={cn(
                  "text-sm font-medium",
                  item.isValid ? "text-success" : "text-error"
                )}>
                  {item.label}
                </div>

                {!item.isValid && item.errorMessage && (
                  <div className="text-xs text-error mt-1">
                    {item.errorMessage}
                  </div>
                )}

                {!item.isValid && item.helpText && (
                  <div className="text-xs text-muted mt-1">
                    {item.helpText}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        {onRetry && invalidItems.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border-subtle">
            <button
              onClick={onRetry}
              className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium text-sm transition-colors hover:bg-primary-hover touch-manipulation min-h-[44px]"
            >
              Review & Fix Issues
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
