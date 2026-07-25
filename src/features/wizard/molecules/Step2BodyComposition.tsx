import React, { useCallback, useState } from 'react';
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

  const [showManualRmrInput, setShowManualRmrInput] = useState(rmrManual !== undefined);

  const handleBodyFatChange = useCallback((bodyFatPct?: number) => {
    updateUserWithGuidance({ bodyFatPct: bodyFatPct === 0 ? undefined : bodyFatPct });
  }, [updateUserWithGuidance]);

  const handleManualRmrChange = useCallback((rmr?: number) => {
    updateUserWithGuidance({ rmrManual: rmr === 0 ? undefined : rmr });
  }, [updateUserWithGuidance]);

  const handleToggleShowManualRmr = useCallback(() => {
    if (showManualRmrInput && rmrManual !== undefined) {
      updateUserWithGuidance({ rmrManual: undefined });
    }
    setShowManualRmrInput(current => !current);
  }, [showManualRmrInput, rmrManual, updateUserWithGuidance]);

  return (
    <StepContainer>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Body Composition (Optional)
          </h2>
          <p className="text-sm text-muted">
            A measured body-fat estimate selects a lean-mass RMR equation. Leave it blank if the value is only a guess.
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

      </div>
    </StepContainer>
  );
}
