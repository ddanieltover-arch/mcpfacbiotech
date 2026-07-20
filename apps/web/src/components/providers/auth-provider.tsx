'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';

// ──────────────────────────────────────────────────────────────────────────────
// AuthProvider — Initializes the auth store on mount.
// Must be placed inside the root layout's Providers component.
// ──────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  return <>{children}</>;
}
