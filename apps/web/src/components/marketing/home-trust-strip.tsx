'use client';

import { StatGrid } from '@/components/marketing/stat-grid';

/**
 * Compact trust signals placed below the hero fold (UX-MOTION-5).
 * Keeps the hero focused on headline + CTAs; stats animate in on scroll.
 */
export function HomeTrustStrip() {
  return (
    <section
      aria-label="Laboratory trust signals"
      className="border-y border-neutral-200/80 bg-white/90"
    >
      <div className="mx-auto max-w-7xl px-4 py-5 sm:py-6">
        <StatGrid variant="strip" />
        <p className="mx-auto mt-4 max-w-3xl text-center text-[11px] leading-relaxed text-neutral-500 sm:text-xs">
          Specs and batch documents vary by SKU. Confirm purity and COA availability on the product
          page before experimental use.
        </p>
      </div>
    </section>
  );
}
