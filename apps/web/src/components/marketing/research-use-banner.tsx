import Link from 'next/link';
import { RESEARCH_USE_DISCLAIMER } from '@/lib/marketing-content';
import { cn } from '@/lib/utils';

type ResearchUseBannerProps = {
  text?: string;
  ctaHref?: string;
  ctaLabel?: string;
  className?: string;
};

export function ResearchUseBanner({
  text = RESEARCH_USE_DISCLAIMER,
  ctaHref = '/products',
  ctaLabel = 'Agree & browse catalog',
  className,
}: ResearchUseBannerProps) {
  return (
    <aside
      className={cn(
        'rounded-xl border border-brand-deep/15 bg-gradient-to-br from-brand-pale/80 via-white to-white p-6 sm:p-8',
        className,
      )}
      aria-label="Research use agreement"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-natural">
        Research-use agreement
      </p>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-700 sm:text-base">{text}</p>
      <ul className="mt-4 space-y-1 text-sm text-neutral-600">
        <li>· Not for human or animal consumption</li>
        <li>· For laboratory and R&D use only</li>
        <li>· Buyer assumes regulatory responsibility</li>
      </ul>
      <Link
        href={ctaHref}
        className="mt-6 inline-flex items-center rounded-lg bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-natural"
      >
        {ctaLabel}
      </Link>
    </aside>
  );
}
