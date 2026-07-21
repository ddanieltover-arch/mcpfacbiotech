'use client';

import { COMPARISON_ROWS } from '@/lib/marketing-content';
import { cn } from '@/lib/utils';

type Row = { metric: string; mcpfac: string; industry: string };

type ComparisonTableProps = {
  rows?: ReadonlyArray<Row>;
  mcpfacLabel?: string;
  industryLabel?: string;
  className?: string;
};

export function ComparisonTable({
  rows = COMPARISON_ROWS,
  mcpfacLabel = 'MCPFAC BIOTECH',
  industryLabel = 'Industry average',
  className,
}: ComparisonTableProps) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm',
        className,
      )}
    >
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-neutral-200 bg-brand-pale/40">
          <tr>
            <th className="px-4 py-3 font-heading font-semibold text-brand-deep">Service metric</th>
            <th className="px-4 py-3 font-heading font-semibold text-brand-deep">{mcpfacLabel}</th>
            <th className="px-4 py-3 font-heading font-semibold text-neutral-500">{industryLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.metric} className="border-b border-neutral-100 last:border-0">
              <td className="px-4 py-3 font-medium text-neutral-800">{row.metric}</td>
              <td className="px-4 py-3 text-brand-deep">{row.mcpfac}</td>
              <td className="px-4 py-3 text-neutral-500">{row.industry}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
