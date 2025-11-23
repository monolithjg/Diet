import React, { useMemo } from 'react';
void React;
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { GuidanceList } from '../../../components/ui/GuidanceList';
import { MacroVisualizer } from './MacroVisualizer';
import { DailyTargets } from './DailyTargets';
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
    <div className={cn("space-y-8 max-w-7xl mx-auto px-4 lg:px-6 pb-12", className)}>
      {/* Header Section */}
      <div className="text-center space-y-3 pt-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          Your Nutrition Plan
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Complete macronutrient breakdown with personalized guidance
        </p>
        {isSharedResult && sharedDateLabel && (
          <p className="text-sm text-gray-400">
            📅 Generated: {sharedDateLabel}
          </p>
        )}
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wide">Resting Metabolic Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-gray-900">{Math.round(derivedMetrics.rmr)}</span>
              <span className="text-sm font-medium text-gray-500">kcal/day</span>
            </div>
            <div className="text-xs text-gray-400 mt-3">
              Formula: {getFormulaDisplayName(derivedMetrics.formulaUsed)}
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Daily Expenditure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-blue-600">{Math.round(derivedMetrics.tdee)}</span>
              <span className="text-sm font-medium text-gray-500">kcal/day</span>
            </div>
            <div className="text-xs text-gray-400 mt-3">
              Activity factor: {derivedMetrics.palFactor.toFixed(2)}x
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-100 h-full shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-blue-600 uppercase tracking-wide">Target Calories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-blue-700">{macroPlan.targetCalories.toLocaleString()}</span>
              <span className="text-sm font-medium text-blue-600">kcal/day</span>
            </div>
            <div className="text-xs text-blue-500 mt-3 font-medium">
              Goal-adjusted target
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Macronutrient Visualization */}
      <MacroVisualizer macroPlan={macroPlan} />

      {/* Daily Targets */}
      <DailyTargets macroPlan={macroPlan} />

      {/* Two-column layout for guidance and action plan */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Personalized Guidance */}
        <Card className="h-full bg-blue-50/30 border-blue-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-gray-900">
                Personalized Guidance
              </CardTitle>
              <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full border">
                {guidance.length} recommendations
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <GuidanceList
              guidance={guidance}
              loading={false}
              title=""
              showFilters={false}
              className="border-none shadow-none p-0 bg-transparent"
            />
          </CardContent>
        </Card>

        {/* Action Plan */}
        <ActionPlan guidance={guidance} className="h-full border-blue-100" />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center pt-8 border-t border-gray-100 print:hidden">
        <Button
          variant="outline"
          onClick={handleBackToCalculator}
          className="h-12 px-6 rounded-xl border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Calculator
        </Button>

        <Button
          variant="outline"
          onClick={handlePrint}
          className="h-12 px-6 rounded-xl border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Plan
        </Button>

        <Button
          id="share-button"
          onClick={handleShare}
          className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          Share Results
        </Button>
      </div>

      {/* Footer disclaimer */}
      <div className="text-center pt-8 pb-8">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-xs text-gray-400 leading-relaxed font-light">
            ‡ This nutrition plan is for educational purposes only and is not a substitute for professional medical advice.
            Always consult with a qualified healthcare provider or registered dietitian before making significant changes to your diet, 
            especially if you have any health conditions or concerns.
          </p>
        </div>
      </div>
    </div>
  );
}
