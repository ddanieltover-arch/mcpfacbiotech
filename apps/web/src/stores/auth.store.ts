import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { fetchAuthMe, syncProfileWithBackend } from '@/lib/auth-sync';
import type { AuthUser } from '@mcpfac/shared-types';
import type { User } from '@supabase/supabase-js';

// ──────────────────────────────────────────────────────────────────────────────
// Auth Store (Volume 3 — Client-Side State Management)
// Tracks the current Supabase user on the client and subscribes to
// real-time auth state changes (sign in, sign out, token refresh).
// ──────────────────────────────────────────────────────────────────────────────

interface AuthState {
  /** The currently authenticated Supabase user, or null. */
  user: User | null;
  /** Backend AuthUser (includes role) after profile sync. */
  profile: AuthUser | null;
  /** Whether the initial session check is still in progress. */
  isLoading: boolean;
  /** Initialize the store: read the current session and subscribe to changes. */
  initialize: () => () => void;
}

async function syncSessionProfile(
  accessToken: string | undefined,
  set: (partial: Partial<AuthState>) => void,
): Promise<void> {
  if (!accessToken) {
    set({ profile: null });
    return;
  }

  try {
    const synced = await syncProfileWithBackend(accessToken);
    set({ profile: synced ?? (await fetchAuthMe(accessToken)) });
  } catch (error) {
    console.error('Profile sync failed:', error);
    try {
      set({ profile: await fetchAuthMe(accessToken) });
    } catch {
      set({ profile: null });
    }
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,

  initialize: () => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ user: session?.user ?? null, isLoading: false });
      void syncSessionProfile(session?.access_token, set);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      set({ user: session?.user ?? null, isLoading: false });

      if (event === 'SIGNED_OUT') {
        set({ profile: null });
        return;
      }

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
        void syncSessionProfile(session?.access_token, set);
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
