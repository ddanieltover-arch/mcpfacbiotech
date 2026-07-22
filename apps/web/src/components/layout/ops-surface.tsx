import type { ReactNode } from 'react';
import { motionReduceProps } from '@/lib/motion-policy';
import { cn } from '@/lib/utils';

type OpsSurfaceProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Marks admin / checkout / portal UIs as hover/focus-only.
 * Disables press-scale and other decorative motion from shared primitives.
 */
export function OpsSurface({ children, className }: OpsSurfaceProps) {
  return (
    <div className={cn(className)} {...motionReduceProps}>
      {children}
    </div>
  );
}
