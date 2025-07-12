import React, { useState, useEffect } from 'react';
import { cn } from '../../../lib/utils';

interface ProgressiveLoaderProps {
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  loadingText?: string;
  errorText?: string;
  children: React.ReactNode;
  className?: string;
  minLoadingTime?: number; // Minimum time to show loading (prevents flash)
  skeletonVariant?: 'form' | 'content' | 'list' | 'step';
}

export function ProgressiveLoader({
  isLoading,
  error,
  onRetry,
  loadingText = "Loading...",
  errorText = "Failed to load content",
  children,
  className,
  minLoadingTime = 300,
  skeletonVariant = 'content'
}: ProgressiveLoaderProps) {
  const [showLoading, setShowLoading] = useState(isLoading);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!isLoading) {
      const elapsed = Date.now() - startTime;
      if (elapsed < minLoadingTime) {
        // Ensure minimum loading time to prevent flash
        const remainingTime = minLoadingTime - elapsed;
        const timeout = setTimeout(() => setShowLoading(false), remainingTime);
        return () => clearTimeout(timeout);
      } else {
        setShowLoading(false);
      }
    } else {
      setShowLoading(true);
    }
  }, [isLoading, startTime, minLoadingTime]);

  if (error) {
    return (
      <div className={cn("min-h-[200px] flex flex-col items-center justify-center p-6 text-center", className)}>
        {/* Error Icon */}
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        {/* Error Content */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{errorText}</h3>
        <p className="text-sm text-gray-600 mb-4 max-w-md">
          There was a problem loading this content. Please check your connection and try again.
        </p>

        {/* Retry Button */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors touch-manipulation min-h-[44px]"
          >
            Try Again
          </button>
        )}

        {/* Technical Details in Development */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left max-w-lg">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Technical Details
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-600 overflow-auto">
              {error.message}
              {error.stack && '\n\n' + error.stack}
            </pre>
          </details>
        )}
      </div>
    );
  }

  if (showLoading) {
    return <LoadingSkeleton variant={skeletonVariant} text={loadingText} className={className} />;
  }

  return <>{children}</>;
}

// Skeleton loading component with different variants
interface LoadingSkeletonProps {
  variant: 'form' | 'content' | 'list' | 'step';
  text: string;
  className?: string;
}

function LoadingSkeleton({ variant, text, className }: LoadingSkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200 rounded";

  const renderFormSkeleton = () => (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <div className={cn(baseClasses, "h-6 w-48 mx-auto mb-2")} />
        <div className={cn(baseClasses, "h-4 w-64 mx-auto")} />
      </div>
      <div className="space-y-4">
        <div>
          <div className={cn(baseClasses, "h-4 w-24 mb-2")} />
          <div className={cn(baseClasses, "h-10 w-full")} />
        </div>
        <div>
          <div className={cn(baseClasses, "h-4 w-32 mb-2")} />
          <div className={cn(baseClasses, "h-10 w-full")} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className={cn(baseClasses, "h-4 w-20 mb-2")} />
            <div className={cn(baseClasses, "h-10 w-full")} />
          </div>
          <div>
            <div className={cn(baseClasses, "h-4 w-24 mb-2")} />
            <div className={cn(baseClasses, "h-10 w-full")} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentSkeleton = () => (
    <div className="space-y-4 p-6">
      <div className={cn(baseClasses, "h-8 w-3/4")} />
      <div className="space-y-2">
        <div className={cn(baseClasses, "h-4 w-full")} />
        <div className={cn(baseClasses, "h-4 w-5/6")} />
        <div className={cn(baseClasses, "h-4 w-4/5")} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div className={cn(baseClasses, "h-32 w-full")} />
        <div className={cn(baseClasses, "h-32 w-full")} />
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="space-y-3 p-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className={cn(baseClasses, "h-10 w-10 rounded-full")} />
          <div className="flex-1 space-y-2">
            <div className={cn(baseClasses, "h-4 w-3/4")} />
            <div className={cn(baseClasses, "h-3 w-1/2")} />
          </div>
        </div>
      ))}
    </div>
  );

  const renderStepSkeleton = () => (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className={cn(baseClasses, "h-7 w-56 mx-auto")} />
        <div className={cn(baseClasses, "h-4 w-80 mx-auto")} />
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className={cn(baseClasses, "h-3 w-24")} />
          <div className={cn(baseClasses, "h-3 w-16")} />
        </div>
        <div className={cn(baseClasses, "h-2 w-full rounded-full")} />
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className={cn(baseClasses, "h-4 w-32")} />
          <div className={cn(baseClasses, "h-10 w-full")} />
          <div className={cn(baseClasses, "h-3 w-48")} />
        </div>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className={cn(baseClasses, "h-4 w-40")} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={cn(baseClasses, "h-24 w-full")} />
            <div className={cn(baseClasses, "h-24 w-full")} />
            <div className={cn(baseClasses, "h-24 w-full")} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("min-h-[400px] bg-white rounded-lg shadow-sm", className)}>
      {/* Loading Header */}
      <div className="flex items-center justify-center p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-gray-700">{text}</span>
        </div>
      </div>

      {/* Skeleton Content */}
      <div className="overflow-hidden">
        {variant === 'form' && renderFormSkeleton()}
        {variant === 'content' && renderContentSkeleton()}
        {variant === 'list' && renderListSkeleton()}
        {variant === 'step' && renderStepSkeleton()}
      </div>

      {/* Loading Footer for Mobile */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="text-xs text-gray-500 text-center">
          📱 Optimizing for your device...
        </div>
      </div>
    </div>
  );
} 