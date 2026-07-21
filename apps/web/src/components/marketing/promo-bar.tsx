'use client';

import { CheckCircle2, FileCheck2, Truck } from 'lucide-react';
import { PROMO_BAR_ITEMS } from '@/lib/marketing-content';
import { cn } from '@/lib/utils';

const ICONS = {
  truck: Truck,
  check: CheckCircle2,
  file: FileCheck2,
} as const;

type PromoBarProps = {
  items?: ReadonlyArray<{ icon: keyof typeof ICONS; label: string }>;
  className?: string;
};

export function PromoBar({ items = PROMO_BAR_ITEMS, className }: PromoBarProps) {
  return (
    <div
      className={cn('border-b border-brand-deep/10 bg-brand-deep text-white', className)}
      role="note"
    >
      <ul className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-2.5 text-xs sm:text-sm">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <li key={item.label} className="inline-flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 shrink-0 text-brand-leaf" aria-hidden />
              <span className="font-medium tracking-wide">{item.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
