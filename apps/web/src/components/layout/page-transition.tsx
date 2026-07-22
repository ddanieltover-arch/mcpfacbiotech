'use client';

import { useEffect, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { easeOut, transitionFor } from '@/lib/motion';
import { isMarketingTransitionPath } from '@/lib/motion-policy';

/** Tracks the last committed path so the initial SSR/hydration paint never fades in. */
let lastPathname: string | null = null;

type PageTransitionProps = {
  children: ReactNode;
};

/**
 * Soft opacity + slight rise on marketing route changes only.
 * Admin, checkout, and portal routes never animate (ops = hover/focus only).
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const isClientNavigation = lastPathname !== null && lastPathname !== pathname;
  const enabled =
    isClientNavigation && !reduceMotion && isMarketingTransitionPath(pathname);

  useEffect(() => {
    lastPathname = pathname;
  }, [pathname]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitionFor(false, { duration: 0.28, ease: easeOut })}
    >
      {children}
    </motion.div>
  );
}

export { isMarketingTransitionPath };
