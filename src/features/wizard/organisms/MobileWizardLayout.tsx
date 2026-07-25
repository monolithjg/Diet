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
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <header className={step === 1 ? "space-y-8 py-4 md:py-8" : "space-y-4"}>
        {step === 1 && <div className="max-w-4xl space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">A plan you can live with</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-foreground md:text-7xl md:leading-[0.98] md:tracking-[-0.05em]">
            Nutrition built around your life.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
            Get a clear daily calorie target, practical macro ranges, and diet guidance shaped around your body, routine, and goals.
          </p>
        </div>}
        <div className="max-w-xl mx-auto">
          {progressBar}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content Card */}
        <main className="lg:col-span-8 bg-surface shadow-soft rounded-3xl transition-shadow duration-200 hover:shadow-card-hover">
          {/* Step Header */}
          <div className="p-6 pb-2 md:p-8 md:pb-3">
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
            <div className="mx-6 rounded-2xl bg-secondary/60 lg:hidden animate-fade-in">
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
          <div className="sticky bottom-0 z-20 p-4 md:p-6 bg-surface/95 backdrop-blur shadow-[0_-8px_24px_rgb(16_24_40_/_0.06)] rounded-b-3xl">
            {navigationControls}
          </div>
        </main>

        {/* Guidance Panel (Sidebar) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Render passed guidance panel */}
          {guidancePanel}

          {/* Desktop Help Panel */}
          {stepHelp && (
            <div className="hidden lg:block bg-surface shadow-card rounded-2xl p-6 sticky top-24">
              <LazyMobileHelpGuidance
                title={stepHelp.title}
                helpType={stepHelp.helpType}
              />
            </div>
          )}

          {/* Quick Tips Card */}
          <div className="bg-surface-subtle rounded-2xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z"/></svg>
              Quick Tips
            </h3>
            <div className="space-y-3 text-sm text-muted">
              {step === 1 && (
                <>
                  <p>• Use your most recent accurate measurements</p>
                  <p>• Choose the unit system you're comfortable with</p>
                  <p>• Your profile is saved in this browser so you can return; clear it anytime</p>
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
          <p>• Sleep and stress can affect recovery and plan consistency</p>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
} 
