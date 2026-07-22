'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { TRUST_STATS } from '@/lib/marketing-content';
import { fadeIn, staggerChildren, staggerFor, variantsFor } from '@/lib/motion';
import { cn } from '@/lib/utils';

type Stat = { value: string; label: string };

type StatGridProps = {
  stats?: ReadonlyArray<Stat>;
  className?: string;
  /** `grid` — card grid (design system). `strip` — thin below-fold trust bar on homepage. */
  variant?: 'grid' | 'strip';
};

/** Parse simple countable values like "99%+" or "50+". Ranges/text return null. */
function parseCountable(value: string): { target: number; prefix: string; suffix: string } | null {
  const match = value.match(/^([^\d]*)(\d+)(.*)$/);
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  if (/\d/.test(suffix)) return null;
  return { target: Number(digits), prefix, suffix };
}

function StatValue({
  value,
  active,
  compact = false,
}: {
  value: string;
  active: boolean;
  compact?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const parsed = useMemo(() => parseCountable(value), [value]);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!parsed || reduceMotion) {
      setDisplay(value);
      return;
    }

    if (!active) {
      setDisplay(`${parsed.prefix}0${parsed.suffix}`);
      return;
    }

    const start = performance.now();
    const duration = 900;
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      const current = Math.round(parsed.target * eased);
      setDisplay(`${parsed.prefix}${current}${parsed.suffix}`);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, parsed, reduceMotion, value]);

  return (
    <p
      className={cn(
        'font-heading font-bold text-brand-deep',
        compact ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl',
      )}
    >
      {display}
    </p>
  );
}

export function StatGrid({ stats = TRUST_STATS, className, variant = 'grid' }: StatGridProps) {
  const reduceMotion = useReducedMotion();
  const container = staggerFor(reduceMotion, staggerChildren);
  const item = variantsFor(reduceMotion, fadeIn);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const isStrip = variant === 'strip';

  return (
    <motion.div
      ref={ref}
      className={cn(
        isStrip
          ? 'grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4 sm:gap-x-6'
          : 'grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6',
        className,
      )}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          variants={item}
          className={cn(
            isStrip
              ? 'relative text-center sm:px-2'
              : 'rounded-xl border border-neutral-200 bg-white px-4 py-5 text-center shadow-sm',
            isStrip &&
              index > 0 &&
              'sm:before:absolute sm:before:-left-3 sm:before:top-1/2 sm:before:h-8 sm:before:w-px sm:before:-translate-y-1/2 sm:before:bg-neutral-200',
          )}
        >
          <StatValue value={stat.value} active={inView} compact={isStrip} />
          <p
            className={cn(
              'text-neutral-500',
              isStrip ? 'mt-0.5 text-[11px] leading-snug sm:text-xs' : 'mt-1 text-xs sm:text-sm',
            )}
          >
            {stat.label}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
