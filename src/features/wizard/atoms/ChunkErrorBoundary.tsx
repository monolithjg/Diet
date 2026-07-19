import React, { Component, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils';

interface ChunkErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ChunkErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  stepName?: string;
  onRetry?: () => void;
  onNavigateHome?: () => void;
  className?: string;
}

class ChunkErrorBoundaryInner extends Component<ChunkErrorBoundaryProps, ChunkErrorBoundaryState> {
  constructor(props: ChunkErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ChunkErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chunk loading error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onRetry) {
      this.props.onRetry();
    } else {
      // Default retry by reloading the page
      window.location.reload();
    }
  };

  handleGoHome = () => {
    if (this.props.onNavigateHome) {
      this.props.onNavigateHome();
    } else {
      // Fallback to window.location if navigate not available
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={cn("min-h-[400px] flex flex-col items-center justify-center p-8 text-center", this.props.className)}>
          {/* Error Icon */}
          <div className="w-16 h-16 bg-error-soft rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          {/* Error Content */}
          <div className="max-w-md">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Unable to Load {this.props.stepName || 'Step'}
            </h3>
            <p className="text-muted mb-6">
              There was a problem loading this section. This might be due to a network issue or temporary problem.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-hover transition-colors touch-manipulation min-h-[44px]"
              >
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 bg-secondary text-foreground rounded-lg font-medium hover:bg-surface-overlay transition-colors touch-manipulation min-h-[44px]"
              >
                Go Home
              </button>
            </div>

            {/* Technical Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-muted hover:text-foreground">
                  Technical Details
                </summary>
                <pre className="mt-2 p-3 bg-secondary rounded text-xs text-muted overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack && '\n\n' + this.state.error.stack}
                </pre>
              </details>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-8 text-sm text-muted">
            💡 If this problem persists, try refreshing the page or check your internet connection
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper component that provides navigation
export function ChunkErrorBoundary(props: Omit<ChunkErrorBoundaryProps, 'onNavigateHome'>) {
  const navigate = useNavigate();
  const navigateTo = (path: string) => {
    navigate(path);
  };

  const handleNavigateHome = () => {
    navigateTo('/');
  };

  return (
    <ChunkErrorBoundaryInner
      {...props}
      onNavigateHome={handleNavigateHome}
    />
  );
}
