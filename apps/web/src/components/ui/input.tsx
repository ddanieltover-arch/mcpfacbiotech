import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isInvalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', isInvalid = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        aria-invalid={isInvalid || undefined}
        className={cn(
          'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors',
          'placeholder:text-neutral-400',
          'focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20',
          'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-60',
          isInvalid ? 'border-error focus:border-error focus:ring-error/20' : 'border-neutral-300',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
