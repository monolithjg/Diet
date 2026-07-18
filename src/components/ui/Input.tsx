import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, helperText, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-neutral-400",
            "text-slate-900 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary-600",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger text-danger",
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && (
          <p className={cn(
            "text-sm mt-1",
            error ? "text-danger" : "text-neutral-500"
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
export type { InputProps }; 