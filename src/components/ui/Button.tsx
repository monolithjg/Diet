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
          "inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-offset-[length:var(--focus-ring-offset)] disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
          {
              "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active shadow-sm hover:shadow-md": variant === 'primary',
              "bg-secondary text-secondary-foreground hover:bg-surface-overlay": variant === 'secondary',
              "border border-border bg-transparent text-primary hover:bg-primary-soft": variant === 'outline',
              "bg-transparent text-foreground hover:bg-secondary": variant === 'ghost',
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
