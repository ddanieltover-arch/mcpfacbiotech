import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  isInvalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, isInvalid = false, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={isInvalid || undefined}
        className={cn(
          'flex min-h-24 w-full rounded-lg border bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors',
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
Textarea.displayName = 'Textarea';
