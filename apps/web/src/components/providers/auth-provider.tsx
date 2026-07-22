'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

// ──────────────────────────────────────────────────────────────────────────────
// AuthProvider — Initializes the auth store on mount.
// Must be placed inside the root layout's Providers component.
// ──────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  const refreshSession = useAuthStore((s) => s.refreshSession);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  // Server-action auth (login/logout) updates cookies without firing onAuthStateChange.
  useEffect(() => {
    void refreshSession();
  }, [pathname, refreshSession]);

  return <>{children}</>;
}
