'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { isAdminRole } from '@mcpfac/shared-types';
import { useAuthStore } from '@/stores/auth.store';
import { AdminNav } from '@/components/admin/admin-nav';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const profile = useAuthStore((s) => s.profile);
  const authLoading = useAuthStore((s) => s.isLoading);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      setReady(true);
    }
  }, [authLoading]);

  if (!ready || authLoading) {
    return <p className="px-4 py-16 text-center text-neutral-500">Loading admin…</p>;
  }

  if (!profile || !isAdminRole(profile.role)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold text-brand-deep">Admin access required</h1>
        <p className="mt-3 text-sm text-neutral-600">
          Your account does not have an administrator role. Promote a user with{' '}
          <code className="rounded bg-neutral-100 px-1">pnpm db:promote-admin</code>.
        </p>
        <Link href="/account" className="mt-6 inline-block text-sm font-medium text-brand-deep underline">
          Back to account
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-xl border border-neutral-200 bg-white p-4">
          <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Admin
          </p>
          <p className="mb-3 px-3 text-xs text-neutral-500">{profile.role.replace(/_/g, ' ')}</p>
          <AdminNav />
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
