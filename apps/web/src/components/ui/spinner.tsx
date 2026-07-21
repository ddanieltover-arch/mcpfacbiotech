import { cn } from '@/lib/utils';

export function Spinner({ className, label = 'Loading' }: { className?: string; label?: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        'h-5 w-5 animate-spin rounded-full border-2 border-brand-leaf border-t-transparent',
        className,
      )}
    />
  );
}
