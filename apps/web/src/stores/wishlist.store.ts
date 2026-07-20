import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Wishlist store — client-side state with persistence.
 */

interface WishlistStore {
  productIds: string[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
  clearAll: () => void;
  count: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      productIds: [],

      addItem: (productId) => {
        set((state) => {
          if (state.productIds.includes(productId)) return state;
          return { productIds: [...state.productIds, productId] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        }));
      },

      toggleItem: (productId) => {
        const { productIds } = get();
        if (productIds.includes(productId)) {
          get().removeItem(productId);
        } else {
          get().addItem(productId);
        }
      },

      hasItem: (productId) => get().productIds.includes(productId),
      clearAll: () => set({ productIds: [] }),
      count: () => get().productIds.length,
    }),
    {
      name: 'mcpfac-wishlist',
    },
  ),
);
