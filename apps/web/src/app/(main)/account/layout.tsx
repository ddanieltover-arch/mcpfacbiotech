import { AccountNav } from '@/components/account/account-nav';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-neutral-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-xl border border-neutral-200 bg-white p-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Account
          </p>
          <AccountNav />
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
