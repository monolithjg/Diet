import React, { Suspense } from 'react';
import { ChunkErrorBoundary } from './ChunkErrorBoundary';

// Define HelpItem interface locally since it's not exported
interface HelpItem {
  question: string;
  answer: string;
  category?: 'basic' | 'advanced' | 'troubleshooting';
}

// Note: Help content is loaded dynamically using dynamic imports below

interface LazyMobileHelpGuidanceProps {
  title: string;
  helpType: 'personalInfo' | 'activityGoals' | 'dietPreferences';
  className?: string;
}

// Component that loads help content and renders the help guidance
function HelpContentRenderer({
  title,
  helpType,
  className
}: LazyMobileHelpGuidanceProps) {
  const [helpItems, setHelpItems] = React.useState<HelpItem[]>([]);
  const [HelpComponent, setHelpComponent] = React.useState<React.ComponentType<any> | null>(null);

  React.useEffect(() => {
    // Load help module dynamically
    import('./MobileHelpGuidance').then((module) => {
      setHelpComponent(() => module.MobileHelpGuidance);

      switch (helpType) {
        case 'personalInfo':
          setHelpItems(module.personalInfoHelp);
          break;
        case 'activityGoals':
          setHelpItems(module.activityGoalsHelp);
          break;
        case 'dietPreferences':
          setHelpItems(module.dietPreferencesHelp);
          break;
      }
    });
  }, [helpType]);

  if (!HelpComponent || helpItems.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center">
          <div className="animate-pulse flex items-center space-x-3">
          <div className="w-6 h-6 bg-border-strong rounded-full"></div>
            <div className="h-4 bg-border-strong rounded w-24"></div>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <div className="animate-pulse h-3 bg-border rounded w-full"></div>
          <div className="animate-pulse h-3 bg-border rounded w-3/4"></div>
          <div className="animate-pulse h-3 bg-border rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return React.createElement(HelpComponent, {
    title,
    helpItems,
    className
  });
}

// Main lazy help guidance component
export function LazyMobileHelpGuidance(props: LazyMobileHelpGuidanceProps) {
  return (
    <ChunkErrorBoundary stepName="Help System">
      <Suspense
        fallback={
          <div className="bg-surface border border-border rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-center">
              <div className="animate-pulse flex items-center space-x-3">
                <div className="w-6 h-6 bg-border-strong rounded-full"></div>
                <div className="h-4 bg-border-strong rounded w-24"></div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="animate-pulse h-3 bg-border rounded w-full"></div>
              <div className="animate-pulse h-3 bg-border rounded w-3/4"></div>
              <div className="animate-pulse h-3 bg-border rounded w-1/2"></div>
            </div>
          </div>
        }
      >
        <HelpContentRenderer {...props} />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
