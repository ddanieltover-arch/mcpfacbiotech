'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { StatGrid } from '@/components/marketing/stat-grid';
import { HOME_HERO } from '@/lib/marketing-content';
import {
  slideUp,
  staggerChildrenSlow,
  staggerFor,
  variantsFor,
} from '@/lib/motion';

export function HomeHero() {
  const reduceMotion = useReducedMotion();
  const item = variantsFor(reduceMotion, slideUp);
  const container = staggerFor(reduceMotion, staggerChildrenSlow);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-pale via-white to-white">
      {/* Soft ambient depth — static under reduced motion */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-brand-pale)_0%,_transparent_55%)] opacity-80"
      />
      {!reduceMotion ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-brand-leaf/10 blur-3xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      ) : null}

      <motion.div
        className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={container} className="min-w-0">
          <motion.p
            variants={item}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-brand-deep shadow-sm ring-1 ring-brand-pale"
          >
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-leaf motion-reduce:animate-none" />
            {HOME_HERO.eyebrow}
          </motion.p>

          <motion.h1
            variants={item}
            className="max-w-3xl font-heading text-4xl font-bold tracking-tight text-brand-deep sm:text-5xl lg:text-6xl"
          >
            {HOME_HERO.title}
            <br />
            <span className="text-gradient">{HOME_HERO.titleAccent}</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-3 font-heading text-base font-medium tracking-wide text-brand-natural sm:text-lg"
          >
            Learn • Understand • Grow
          </motion.p>

          <motion.p
            variants={item}
            className="mt-5 max-w-xl text-base text-neutral-600 sm:text-lg"
          >
            {HOME_HERO.description}
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={HOME_HERO.primaryCta.href}
              className="inline-flex items-center rounded-lg bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-md transition-[color,background-color,box-shadow,transform] duration-200 hover:bg-brand-natural hover:shadow-lg motion-safe:active:scale-[0.98]"
            >
              {HOME_HERO.primaryCta.label}
            </Link>
            <Link
              href={HOME_HERO.secondaryCta.href}
              className="inline-flex items-center rounded-lg border-2 border-brand-deep px-6 py-3 text-sm font-semibold text-brand-deep transition-[color,background-color,border-color,transform] duration-200 hover:bg-brand-deep hover:text-white motion-safe:active:scale-[0.98]"
            >
              {HOME_HERO.secondaryCta.label}
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          variants={item}
          className="rounded-2xl border border-brand-deep/10 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-natural">
            Laboratory trust signals
          </p>
          <StatGrid className="mt-5" />
          <p className="mt-5 text-xs leading-relaxed text-neutral-500">
            Specs and batch documents vary by SKU. Always confirm purity and COA availability on the
            product page before experimental use.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
