'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  HOME_HERO,
  HOME_HERO_SLIDES,
  HOME_HERO_SLIDES_MOBILE,
} from '@/lib/marketing-content';
import {
  slideUp,
  staggerChildrenSlow,
  staggerFor,
  variantsFor,
} from '@/lib/motion';

const SLIDE_MS = 5000;
const FADE_S = 1.2;

type HeroSlide =
  | (typeof HOME_HERO_SLIDES)[number]
  | (typeof HOME_HERO_SLIDES_MOBILE)[number];

function HeroSlideLayer({
  slides,
  active,
  reduceMotion,
  className,
  priorityFirst,
}: {
  slides: readonly HeroSlide[];
  active: number;
  reduceMotion: boolean | null;
  className: string;
  priorityFirst?: boolean;
}) {
  return (
    <div className={`absolute inset-0 ${className}`} aria-hidden>
      {slides.map((slide, index) => {
        const isActive = index === active;

        return (
          <motion.div
            key={slide.src}
            className="absolute inset-0 will-change-transform"
            initial={false}
            animate={
              reduceMotion
                ? { opacity: isActive ? 1 : 0, scale: 1 }
                : {
                    opacity: isActive ? 1 : 0,
                    scale: isActive ? 1 : 1.03,
                  }
            }
            transition={{
              opacity: {
                duration: reduceMotion ? 0 : FADE_S,
                ease: [0.22, 1, 0.36, 1],
              },
              scale: {
                duration: reduceMotion ? 0 : isActive ? SLIDE_MS / 1000 : FADE_S,
                ease: isActive ? 'linear' : [0.22, 1, 0.36, 1],
              },
            }}
            style={{ zIndex: isActive ? 1 : 0 }}
          >
            <Image
              src={slide.src}
              alt=""
              fill
              priority={priorityFirst && index === 0}
              sizes="100vw"
              className={`object-cover ${slide.objectPosition}`}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

export function HomeHero() {
  const reduceMotion = useReducedMotion();
  const item = variantsFor(reduceMotion, slideUp);
  const container = staggerFor(reduceMotion, staggerChildrenSlow);
  const [active, setActive] = useState(0);
  const slideCount = Math.max(
    HOME_HERO_SLIDES.length,
    HOME_HERO_SLIDES_MOBILE.length,
  );

  useEffect(() => {
    if (reduceMotion || slideCount < 2) return;

    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % slideCount);
    }, SLIDE_MS);

    return () => window.clearInterval(id);
  }, [reduceMotion, slideCount]);

  return (
    <section className="relative isolate min-h-[min(92vh,52rem)] overflow-hidden bg-brand-deep text-white">
      {/* Portrait mobile slides — products first */}
      <HeroSlideLayer
        slides={HOME_HERO_SLIDES_MOBILE}
        active={active % HOME_HERO_SLIDES_MOBILE.length}
        reduceMotion={reduceMotion}
        className="md:hidden"
        priorityFirst
      />
      {/* Landscape desktop / tablet slides */}
      <HeroSlideLayer
        slides={HOME_HERO_SLIDES}
        active={active % HOME_HERO_SLIDES.length}
        reduceMotion={reduceMotion}
        className="hidden md:block"
        priorityFirst
      />

      {/* Scrim: bottom-weighted on mobile (portrait), left-weighted from md up */}
      <div
        className="absolute inset-0 z-[2] bg-gradient-to-t from-brand-deep via-brand-deep/75 to-brand-deep/40 md:bg-gradient-to-r md:from-brand-deep/95 md:via-brand-deep/55 md:to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-0 z-[2] bg-gradient-to-t from-brand-deep/85 via-transparent to-brand-deep/25 md:from-brand-deep/80 md:to-brand-deep/35"
        aria-hidden
      />

      {!reduceMotion ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-16 top-1/3 z-[2] h-64 w-64 rounded-full bg-brand-leaf/15 blur-3xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      ) : null}

      <motion.div
        className="relative z-[3] mx-auto flex min-h-[min(92vh,52rem)] max-w-7xl flex-col justify-end px-4 pb-16 pt-24 sm:justify-center sm:py-24 lg:py-28"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-xl lg:max-w-2xl">
          <motion.p
            variants={item}
            className="mb-3 font-heading text-sm font-medium tracking-[0.18em] text-brand-leaf uppercase"
          >
            MCPFAC BIOTECH
          </motion.p>

          <motion.h1
            variants={item}
            className="font-heading text-4xl font-bold tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl"
          >
            {HOME_HERO.title}
            <br />
            <span className="text-brand-light">{HOME_HERO.titleAccent}</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-5 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg"
          >
            {HOME_HERO.description}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              href={HOME_HERO.primaryCta.href}
              className="inline-flex items-center rounded-lg bg-brand-leaf px-6 py-3 text-sm font-semibold text-brand-deep shadow-md transition-[color,background-color,box-shadow,transform] duration-200 hover:bg-brand-light hover:shadow-lg motion-safe:active:scale-[0.98]"
            >
              {HOME_HERO.primaryCta.label}
            </Link>
            <Link
              href={HOME_HERO.secondaryCta.href}
              className="inline-flex items-center rounded-lg border border-white/45 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-[color,background-color,border-color,transform] duration-200 hover:border-white hover:bg-white/15 motion-safe:active:scale-[0.98]"
            >
              {HOME_HERO.secondaryCta.label}
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <span className="sr-only" aria-live="polite">
        {HOME_HERO_SLIDES_MOBILE[active % HOME_HERO_SLIDES_MOBILE.length].alt}
      </span>

      {!reduceMotion && slideCount > 1 ? (
        <div
          className="pointer-events-none absolute bottom-6 left-1/2 z-[3] flex -translate-x-1/2 gap-2"
          aria-hidden
        >
          {Array.from({ length: slideCount }, (_, index) => (
            <span
              key={index}
              className={`h-1 rounded-full transition-[width,background-color] duration-500 ease-out ${
                index === active % slideCount
                  ? 'w-8 bg-brand-leaf'
                  : 'w-1.5 bg-white/35'
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
