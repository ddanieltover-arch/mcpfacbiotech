import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type AdminTableSkeletonProps = {
  rows?: number;
  cols?: number;
  className?: string;
};

export function AdminTableSkeleton({
  rows = 6,
  cols = 5,
  className,
}: AdminTableSkeletonProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-neutral-200 bg-white',
        className,
      )}
      role="status"
      aria-label="Loading table"
    >
      <div className="flex gap-4 border-b border-neutral-200 bg-neutral-50 px-4 py-3">
        {Array.from({ length: cols }).map((_, index) => (
          <Skeleton key={`head-${index}`} className="h-3 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={`row-${row}`} className="flex items-center gap-4 px-4 py-3.5">
            {Array.from({ length: cols }).map((_, col) => (
              <Skeleton
                key={`cell-${row}-${col}`}
                className={cn('h-4 flex-1', col === 0 && 'max-w-[40%]')}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

type AdminDashboardSkeletonProps = {
  className?: string;
};

export function AdminDashboardSkeleton({ className }: AdminDashboardSkeletonProps) {
  return (
    <div className={cn('space-y-8', className)} role="status" aria-label="Loading dashboard">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-neutral-200 bg-white p-5"
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-9 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-neutral-200 bg-white p-5"
          >
            <Skeleton className="h-5 w-36" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
