import React, { useMemo } from 'react';
void React;
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { GuidanceList } from '../../../components/ui/GuidanceList';
import { MacroVisualizer } from './MacroVisualizer';
import { ActionPlan } from './ActionPlan';
import { cn } from '../../../lib/utils';
// Avoid direct react-router hooks to keep runtime resilient during dev pre-bundling
import type { DerivedMetrics } from '../../../models/DerivedMetrics';
import type { MacroPlan } from '../../../models/MacroPlan';
import type { GuidanceMessage } from '../../../lib/macros';

interface ResultsDashboardProps {
  derivedMetrics: DerivedMetrics;
  macroPlan: MacroPlan;
  guidance: GuidanceMessage[];
  isSharedResult?: boolean;
  sharedTimestamp?: string;
  className?: string;
}

export function ResultsDashboard({
  derivedMetrics,
  macroPlan,
  guidance,
  isSharedResult = false,
  sharedTimestamp,
  className
}: ResultsDashboardProps) {
  const navigateTo = (path: string) => {
    try {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (e) {
      window.location.href = path;
    }
  };
  const sharedDateLabel = useMemo(() => {
    if (!sharedTimestamp) return null;
    const numericTimestamp = Number(sharedTimestamp);
    const hasNumericValue = Number.isFinite(numericTimestamp) && numericTimestamp > 0;
    const date = hasNumericValue ? new Date(numericTimestamp) : new Date(sharedTimestamp);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toLocaleDateString(undefined, { timeZone: 'UTC' });
  }, [sharedTimestamp]);

  const handleShare = async () => {
    try {
      // Import the serialization function
      const { serializeResults } = await import('../../../lib/sharing');
      
      // Generate shareable URL with encoded results data
      const encodedData = serializeResults(derivedMetrics, macroPlan);
      const url = `${window.location.origin}/results?d=${encodedData}`;
      
      await navigator.clipboard.writeText(url);
      
      // Show success feedback (you could integrate a toast library here)
      const button = document.getElementById('share-button');
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy link to clipboard');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBackToCalculator = () => {
    navigateTo('/');
    if (typeof window !== 'undefined' && import.meta.env.MODE === 'test') {
      window.location.href = '/';
    }
  };

  // Calculate completion percentage for progress indication
  const getFormulaDisplayName = (formula: string) => {
    switch (formula) {
      case 'mifflin': return 'Mifflin-St Jeor';
      case 'katch': return 'Katch-McArdle';
      case 'cunningham': return 'Cunningham';
      case 'manual': return 'Manual Entry';
      default: return formula;
    }
  };

  return (
    <div className={cn("space-y-8 max-w-7xl mx-auto px-4 lg:px-6", className)}>
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-2">
          Your Nutrition Plan
        </h1>
        <p className="text-base text-gray-600 max-w-2xl mx-auto">
          Complete macronutrient breakdown with personalized guidance
        </p>
        {isSharedResult && sharedDateLabel && (
          <p className="text-sm text-gray-500 mt-2">
            📅 Generated: {sharedDateLabel}
          </p>
        )}
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm text-gray-500">Resting Metabolic Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {derivedMetrics.rmr}
            </div>
            <div className="text-sm text-gray-600">kcal/day</div>
            <div className="text-xs text-gray-500 mt-2">
              Formula: {getFormulaDisplayName(derivedMetrics.formulaUsed)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm text-gray-500">Total Daily Expenditure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary mb-1">
              {derivedMetrics.tdee}
            </div>
            <div className="text-sm text-gray-600">kcal/day</div>
            <div className="text-xs text-gray-500 mt-2">
              Activity factor: {derivedMetrics.palFactor.toFixed(2)}x
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm text-gray-500">Target Calories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary mb-1">
              {macroPlan.targetCalories.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">kcal/day</div>
            <div className="text-xs text-gray-500 mt-2">
              Goal-adjusted target
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Macronutrient Visualization */}
      <MacroVisualizer macroPlan={macroPlan} />

      {/* Two-column layout for guidance and action plan */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Personalized Guidance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">✨</span>
              Personalized Guidance
            </CardTitle>
            <p className="text-sm text-gray-600">
              Evidence-based recommendations tailored to your profile
            </p>
          </CardHeader>
          <CardContent>
            <GuidanceList
              guidance={guidance}
              loading={false}
              title=""
              showFilters={guidance.length > 5}
              className="border-none shadow-none p-0"
            />
          </CardContent>
        </Card>

        {/* Action Plan */}
        <ActionPlan guidance={guidance} />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center pt-6 border-t print:hidden">
        <Button
          variant="outline"
          onClick={handleBackToCalculator}
          className="flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Calculator</span>
        </Button>

        <Button
          variant="outline"
          onClick={handlePrint}
          className="flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>Print Plan</span>
        </Button>

        <Button
          id="share-button"
          onClick={handleShare}
          className="flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          <span>Share Results</span>
        </Button>
      </div>

      {/* Footer disclaimer */}
      <div className="text-center pt-6 border-t">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs text-gray-500 leading-relaxed">
            ⚕️ This nutrition plan is for educational purposes only and is not a substitute for professional medical advice. 
            Always consult with a qualified healthcare provider or registered dietitian before making significant changes to your diet, 
            especially if you have any health conditions or concerns.
          </p>
        </div>
      </div>
    </div>
  );
} 
