import React, { Suspense } from 'react';
import { ChunkErrorBoundary } from './ChunkErrorBoundary';

// Lazy load advanced body composition components
const BodyFatSlider = React.lazy(() => import('./BodyFatSlider'));
const ManualRmrInput = React.lazy(() => import('./ManualRmrInput'));

// Loading fallback for advanced settings
function AdvancedSettingsLoadingFallback() {
  return (
    <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
      <div className="animate-pulse space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="h-6 bg-gray-300 rounded w-12"></div>
        </div>
        
        {/* Content skeleton */}
        <div className="space-y-3">
          <div className="h-2 bg-gray-200 rounded-full w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
}

// Props interfaces for the lazy components
interface LazyBodyFatSliderProps {
  value?: number;
  onChange: (bodyFatPct?: number) => void;
  error?: string;
  disabled?: boolean;
}

interface LazyManualRmrInputProps {
  value?: number;
  onChange: (rmr?: number) => void;
  showManualRmrInput: boolean;
  onToggleShow: () => void;
  error?: string;
  disabled?: boolean;
}

// Lazy Body Fat Slider component
export function LazyBodyFatSlider(props: LazyBodyFatSliderProps) {
  return (
    <ChunkErrorBoundary stepName="Body Fat Settings">
      <Suspense fallback={<AdvancedSettingsLoadingFallback />}>
        <BodyFatSlider {...props} />
      </Suspense>
    </ChunkErrorBoundary>
  );
}

// Lazy Manual RMR Input component
export function LazyManualRmrInput(props: LazyManualRmrInputProps) {
  return (
    <ChunkErrorBoundary stepName="RMR Settings">
      <Suspense fallback={<AdvancedSettingsLoadingFallback />}>
        <ManualRmrInput {...props} />
      </Suspense>
    </ChunkErrorBoundary>
  );
}

// Combined lazy advanced settings component
interface LazyAdvancedSettingsProps {
  // Body Fat Slider props
  bodyFatValue?: number;
  onBodyFatChange: (bodyFatPct?: number) => void;
  bodyFatError?: string;
  
  // Manual RMR Input props  
  rmrValue?: number;
  onRmrChange: (rmr?: number) => void;
  showManualRmrInput: boolean;
  onToggleShowRmr: () => void;
  rmrError?: string;
  
  // Common props
  disabled?: boolean;
}

export function LazyAdvancedSettings({
  bodyFatValue,
  onBodyFatChange,
  bodyFatError,
  rmrValue,
  onRmrChange,
  showManualRmrInput,
  onToggleShowRmr,
  rmrError,
  disabled = false
}: LazyAdvancedSettingsProps) {
  return (
    <ChunkErrorBoundary stepName="Advanced Settings">
      <Suspense 
        fallback={
          <div className="space-y-8">
            <AdvancedSettingsLoadingFallback />
            <AdvancedSettingsLoadingFallback />
          </div>
        }
      >
        <div className="space-y-8">
          {/* Body Fat Percentage */}
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
            <BodyFatSlider
              value={bodyFatValue}
              onChange={onBodyFatChange}
              error={bodyFatError}
              disabled={disabled}
            />
          </div>

          {/* Manual RMR Override */}
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
            <ManualRmrInput
              value={rmrValue}
              onChange={onRmrChange}
              showManualRmrInput={showManualRmrInput}
              onToggleShow={onToggleShowRmr}
              error={rmrError}
              disabled={disabled}
            />
          </div>
        </div>
      </Suspense>
    </ChunkErrorBoundary>
  );
} 