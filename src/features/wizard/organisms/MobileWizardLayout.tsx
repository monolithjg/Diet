import React, { useState } from 'react';
import { LazyMobileHelpGuidance } from '../atoms/LazyMobileHelpGuidance';

interface MobileWizardLayoutProps {
  step: number;
  totalSteps?: number;
  stepTitle: string;
  stepDescription: string;
  stepContent: React.ReactNode;
  navigationControls: React.ReactNode;
  guidancePanel: React.ReactNode;
  progressBar: React.ReactNode;
}

export function MobileWizardLayout({
  step,
  totalSteps = 4,
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
        return { title: "Diet Preferences Help", helpType: 'dietPreferences' as const };
      default:
        return null;
    }
  };

  const stepHelp = getStepHelp();

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl min-h-screen flex flex-col">
      {/* Header Section: Title, Progress Bar */}
      <header className="mb-6">
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 text-gray-800">
            Diet & Macronutrient Calculator
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Get personalized nutrition recommendations based on your goals and lifestyle.
          </p>
        </div>
        {progressBar}
      </header>

      <div className="flex-1 min-h-screen grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {/* Main Content Area: Step Title, Description, Form */}
        <main className="lg:col-span-2 bg-white shadow-lg sm:shadow-xl rounded-lg flex-1 flex flex-col h-full w-full overflow-hidden">
          {/* Step Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-700">
                  {stepTitle}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {stepDescription}
                </p>
              </div>
              
              {/* Mobile Help Button */}
              {stepHelp && (
                <button
                  onClick={() => setShowMobileHelp(!showMobileHelp)}
                  className="ml-4 p-2 text-gray-400 hover:text-gray-600 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 lg:hidden"
                  aria-label="Toggle help"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Help Panel (Collapsible) - Now Lazy Loaded */}
          {stepHelp && showMobileHelp && (
            <div className="border-b border-gray-200 bg-gray-50 lg:hidden">
              <div className="p-4">
                <LazyMobileHelpGuidance
                  title={stepHelp.title}
                  helpType={stepHelp.helpType}
                />
              </div>
            </div>
          )}

          {/* Step Content (Form) */}
          <div className="flex-grow p-4 sm:p-6 overflow-y-auto flex items-center justify-center">
            <div className="flex flex-col items-center justify-center h-full">
              {stepContent}
            </div>
          </div>

          {/* Step Navigation */}
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
            {navigationControls}
          </div>
        </main>

        {/* Guidance Panel Area (Sidebar on larger screens) */}
        <aside className="lg:col-span-1 space-y-4">
          {/* Main Guidance Panel */}
          <div className="hidden lg:block">
            {guidancePanel}
          </div>

          {/* Desktop Help Panel - Now Lazy Loaded */}
          {stepHelp && (
            <div className="hidden lg:block">
              <LazyMobileHelpGuidance
                title={stepHelp.title}
                helpType={stepHelp.helpType}
              />
            </div>
          )}

          {/* Mobile Guidance Panel (Simplified) */}
          <div className="lg:hidden bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
              <span className="text-lg mr-2">✨</span>
              Quick Tips
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
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
      
      {/* Mobile Progress Indicator - Fixed Bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-10">
        <div className="container mx-auto px-1">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <span>Step {step} of {totalSteps}</span>
            <div className="flex space-x-1">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index + 1 === step ? 'bg-primary' : 
                    index + 1 < step ? 'bg-primary/60' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Padding for Fixed Element */}
      <div className="lg:hidden h-16" />
    </div>
  );
} 
