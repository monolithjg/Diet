import { useCallback, useRef } from 'react';
import { useStore } from '../lib/store';
import type { UserInput } from '../models/UserInput';

// Debounce delay for different types of inputs
const DEBOUNCE_DELAYS = {
  typing: 300,      // For text inputs like age, weight, height
  slider: 150,      // For sliders (activity level, body fat)
  selection: 50,    // For selections (goal, diet style, sex)
  immediate: 0      // For immediate updates (step navigation)
} as const;

type DebounceType = keyof typeof DEBOUNCE_DELAYS;

interface DebouncedStoreOptions {
  delay?: DebounceType;
  immediate?: boolean;
}

/**
 * Hook for debounced store updates to improve mobile input performance
 * Batches frequent updates to prevent excessive re-renders and calculations
 */
export function useDebouncedStore(options: DebouncedStoreOptions = {}) {
  const { delay = 'typing', immediate = false } = options;
  const updateUserWithGuidance = useStore(state => state.updateUserWithGuidance);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<Partial<UserInput>>({});

  // Flush any pending updates immediately
  const flushUpdates = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (Object.keys(pendingUpdatesRef.current).length > 0) {
      updateUserWithGuidance(pendingUpdatesRef.current);
      pendingUpdatesRef.current = {};
    }
  }, [updateUserWithGuidance]);

  // Debounced update function
  const debouncedUpdate = useCallback((updates: Partial<UserInput>) => {
    // If immediate flag is set, update right away
    if (immediate) {
      updateUserWithGuidance(updates);
      return;
    }

    // Merge with pending updates
    pendingUpdatesRef.current = { ...pendingUpdatesRef.current, ...updates };

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    const delayMs = DEBOUNCE_DELAYS[delay];
    if (delayMs === 0) {
      // Immediate update for zero delay
      flushUpdates();
    } else {
      timeoutRef.current = setTimeout(flushUpdates, delayMs);
    }
  }, [updateUserWithGuidance, immediate, delay, flushUpdates]);

  // Immediate update function for critical updates
  const immediateUpdate = useCallback((updates: Partial<UserInput>) => {
    flushUpdates(); // Flush any pending updates first
    updateUserWithGuidance(updates);
  }, [updateUserWithGuidance, flushUpdates]);

  return {
    debouncedUpdate,
    immediateUpdate,
    flushUpdates
  };
}

/**
 * Specialized hooks for different input types
 */

// For text inputs (age, weight, height)
export function useTypingStore() {
  return useDebouncedStore({ delay: 'typing' });
}

// For slider inputs (activity level, body fat)
export function useSliderStore() {
  return useDebouncedStore({ delay: 'slider' });
}

// For selection inputs (goal, diet style, sex)
export function useSelectionStore() {
  return useDebouncedStore({ delay: 'selection' });
}

// For immediate updates (step navigation, critical changes)
export function useImmediateStore() {
  return useDebouncedStore({ delay: 'immediate', immediate: true });
} 