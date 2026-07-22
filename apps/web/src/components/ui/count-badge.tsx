'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { transitionFor } from '@/lib/motion';

type CountBadgeProps = {
  count: number;
  className?: string;
  /** Cap display at 9+ */
  max?: number;
};

export function CountBadge({ count, className, max = 9 }: CountBadgeProps) {
  const reduceMotion = useReducedMotion();
  const label = count > max ? `${max}+` : String(count);

  return (
    <AnimatePresence mode="popLayout">
      {count > 0 ? (
        <motion.span
          key={label}
          initial={reduceMotion ? false : { scale: 0.55, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={reduceMotion ? undefined : { scale: 0.55, opacity: 0 }}
          transition={transitionFor(reduceMotion, {
            type: 'spring',
            stiffness: 520,
            damping: 28,
          })}
          className={cn(
            'absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-deep px-0.5 text-[10px] font-bold text-white',
            className,
          )}
          aria-hidden
        >
          {label}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}
