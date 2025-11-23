import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
          {
              "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary-400 shadow-sm hover:shadow-md": variant === 'primary',
              "bg-neutral-100 text-slate-900 hover:bg-neutral-200": variant === 'secondary',
              "border border-neutral-200 bg-transparent text-primary-600 hover:bg-primary-50": variant === 'outline',
              "bg-transparent text-slate-700 hover:bg-neutral-100": variant === 'ghost',
          },
          {
            "h-8 px-3 text-sm": size === 'sm',
            "h-10 py-2 px-5": size === 'md',
            "h-12 px-8 text-lg": size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
export type { ButtonProps }; 