import { ProgressiveLoader } from './ProgressiveLoader';

interface StepLoadingFallbackProps {
  stepName?: string;
  className?: string;
}

export function StepLoadingFallback({ 
  stepName = "Step", 
  className 
}: StepLoadingFallbackProps) {
  return (
    <ProgressiveLoader
      isLoading={true}
      loadingText={`Loading ${stepName}...`}
      skeletonVariant="step"
      className={className}
      minLoadingTime={300} // Prevent flash for fast loads
    >
      {/* This will never render since isLoading is always true */}
      <div />
    </ProgressiveLoader>
  );
} 