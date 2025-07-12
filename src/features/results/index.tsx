import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store';
import { deserializeResults, type ShareableResults } from '../../lib/sharing';
import { ResultsDashboard } from './organisms/ResultsDashboard';

/**
 * Enhanced Results component that displays comprehensive nutrition dashboard with CGE guidance
 */
export default function Results() {
  const navigate = useNavigate();
  const { derivedMetrics, macroPlan } = useStore(state => state.calc);
  const { guidance } = useStore(state => state.ui);
  const [sharedResults, setSharedResults] = useState<ShareableResults | null>(null);

  // Check for shared results in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const shared = searchParams.get('d');
    
    if (shared) {
      const results = deserializeResults(shared);
      if (results) {
        setSharedResults(results);
      }
    }
  }, []);

  // Use shared results if available, otherwise use from store
  const metrics = sharedResults?.derivedMetrics || derivedMetrics;
  const macros = sharedResults?.macroPlan || macroPlan;
  
  // For shared results, we don't have guidance data, so we'll show empty guidance
  // In a future enhancement, we could serialize guidance with the results
  const displayGuidance = sharedResults ? [] : guidance;

  // Check if we have valid data to display
  const hasValidData = metrics?.rmr > 0 && macros?.targetCalories > 0;

  if (!hasValidData && !sharedResults) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-6">📊</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Results Available
          </h1>
          <p className="text-gray-600 mb-8">
            Complete the nutrition calculator to see your personalized results and recommendations.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Start Calculator
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ResultsDashboard
          derivedMetrics={metrics}
          macroPlan={macros}
          guidance={displayGuidance}
          isSharedResult={!!sharedResults}
          sharedTimestamp={sharedResults?.timestamp?.toString()}
        />
      </div>
    </div>
  );
} 