import React, { useState } from 'react';
import { LazyMobileHelpGuidance } from '../atoms/LazyMobileHelpGuidance';

interface MobileWizardLayoutProps {
  step: number;
  stepTitle: string;
  stepDescription: string;
  stepContent: React.ReactNode;
  navigationControls: React.ReactNode;
  guidancePanel: React.ReactNode;
  progressBar: React.ReactNode;
}

export function MobileWizardLayout({
  step,
  stepTitle,
  stepDescription,
  stepContent,
  navigationControls,
  guidancePanel,
  progressBar,
}: MobileWizardLayoutProps) {
  const [showMobileHelp, setShowMobileHelp] = useState(false);

  const getStepHelp = () => {
    switch (step) {
      case 1:
        return { title: "Personal Information Help", helpType: 'personalInfo' as const };
      case 3:
        return { title: "Activity & Goals Help", helpType: 'activityGoals' as const };
      case 4:
        return { title: "Eating Style Help", helpType: 'dietPreferences' as const };
      default:
        return null;
    }
  };

  const stepHelp = getStepHelp();

  return (
    <div className="flex flex-col gap-8 animate-slide-up">
      {/* Header Section */}
      <header className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Diet Calculator
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Get personalized nutrition recommendations based on your goals and lifestyle.
          </p>
        </div>
        <div className="max-w-xl mx-auto">
          {progressBar}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content Card */}
        <main className="lg:col-span-8 bg-surface shadow-soft rounded-3xl border border-border transition-all duration-300 hover:shadow-card-hover">
          {/* Step Header */}
          <div className="p-6 md:p-8 border-b border-border bg-secondary/30 rounded-t-3xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {stepTitle}
                </h2>
                <p className="text-muted mt-2 text-base">
                  {stepDescription}
                </p>
              </div>

              {/* Mobile Help Toggle */}
              {stepHelp && (
                <button
                  onClick={() => setShowMobileHelp(!showMobileHelp)}
                  className="lg:hidden p-2 text-muted hover:text-primary transition-colors rounded-full hover:bg-secondary"
                  aria-label="Toggle help"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Help Panel (Collapsible) */}
          {stepHelp && showMobileHelp && (
            <div className="border-b border-border bg-secondary/20 lg:hidden animate-fade-in">
              <div className="p-6">
                <LazyMobileHelpGuidance
                  title={stepHelp.title}
                  helpType={stepHelp.helpType}
                />
              </div>
            </div>
          )}

          {/* Step Content (Form) */}
          <div className="p-6 md:p-10 min-h-[400px] flex flex-col justify-center">
            {stepContent}
          </div>

          {/* Step Navigation */}
          <div className="sticky bottom-0 z-20 p-4 md:p-6 border-t border-border bg-surface/95 backdrop-blur shadow-[0_-8px_24px_rgb(16_24_40_/_0.08)] rounded-b-3xl">
            {navigationControls}
          </div>
        </main>

        {/* Guidance Panel (Sidebar) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Render passed guidance panel */}
          {guidancePanel}

          {/* Desktop Help Panel */}
          {stepHelp && (
            <div className="hidden lg:block bg-surface shadow-card rounded-2xl border border-border p-6 sticky top-24">
              <LazyMobileHelpGuidance
                title={stepHelp.title}
                helpType={stepHelp.helpType}
              />
            </div>
          )}

          {/* Quick Tips Card */}
          <div className="bg-surface/50 border border-border rounded-2xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="text-xl">✨</span>
              Quick Tips
            </h3>
            <div className="space-y-3 text-sm text-muted">
              {step === 1 && (
                <>
                  <p>• Use your most recent accurate measurements</p>
                  <p>• Choose the unit system you're comfortable with</p>
                  <p>• Your data is kept private and secure</p>
                </>
              )}
              {step === 2 && (
                <>
                  <p>• Body fat percentage is optional but helpful</p>
                  <p>• Skip sections you're unsure about</p>
                  <p>• You can always add this information later</p>
                </>
              )}
              {step === 3 && (
                <>
                  <p>• Consider all daily movement, not just formal exercise</p>
                  <p>• Choose goals based on your current priorities</p>
                  <p>• When in doubt, start conservatively</p>
                </>
              )}
              {step === 4 && (
                <>
                  <p>• Pick the diet style you can stick to long-term</p>
                  <p>• Be honest about allergies and intolerances</p>
                  <p>• Sleep and stress significantly impact results</p>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
} 
