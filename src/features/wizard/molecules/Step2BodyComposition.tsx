import React, { useCallback } from 'react';
void React;
import { useStore } from '../../../lib/store';
import { LazyAdvancedSettings } from '../atoms/LazyAdvancedSettings';
import { StepContainer } from './StepContainer';

export function Step2BodyComposition() {
  // Use primitive selectors to avoid infinite loop
  const bodyFatPct = useStore(state => state.user.bodyFatPct);
  const rmrManual = useStore(state => state.user.rmrManual);
  const updateUserWithGuidance = useStore(state => state.updateUserWithGuidance);
  // Combine into user object for convenience
  const user = { bodyFatPct, rmrManual };

  // Remove local state, derive from store
  const showManualRmrInput = !!rmrManual;

  const handleBodyFatChange = useCallback((bodyFatPct?: number) => {
    updateUserWithGuidance({ bodyFatPct: bodyFatPct === 0 ? undefined : bodyFatPct });
  }, [updateUserWithGuidance]);

  const handleManualRmrChange = useCallback((rmr?: number) => {
    updateUserWithGuidance({ rmrManual: rmr === 0 ? undefined : rmr });
  }, [updateUserWithGuidance]);

  // Only clear rmrManual if it is set
  const handleToggleShowManualRmr = useCallback(() => {
    if (rmrManual) {
      updateUserWithGuidance({ rmrManual: undefined });
    }
  }, [rmrManual, updateUserWithGuidance]);

  return (
    <StepContainer>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Body Composition (Optional)
          </h2>
          <p className="text-sm text-muted">
            Providing this information can improve the accuracy of your results.
          </p>
        </div>

        {/* Lazy-Loaded Advanced Settings */}
        <LazyAdvancedSettings
          bodyFatValue={user.bodyFatPct}
          onBodyFatChange={handleBodyFatChange}
          rmrValue={user.rmrManual}
          onRmrChange={handleManualRmrChange}
          showManualRmrInput={showManualRmrInput}
          onToggleShowRmr={handleToggleShowManualRmr}
        />

        {/* Summary of Optional Values */}
        {(user.bodyFatPct || user.rmrManual) && (
          <div className="mt-6 p-4 bg-primary-soft border border-primary/25 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-primary mb-2">Optional Values Entered:</h3>
            <ul className="list-disc list-inside text-xs text-primary space-y-1">
              {user.bodyFatPct && <li>Body Fat: {user.bodyFatPct.toFixed(1)}%</li>}
              {user.rmrManual && <li>Manual RMR: {user.rmrManual} kcal</li>}
            </ul>
          </div>
        )}

        {/* Development Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-3 bg-secondary rounded text-xs text-muted">
            <strong>Debug Info:</strong><br />
            Body Fat %: {user.bodyFatPct?.toFixed(1) ?? 'N/A'} | Show UI: {showManualRmrInput.toString()}
          </div>
        )}
      </div>
    </StepContainer>
  );
}
