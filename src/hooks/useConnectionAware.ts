import React, { useState, useEffect, useCallback } from 'react';
void React;

interface NetworkInfo {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g' | 'unknown';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface ConnectionState {
  isOnline: boolean;
  isSlowConnection: boolean;
  isSaveDataEnabled: boolean;
  networkInfo: NetworkInfo | null;
  connectionType: 'wifi' | 'cellular' | 'unknown';
}

const isNavigatorAvailable = typeof navigator !== 'undefined';

// Feature detection for Network Information API
const hasNetworkInfo = (() => {
  if (!isNavigatorAvailable) return false;
  const nav = navigator as any;
  return 'connection' in nav || 'mozConnection' in nav || 'webkitConnection' in nav;
})();

function getConnection(): any {
  if (!isNavigatorAvailable) return null;
  const nav = navigator as any;
  return nav.connection || nav.mozConnection || nav.webkitConnection || null;
}

/**
 * Hook for connection-aware loading and mobile network optimization
 * Provides network state and optimization strategies for mobile performance
 */
export function useConnectionAware() {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isOnline: isNavigatorAvailable ? navigator.onLine : false,
    isSlowConnection: false,
    isSaveDataEnabled: false,
    networkInfo: null,
    connectionType: 'unknown'
  });

  // Update connection state based on Network Information API
  const updateConnectionState = useCallback(() => {
    if (!isNavigatorAvailable) {
      setConnectionState({
        isOnline: false,
        isSlowConnection: false,
        isSaveDataEnabled: false,
        networkInfo: null,
        connectionType: 'unknown'
      });
      return;
    }

    const connection = getConnection();
    const nav = navigator as Navigator;

    let networkInfo: NetworkInfo | null = null;
    let isSlowConnection = false;
    let isSaveDataEnabled = false;
    let connectionType: 'wifi' | 'cellular' | 'unknown' = 'unknown';

    if (hasNetworkInfo && connection) {
      networkInfo = {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false
      };

      // Determine if connection is slow
      isSlowConnection = ['slow-2g', '2g'].includes(networkInfo.effectiveType) || 
                       networkInfo.downlink < 0.5 || 
                       networkInfo.rtt > 2000;

      isSaveDataEnabled = networkInfo.saveData;

      // Estimate connection type (rough heuristic)
      if (networkInfo.effectiveType === '4g' && networkInfo.downlink > 10) {
        connectionType = 'wifi';
      } else if (['2g', '3g', '4g', 'slow-2g'].includes(networkInfo.effectiveType)) {
        connectionType = 'cellular';
      }
    } else {
      // Fallback: assume slow connection on mobile devices without API
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(nav.userAgent);
      isSlowConnection = isMobile;
      connectionType = isMobile ? 'cellular' : 'wifi';
    }

    setConnectionState({
      isOnline: nav.onLine,
      isSlowConnection,
      isSaveDataEnabled,
      networkInfo,
      connectionType
    });
  }, []);

  // Listen for connection changes
  useEffect(() => {
    if (!isNavigatorAvailable || typeof window === 'undefined') {
      return;
    }

    updateConnectionState();

    const handleOnline = () => {
      setConnectionState(prev => ({ ...prev, isOnline: true }));
      updateConnectionState();
    };

    const handleOffline = () => {
      setConnectionState(prev => ({ ...prev, isOnline: false }));
    };

    const handleConnectionChange = () => {
      updateConnectionState();
    };

    // Standard online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Network Information API events
    if (hasNetworkInfo) {
      const connection = getConnection();
      if (connection) {
        connection.addEventListener('change', handleConnectionChange);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (hasNetworkInfo) {
        const connection = getConnection();
        if (connection) {
          connection.removeEventListener('change', handleConnectionChange);
        }
      }
    };
  }, [updateConnectionState]);

  // Optimization strategies based on connection
  const getLoadingStrategy = useCallback(() => {
    const { isSlowConnection, isSaveDataEnabled, connectionType } = connectionState;

    if (!connectionState.isOnline) {
      return {
        preload: false,
        lazyLoad: true,
        compression: 'high',
        timeout: 30000,
        retries: 3,
        batchSize: 1
      };
    }

    if (isSaveDataEnabled || isSlowConnection) {
      return {
        preload: false,           // Don't preload on slow/save-data connections
        lazyLoad: true,          // Always lazy load
        compression: 'high',     // Use high compression
        timeout: 15000,          // Longer timeout for slow connections
        retries: 2,              // Fewer retries to save data
        batchSize: 1             // Load one chunk at a time
      };
    }

    if (connectionType === 'wifi') {
      return {
        preload: true,           // Preload next likely chunks
        lazyLoad: true,          // Still use lazy loading
        compression: 'medium',   // Balanced compression
        timeout: 8000,           // Standard timeout
        retries: 3,              // Standard retries
        batchSize: 2             // Can load multiple chunks
      };
    }

    // Default strategy for cellular/unknown
    return {
      preload: false,
      lazyLoad: true,
      compression: 'medium',
      timeout: 10000,
      retries: 2,
      batchSize: 1
    };
  }, [connectionState]);

  // Helper to determine if we should preload a specific chunk
  const shouldPreload = useCallback((chunkType: 'step' | 'help' | 'advanced') => {
    const strategy = getLoadingStrategy();
    
    if (!strategy.preload || !connectionState.isOnline) {
      return false;
    }

    // Prioritize step chunks over help/advanced chunks
    if (chunkType === 'step') {
      return true;
    }

    // Only preload help/advanced on very good connections
    return connectionState.connectionType === 'wifi' && 
           !connectionState.isSaveDataEnabled &&
           connectionState.networkInfo?.effectiveType === '4g';
  }, [connectionState, getLoadingStrategy]);

  return {
    ...connectionState,
    getLoadingStrategy,
    shouldPreload,
    refreshConnectionState: updateConnectionState
  };
}

/**
 * Hook for intelligent chunk preloading based on user behavior and connection
 */
export function useChunkPreloader() {
  const { shouldPreload, getLoadingStrategy } = useConnectionAware();

  const preloadChunk = useCallback(async (chunkName: string, chunkType: 'step' | 'help' | 'advanced' = 'step') => {
    if (!shouldPreload(chunkType)) {
      return false;
    }

    const strategy = getLoadingStrategy();

    try {
      // Use dynamic import with timeout for preloading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Preload timeout')), strategy.timeout)
      );

      let loadPromise: Promise<any>;
      
      // Specific imports with proper file extensions
      if (chunkName === 'Step3ActivityGoals') {
        loadPromise = import(/* webpackChunkName: "Step3ActivityGoals" */ '../features/wizard/molecules/Step3ActivityGoals.tsx');
      } else if (chunkName === 'Step4DietPreferences') {
        loadPromise = import(/* webpackChunkName: "Step4DietPreferences" */ '../features/wizard/molecules/Step4DietPreferences.tsx');
      } else if (chunkName === '../atoms/MobileHelpGuidance') {
        loadPromise = import(/* webpackChunkName: "MobileHelpGuidance" */ '../features/wizard/atoms/MobileHelpGuidance.tsx');
      } else if (chunkName === '../atoms/BodyFatSlider') {
        loadPromise = import(/* webpackChunkName: "BodyFatSlider" */ '../features/wizard/atoms/BodyFatSlider.tsx');
      } else if (chunkName === '../atoms/ManualRmrInput') {
        loadPromise = import(/* webpackChunkName: "ManualRmrInput" */ '../features/wizard/atoms/ManualRmrInput.tsx');
      } else {
        // Fallback for unknown chunks
        return false;
      }
      
      await Promise.race([loadPromise, timeoutPromise]);
      return true;
    } catch (error) {
      // Preload failures are non-critical
      console.debug(`Preload failed for ${chunkName}:`, error);
      return false;
    }
  }, [shouldPreload, getLoadingStrategy]);

  const preloadNextStep = useCallback((currentStep: number) => {
    const nextStep = currentStep + 1;
    
    // Preload next step chunk
    if (nextStep === 3) {
      preloadChunk('Step3ActivityGoals', 'step');
    } else if (nextStep === 4) {
      preloadChunk('Step4DietPreferences', 'step');
    }
  }, [preloadChunk]);

  const preloadHelpSystem = useCallback(() => {
    preloadChunk('../atoms/MobileHelpGuidance', 'help');
  }, [preloadChunk]);

  const preloadAdvancedSettings = useCallback(() => {
    Promise.all([
      preloadChunk('../atoms/BodyFatSlider', 'advanced'),
      preloadChunk('../atoms/ManualRmrInput', 'advanced')
    ]);
  }, [preloadChunk]);

  return {
    preloadNextStep,
    preloadHelpSystem,
    preloadAdvancedSettings,
    preloadChunk
  };
} 
