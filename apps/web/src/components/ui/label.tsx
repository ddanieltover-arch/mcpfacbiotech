import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  isRequired?: boolean;
}

export function Label({ className, isRequired = false, children, ...props }: LabelProps) {
  return (
    <label
      className={cn('mb-1.5 block text-sm font-medium text-neutral-700', className)}
      {...props}
    >
      {children}
      {isRequired ? (
        <span className="ml-0.5 text-error" aria-hidden>
          *
        </span>
      ) : null}
    </label>
  );
}
