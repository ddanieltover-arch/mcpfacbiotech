import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { syncProfileWithBackend } from '@/lib/auth-sync';
import type { User } from '@supabase/supabase-js';

// ──────────────────────────────────────────────────────────────────────────────
// Auth Store (Volume 3 — Client-Side State Management)
// Tracks the current Supabase user on the client and subscribes to
// real-time auth state changes (sign in, sign out, token refresh).
// ──────────────────────────────────────────────────────────────────────────────

interface AuthState {
  /** The currently authenticated Supabase user, or null. */
  user: User | null;
  /** Whether the initial session check is still in progress. */
  isLoading: boolean;
  /** Initialize the store: read the current session and subscribe to changes. */
  initialize: () => () => void;
}

async function syncSessionProfile(accessToken: string | undefined): Promise<void> {
  if (!accessToken) return;

  try {
    await syncProfileWithBackend(accessToken);
  } catch (error) {
    console.error('Profile sync failed:', error);
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  initialize: () => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ user: session?.user ?? null, isLoading: false });
      void syncSessionProfile(session?.access_token);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      set({ user: session?.user ?? null, isLoading: false });

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
        void syncSessionProfile(session?.access_token);
      }

      if (event === 'SIGNED_IN') {
        void import('@/stores/cart.store').then(({ useCartStore }) => {
          void useCartStore.getState().mergeOnLogin();
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  },
}));
