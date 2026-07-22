import { AccountNav } from '@/components/account/account-nav';
import { OpsSurface } from '@/components/layout/ops-surface';

/** Persistent account sidebar shell for /account and portal routes (orders, quotes, invoices, wishlist). */
export function AccountShell({ children }: { children: React.ReactNode }) {
  return (
    <OpsSurface className="bg-neutral-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-xl border border-neutral-200 bg-white p-4 lg:sticky lg:top-24">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Account
          </p>
          <AccountNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </OpsSurface>
  );
}
