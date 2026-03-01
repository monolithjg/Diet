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
          "inline-flex items-center justify-center rounded-xl font-medium tracking-tight transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 ring-offset-white",
          {
            "bg-slate-900 text-white shadow-[0_1px_2px_rgba(15,23,42,0.28),0_8px_20px_rgba(15,23,42,0.12)] hover:-translate-y-px hover:bg-slate-800": variant === 'primary',
            "border border-slate-200 bg-white text-slate-900 shadow-sm hover:-translate-y-px hover:bg-slate-50": variant === 'secondary',
            "border border-slate-300 bg-white/70 text-slate-700 backdrop-blur-sm hover:border-slate-400 hover:bg-white": variant === 'outline',
            "text-slate-600 hover:bg-slate-100 hover:text-slate-900": variant === 'ghost',
          },
          {
            "h-9 px-3 text-sm": size === 'sm',
            "h-10 px-5 text-sm": size === 'md',
            "h-12 px-8 text-base": size === 'lg',
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
