import type { Transition, Variants } from 'framer-motion';

export const easeOut: Transition['ease'] = [0.22, 1, 0.36, 1];

/** Shared Framer Motion variants (Volume 2 / Appendix D). */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: easeOut },
  },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOut },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: easeOut },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeOut },
  },
};

export const staggerChildren = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
} satisfies Variants;

/** Hero / section entrance — slightly slower stagger for readable hierarchy. */
export const staggerChildrenSlow = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
} satisfies Variants;

const instantVisible: Variants = {
  hidden: { opacity: 1, y: 0, x: 0, scale: 1 },
  visible: { opacity: 1, y: 0, x: 0, scale: 1, transition: { duration: 0 } },
};

/** Collapse animated variants when `prefers-reduced-motion` is set. */
export function variantsFor(
  reduceMotion: boolean | null,
  variants: Variants,
): Variants {
  if (reduceMotion) return instantVisible;
  return variants;
}

export function staggerFor(
  reduceMotion: boolean | null,
  variants: Variants = staggerChildren,
): Variants {
  if (reduceMotion) {
    return { hidden: {}, visible: { transition: { staggerChildren: 0, delayChildren: 0 } } };
  }
  return variants;
}

export function transitionFor(
  reduceMotion: boolean | null,
  transition: Transition,
): Transition {
  if (reduceMotion) return { duration: 0 };
  return transition;
}
