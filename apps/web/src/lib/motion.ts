import type { Variants, Transition } from 'framer-motion';

/**
 * Shared Framer Motion variants per Appendix D animation rules.
 * Reuse these across the app instead of inlining transition configs.
 */

// ─── Transition Presets ──────────────────────────────────────────────────────

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const easeTransition: Transition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1],
};

export const slowEaseTransition: Transition = {
  duration: 0.5,
  ease: [0.25, 0.1, 0.25, 1],
};

// ─── Entry Animations ────────────────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: easeTransition },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: easeTransition },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: easeTransition },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: easeTransition },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: easeTransition },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: springTransition },
};

// ─── Stagger Container ──────────────────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: easeTransition,
  },
};

// ─── Hover Effects ───────────────────────────────────────────────────────────

export const hoverLift = {
  whileHover: { y: -4, transition: easeTransition },
  whileTap: { scale: 0.98 },
};

export const hoverScale = {
  whileHover: { scale: 1.02, transition: easeTransition },
  whileTap: { scale: 0.98 },
};

// ─── Page Transitions ────────────────────────────────────────────────────────

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: slowEaseTransition },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};
