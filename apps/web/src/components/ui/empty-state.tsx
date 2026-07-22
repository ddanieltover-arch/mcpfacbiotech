import type { ReactNode } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type EmptyStateAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
  className?: string;
  children?: ReactNode;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-neutral-200/80',
        className,
      )}
    >
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-pale text-brand-deep">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="font-heading text-xl font-semibold text-brand-deep">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">{description}</p>
      {action ? (
        action.href ? (
          <Link
            href={action.href}
            onClick={action.onClick}
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white transition-[color,background-color] duration-200 hover:bg-brand-natural motion-safe:active:scale-[0.98] in-data-[motion=reduce]:transform-none in-data-[motion=reduce]:active:scale-100"
          >
            {action.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white transition-[color,background-color] duration-200 hover:bg-brand-natural motion-safe:active:scale-[0.98] in-data-[motion=reduce]:transform-none in-data-[motion=reduce]:active:scale-100"
          >
            {action.label}
          </button>
        )
      ) : null}
      {children}
    </div>
  );
}
