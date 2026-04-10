import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const navigateTo = (path: string) => {
    navigate(path);
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
    <div className={cn("space-y-8 max-w-7xl mx-auto px-4 lg:px-6 animate-fade-in", className)}>
      {/* Header Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-normal text-foreground tracking-tight">
          Your Nutrition Plan
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Complete macronutrient breakdown with personalized guidance
        </p>
        {isSharedResult && sharedDateLabel && (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-sm text-muted font-medium">
            📅 Generated: {sharedDateLabel}
          </div>
        )}
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border bg-surface shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted uppercase tracking-wider">Resting Metabolic Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-foreground">{derivedMetrics.rmr}</span>
              <span className="text-sm text-muted">kcal/day</span>
            </div>
            <div className="text-xs text-muted mt-3 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              Formula: {getFormulaDisplayName(derivedMetrics.formulaUsed)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted uppercase tracking-wider">Total Daily Expenditure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-primary">{derivedMetrics.tdee}</span>
              <span className="text-sm text-muted">kcal/day</span>
            </div>
            <div className="text-xs text-muted mt-3 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              Activity factor: {derivedMetrics.palFactor.toFixed(2)}x
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5 shadow-sm hover:shadow-md transition-shadow duration-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <svg className="w-24 h-24 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary uppercase tracking-wider">Target Calories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-4xl font-bold text-primary">{macroPlan.targetCalories.toLocaleString()}</span>
              <span className="text-sm text-primary/80">kcal/day</span>
            </div>
            <div className="text-xs text-primary/70 mt-3 relative z-10 font-medium">
              Goal-adjusted target
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Macronutrient Visualization */}
      <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
        <MacroVisualizer macroPlan={macroPlan} />
      </section>

      {/* Two-column layout for guidance and action plan */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
        {/* Personalized Guidance */}
        <Card className="border-border bg-surface shadow-sm h-full">
          <CardHeader className="border-b border-border/50 bg-secondary/30">
            <CardTitle className="flex items-center text-lg font-semibold text-foreground">
              <span className="mr-2 text-xl">✨</span>
              Personalized Guidance
            </CardTitle>
            <p className="text-sm text-muted">
              Evidence-based recommendations tailored to your profile
            </p>
          </CardHeader>
          <CardContent className="p-0">
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
        <div className="h-full">
          <ActionPlan guidance={guidance} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center pt-8 pb-4 border-t border-border print:hidden animate-fade-in" style={{ animationDelay: '300ms' }}>
        <Button
          variant="outline"
          onClick={handleBackToCalculator}
          className="flex items-center space-x-2 h-12 px-6 text-base hover:bg-secondary"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Calculator</span>
        </Button>

        <Button
          variant="outline"
          onClick={handlePrint}
          className="flex items-center space-x-2 h-12 px-6 text-base hover:bg-secondary"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>Print Plan</span>
        </Button>

        <Button
          id="share-button"
          onClick={handleShare}
          className="flex items-center space-x-2 h-12 px-6 text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          <span>Share Results</span>
        </Button>
      </div>

      {/* Footer disclaimer */}
      <div className="text-center pt-6 pb-8 border-t border-border">
        <div className="max-w-2xl mx-auto px-4">
          <p className="text-xs text-muted leading-relaxed">
            ⚕️ This nutrition plan is for educational purposes only and is not a substitute for professional medical advice.
            Always consult with a qualified healthcare provider or registered dietitian before making significant changes to your diet,
            especially if you have any health conditions or concerns.
          </p>
        </div>
      </div>
    </div>
  );
} 
