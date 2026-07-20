import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  initialize: () => {
    const supabase = createClient();

    // Read the current session on mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      set({ user, isLoading: false });
    });

    // Subscribe to auth state changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, isLoading: false });
    });

    // Return the unsubscribe function for cleanup
    return () => {
      subscription.unsubscribe();
    };
  },
}));
