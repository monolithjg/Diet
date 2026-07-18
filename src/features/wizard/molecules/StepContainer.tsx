import React from 'react';

interface StepContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function StepContainer({
  children,
  className = ''
}: StepContainerProps) {
  return (
    <div className={`w-full max-w-2xl mx-auto flex flex-col gap-6 ${className}`}>
      {children}
    </div>
  );
} 