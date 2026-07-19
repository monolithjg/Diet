import { cn } from '../../../lib/utils';

interface MobileValidationFeedbackProps {
  type: 'error' | 'warning' | 'success' | 'info';
  message: string;
  details?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  compact?: boolean;
}

export function MobileValidationFeedback({
  type,
  message,
  details,
  actionLabel,
  onAction,
  className,
  compact = false
}: MobileValidationFeedbackProps) {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" width="20" height="20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" width="20" height="20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" width="20" height="20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" width="20" height="20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'error':
        return {
          container: 'bg-error-soft border-error/30',
          icon: 'text-error',
          text: 'text-error-foreground',
          details: 'text-error-foreground',
          button: 'bg-error-soft text-error-foreground hover:bg-error/15'
        };
      case 'warning':
        return {
          container: 'bg-warning-soft border-warning/30',
          icon: 'text-warning',
          text: 'text-warning-foreground',
          details: 'text-warning-foreground',
          button: 'bg-warning-soft text-warning-foreground hover:bg-warning/15'
        };
      case 'success':
        return {
          container: 'bg-success-soft border-success/30',
          icon: 'text-success',
          text: 'text-success-foreground',
          details: 'text-success-foreground',
          button: 'bg-success-soft text-success-foreground hover:bg-success/15'
        };
      case 'info':
        return {
          container: 'bg-primary-soft border-primary/25',
          icon: 'text-primary',
          text: 'text-primary',
          details: 'text-primary',
          button: 'bg-primary-soft text-primary hover:bg-primary/15'
        };
    }
  };

  const colors = getColorClasses();

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center space-x-2 p-3 rounded-lg border text-sm",
          colors.container,
          className
        )}
        role="alert"
        aria-live="polite"
      >
        <div className={colors.icon}>
          {getIcon()}
        </div>
        <div className={cn("flex-1", colors.text)}>
          {message}
        </div>
        {onAction && actionLabel && (
          <button
            onClick={onAction}
            className={cn(
              "px-3 py-1 rounded text-xs font-medium transition-colors touch-manipulation min-h-[32px]",
              colors.button
            )}
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-4 space-y-3",
        colors.container,
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start space-x-3">
        <div className={colors.icon}>
          {getIcon()}
        </div>
        <div className="flex-1 space-y-2">
          <div className={cn("font-medium text-sm", colors.text)}>
            {message}
          </div>
          {details && (
            <div className={cn("text-sm leading-relaxed", colors.details)}>
              {details}
            </div>
          )}
          {onAction && actionLabel && (
            <button
              onClick={onAction}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation min-h-[44px] w-full sm:w-auto",
                colors.button
              )}
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
