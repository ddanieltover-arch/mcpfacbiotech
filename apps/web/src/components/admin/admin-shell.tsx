'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { isAdminRole } from '@mcpfac/shared-types';
import { useAuthStore } from '@/stores/auth.store';
import { AdminNav } from '@/components/admin/admin-nav';
import { OpsSurface } from '@/components/layout/ops-surface';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const authLoading = useAuthStore((s) => s.isLoading);
  const [ready, setReady] = useState(false);
  const [profileWaitTimedOut, setProfileWaitTimedOut] = useState(false);
  // Once admin access is proven, keep the shell mounted so pathname auth refresh
  // cannot unmount order detail mid-fetch.
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [lastAdminRole, setLastAdminRole] = useState('ADMINISTRATOR');

  useEffect(() => {
    if (!authLoading) {
      setReady(true);
    }
  }, [authLoading]);

  useEffect(() => {
    if (profile && isAdminRole(profile.role)) {
      setAdminUnlocked(true);
      setLastAdminRole(profile.role);
    }
    if (!user) {
      setAdminUnlocked(false);
    }
  }, [profile, user]);

  useEffect(() => {
    if (!user || profile || authLoading || adminUnlocked) {
      setProfileWaitTimedOut(false);
      return;
    }
    const timer = window.setTimeout(() => setProfileWaitTimedOut(true), 15_000);
    return () => window.clearTimeout(timer);
  }, [user, profile, authLoading, adminUnlocked]);

  const isAdmin = Boolean(profile && isAdminRole(profile.role)) || adminUnlocked;

  // Session can resolve before /auth/sync populates `profile` — wait for it.
  if (!ready || authLoading || (user && !profile && !adminUnlocked && !profileWaitTimedOut)) {
    return <p className="px-4 py-16 text-center text-neutral-500">Loading admin…</p>;
  }

  if (!isAdmin) {
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

  const roleLabel = (profile?.role ?? lastAdminRole).replace(/_/g, ' ');

  return (
    <OpsSurface className="bg-neutral-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-xl border border-neutral-200 bg-white p-4">
          <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Admin
          </p>
          <p className="mb-3 px-3 text-xs text-neutral-500">{roleLabel}</p>
          <AdminNav />
        </aside>
        <div>{children}</div>
      </div>
    </OpsSurface>
  );
}
